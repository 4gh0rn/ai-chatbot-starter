"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { AuthForm } from "@/components/auth-form";
import { SubmitButton } from "@/components/submit-button";
import { TwoFactorVerification } from "@/components/two-factor-verification";
import { toast } from "@/components/toast";
import { type LoginActionState, login } from "../../actions";

export default function LoginFormPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: "idle",
    }
  );
  const { update: updateSession } = useSession();

  useEffect(() => {
    if (state.status === "failed") {
      toast({ type: "error", description: "Invalid credentials!" });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Failed validating your submission!",
      });
    } else if (state.status === "requires_2fa" && state.email) {
      setEmail(state.email);
      setShowTwoFactor(true);
    } else if (state.status === "success") {
      setIsSuccessful(true);
      // Update session and navigate with delay to ensure state is ready
      updateSession().then(() => {
        setTimeout(() => router.push("/chat"), 200);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  const handle2FASuccess = () => {
    setIsSuccessful(true);
    updateSession().then(() => {
      setTimeout(() => router.push("/chat"), 200);
    });
  };

  const handle2FACancel = () => {
    setShowTwoFactor(false);
    setEmail("");
  };

  if (showTwoFactor) {
    return (
      <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
        <TwoFactorVerification
          email={email}
          onSuccess={handle2FASuccess}
          onCancel={handle2FACancel}
        />
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl">Sign In</h3>
          <p className="text-muted-foreground text-sm">
            Use your email and password to sign in
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
          <p className="mt-4 text-center text-muted-foreground text-sm">
            {"Don't have an account? "}
            <Link className="font-semibold hover:underline" href="/register">
              Sign up
            </Link>
            {" for free."}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
