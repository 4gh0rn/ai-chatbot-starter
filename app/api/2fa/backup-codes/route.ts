import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import speakeasy from "speakeasy";
import { FEATURE_TWO_FACTOR_AUTH } from "@/lib/feature-flags";

export async function POST(request: NextRequest) {
  if (!FEATURE_TWO_FACTOR_AUTH) {
    return NextResponse.json(
      { error: "Two-factor authentication is not enabled" },
      { status: 404 }
    );
  }

  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required to regenerate backup codes" },
        { status: 400 }
      );
    }

    // Get user data including 2FA secret
    const user = await fetchQuery(api.users.getUserById, {
      id: session.user.id as any,
    });

    if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is not enabled" },
        { status: 400 }
      );
    }

    // Verify the token before regenerating backup codes
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token.replace(/\s/g, ""), // Remove any spaces
      window: 1, // Allow some time drift
    });

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    // Regenerate backup codes using Convex mutation
    const result = await fetchMutation(api.users.regenerateBackupCodes, {
      userId: session.user.id as any,
    });

    return NextResponse.json({
      success: true,
      backupCodes: result.backupCodes,
    });
  } catch (error) {
    console.error("Backup codes regeneration error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate backup codes" },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!FEATURE_TWO_FACTOR_AUTH) {
    return NextResponse.json(
      { error: "Two-factor authentication is not enabled" },
      { status: 404 }
    );
  }

  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user data
    const user = await fetchQuery(api.users.getUserById, {
      id: session.user.id as any,
    });

    if (!user?.twoFactorEnabled) {
      return NextResponse.json(
        { error: "2FA is not enabled" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      hasBackupCodes: Boolean(user.backupCodes?.length),
      remainingCodes: user.backupCodes?.length || 0,
    });
  } catch (error) {
    console.error("Backup codes check error:", error);
    return NextResponse.json(
      { error: "Failed to check backup codes" },
      { status: 500 }
    );
  }
}