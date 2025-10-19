"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Key, Shield } from "lucide-react";
import { toast } from "@/components/toast";
import { verifyTwoFactorLogin } from "@/app/(auth)/actions";

interface TwoFactorVerificationProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorVerification({ email, onSuccess, onCancel }: TwoFactorVerificationProps) {
  const [token, setToken] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("authenticator");

  const handleVerify = async (code: string, isBackupCode: boolean = false) => {
    if (!code || (isBackupCode ? code.length !== 6 : code.length !== 6)) {
      toast({
        type: "error",
        description: `Please enter a valid ${isBackupCode ? "backup" : "verification"} code.`,
      });
      return;
    }

    setLoading(true);
    try {
      // Create FormData for the server action
      const formData = new FormData();
      formData.append("email", email);
      formData.append("token", code);
      formData.append("isBackupCode", isBackupCode.toString());

      const result = await verifyTwoFactorLogin({ status: "idle" }, formData);

      if (result.status === "success") {
        toast({
          type: "success",
          description: "Authentication successful!",
        });
        onSuccess();
      } else if (result.status === "invalid_code") {
        toast({
          type: "error",
          description: "Invalid verification code. Please try again.",
        });
      } else {
        toast({
          type: "error",
          description: "Verification failed. Please try again.",
        });
      }
    } catch (error) {
      toast({
        type: "error",
        description: error instanceof Error ? error.message : "The code is incorrect. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticatorSubmit = () => {
    handleVerify(token, false);
  };

  const handleBackupCodeSubmit = () => {
    handleVerify(backupCode, true);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Two-Factor Authentication</span>
        </CardTitle>
        <CardDescription>
          Enter the verification code to complete your sign-in to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="authenticator" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Authenticator</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Backup Code</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="authenticator" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                type="text"
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
                autoFocus
              />
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Enter the 6-digit code from your authenticator app.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button 
                onClick={handleAuthenticatorSubmit}
                disabled={loading || token.length !== 6}
                className="flex-1"
              >
                {loading ? "Verifying..." : "Verify"}
              </Button>
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="backup-code">Backup Code</Label>
              <Input
                id="backup-code"
                type="text"
                placeholder="XXXXXX"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                className="text-center text-xl tracking-widest uppercase"
                maxLength={6}
              />
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Enter one of your backup codes. Each code can only be used once.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button 
                onClick={handleBackupCodeSubmit}
                disabled={loading || backupCode.length !== 6}
                className="flex-1"
              >
                {loading ? "Verifying..." : "Use Backup Code"}
              </Button>
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}