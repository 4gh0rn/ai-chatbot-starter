"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TwoFactorSetup } from "@/components/two-factor-setup";
import { TwoFactorManagement } from "@/components/two-factor-management";
import { Shield, Settings, User } from "lucide-react";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { twoFactorAuth } = useFeatureFlags();
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (session?.user?.twoFactorEnabled) {
      setTwoFactorEnabled(true);
    }
  }, [session]);

  const handleTwoFactorSetupComplete = () => {
    setShowTwoFactorSetup(false);
    setTwoFactorEnabled(true);
    // Session will be updated automatically by SessionProvider
  };

  const handleTwoFactorStatusChange = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    // Session will be updated automatically by SessionProvider
  };

  if (!session) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to access settings.</p>
        </div>
      </div>
    );
  }

  if (showTwoFactorSetup) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => setShowTwoFactorSetup(false)}
            className="mb-4"
          >
            ← Back to Settings
          </Button>
        </div>
        <TwoFactorSetup
          onComplete={handleTwoFactorSetupComplete}
          onCancel={() => setShowTwoFactorSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="flex items-center space-x-2 font-bold text-3xl">
          <Settings className="h-8 w-8" />
          <span>Account Settings</span>
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Your account details and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="font-medium text-sm">Email</label>
              <p className="text-muted-foreground text-sm">{session.user.email}</p>
            </div>
            <div>
              <label className="font-medium text-sm">Account Type</label>
              <p className="text-muted-foreground text-sm capitalize">
                {session.user.type === "guest" ? "Guest Account" : "Regular Account"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        {twoFactorAuth && session.user.type !== "guest" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
              <CardDescription>
                Manage your account security and two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!twoFactorEnabled ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">Two-Factor Authentication</h3>
                    <p className="text-muted-foreground text-sm">
                      Add an extra layer of security to your account by enabling 2FA.
                    </p>
                  </div>
                  <Button onClick={() => setShowTwoFactorSetup(true)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              ) : (
                <TwoFactorManagement
                  isEnabled={twoFactorEnabled}
                  onStatusChange={handleTwoFactorStatusChange}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Guest Account Notice */}
        {session.user.type === "guest" && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200">
                Guest Account Limitations
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                Guest accounts have limited features and data is not permanently stored.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                To access all features including two-factor authentication, please create a regular account.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}