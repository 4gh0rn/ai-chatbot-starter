"use server";

import { fetchMutation, fetchQuery } from "convex/nextjs";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { generateHashedPassword } from "@/lib/db/utils";
import { compare } from "bcrypt-ts";
import { FEATURE_TWO_FACTOR_AUTH } from "@/lib/feature-flags";
import speakeasy from "speakeasy";

import { signIn } from "./auth";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data" | "requires_2fa";
  email?: string;
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Check if 2FA is enabled for this user before signing in
    if (FEATURE_TWO_FACTOR_AUTH) {
      const user = await fetchQuery(api.users.getUserByEmail, {
        email: validatedData.email,
      });

      if (user?.password) {
        const passwordsMatch = await compare(validatedData.password, user.password);
        
        if (passwordsMatch && user.twoFactorEnabled) {
          // Password is correct but user has 2FA enabled
          return { 
            status: "requires_2fa", 
            email: validatedData.email 
          };
        }
      }
    }

    // Proceed with normal login
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export type RegisterActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const existing = await fetchQuery(api.users.getUserByEmail, {
      email: validatedData.email,
    });
    if (existing) {
      return { status: "user_exists" } as RegisterActionState;
    }
    await fetchMutation(api.users.createUser, {
      email: validatedData.email,
      password: generateHashedPassword(validatedData.password),
      type: "regular",
    });
    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

// 2FA Login Action
export type TwoFactorLoginActionState = {
  status: "idle" | "success" | "failed" | "invalid_code";
};

export const verifyTwoFactorLogin = async (
  _: TwoFactorLoginActionState,
  formData: FormData
): Promise<TwoFactorLoginActionState> => {
  try {
    const email = formData.get("email") as string;
    const token = formData.get("token") as string;
    const isBackupCode = formData.get("isBackupCode") === "true";

    if (!email || !token) {
      return { status: "invalid_code" };
    }

    // Get user data including 2FA secret
    const user = await fetchQuery(api.users.getUserByEmail, { email });

    if (!user) {
      return { status: "invalid_code" };
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return { status: "invalid_code" };
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
      // Verify TOTP token using speakeasy directly
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: token.replace(/\s/g, ""), // Remove any spaces
        window: 1, // Allow some time drift
      });
    }

    if (!verified) {
      return { status: "invalid_code" };
    }

    // If verification successful, use special bypass to complete login
    await signIn("credentials", {
      email: email,
      password: "2fa-verified-bypass",
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    console.error("2FA verification error:", error);
    return { status: "failed" };
  }
};
