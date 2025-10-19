import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
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

    if (session.user.type === "guest") {
      return NextResponse.json(
        { error: "2FA not available for guest accounts" },
        { status: 403 }
      );
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `AI Chatbot (${session.user.email})`,
      issuer: "AI Chatbot",
      length: 32,
    });

    // Save the secret to the database (but don't enable 2FA yet)
    await fetchMutation(api.users.setupTwoFactor, {
      userId: session.user.id as any,
      secret: secret.base32,
    });

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url as string);

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeDataURL,
      manualEntryKey: secret.base32,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup 2FA" },
      { status: 500 }
    );
  }
}