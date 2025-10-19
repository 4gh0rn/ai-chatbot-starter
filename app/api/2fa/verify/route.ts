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
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Get user data including 2FA secret
    const user = await fetchQuery(api.users.getUserById, {
      id: session.user.id as any,
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA not set up" },
        { status: 400 }
      );
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token.replace(/\s/g, ""), // Remove any spaces
      window: 1, // Allow some time drift
    });

    if (!verified) {
      // Check if it's a backup code
      if (user.backupCodes && user.backupCodes.includes(token)) {
        await fetchMutation(api.users.useBackupCode, {
          userId: session.user.id as any,
          code: token,
        });
        return NextResponse.json({ success: true, usedBackupCode: true });
      }

      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    // If this is the first verification, enable 2FA and generate backup codes
    if (!user.twoFactorEnabled) {
      const result = await fetchMutation(api.users.enableTwoFactor, {
        userId: session.user.id as any,
      });

      return NextResponse.json({
        success: true,
        backupCodes: result.backupCodes,
        firstTimeSetup: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}