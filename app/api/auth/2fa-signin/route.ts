import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/app/(auth)/auth";
import { FEATURE_TWO_FACTOR_AUTH } from "@/lib/feature-flags";

export async function POST(request: NextRequest) {
  if (!FEATURE_TWO_FACTOR_AUTH) {
    return NextResponse.json(
      { error: "Two-factor authentication is not enabled" },
      { status: 404 }
    );
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Create a special password that bypasses 2FA check in auth.ts
    const result = await signIn("credentials", {
      email,
      password: "2fa-verified-bypass",
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json(
        { error: "Sign in failed" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA sign in error:", error);
    return NextResponse.json(
      { error: "Failed to sign in after 2FA" },
      { status: 500 }
    );
  }
}