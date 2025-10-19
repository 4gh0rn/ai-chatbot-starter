import { NextRequest, NextResponse } from "next/server";
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
    const { email, token, isBackupCode } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    // Get user data including 2FA secret
    const user = await fetchQuery(api.users.getUserByEmail, { email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "2FA is not enabled for this user" },
        { status: 400 }
      );
    }

    let verified = false;

    if (isBackupCode) {
      // Verify backup code
      if (user.backupCodes && user.backupCodes.includes(token.toUpperCase())) {
        await fetchMutation(api.users.useBackupCode, {
          userId: user._id,
          code: token.toUpperCase(),
        });
        verified = true;
      }
    } else {
      // Verify TOTP token
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token.replace(/\s/g, ""), // Remove any spaces
        window: 1, // Allow some time drift
      });
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // For now, just return success - the client will handle the login
    // TODO: Implement proper session management for 2FA
    return NextResponse.json({ 
      success: true,
      usedBackupCode: isBackupCode,
      email: user.email,
      userId: user._id
    });
  } catch (error) {
    console.error("2FA login verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}