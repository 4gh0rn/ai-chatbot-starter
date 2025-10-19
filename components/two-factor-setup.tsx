"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Copy, Download, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/toast";

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"setup" | "verify" | "backup">("setup");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to setup 2FA");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep("verify");
    } catch (error) {
      toast({
        type: "error",
        description: "Failed to setup 2FA. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      toast({
        type: "error",
        description: "Please enter a 6-digit code from your authenticator app.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      const data = await response.json();
      
      if (data.firstTimeSetup && data.backupCodes) {
        setBackupCodes(data.backupCodes);
        setStep("backup");
      } else {
        toast({
          type: "success",
          description: "Two-factor authentication has been enabled.",
        });
        onComplete?.();
      }
    } catch (error) {
      toast({
        type: "error",
        description: "The verification code is incorrect. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      type: "success",
      description: "Secret key copied to clipboard",
    });
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    toast({
      type: "success",
      description: "Backup codes copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-chatbot-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    toast({
      type: "success",
      description: "Two-factor authentication is now active on your account.",
    });
    onComplete?.();
  };

  if (step === "setup") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by enabling 2FA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              You'll need an authenticator app like Google Authenticator, Authy, or 1Password.
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleSetup} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Setting up..." : "Start Setup"}
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "verify") {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Scan this QR code with your authenticator app, then enter the 6-digit code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
          </div>

          {/* Manual Entry */}
          <div className="space-y-2">
            <Label htmlFor="secret">Manual Entry Key</Label>
            <div className="flex space-x-2">
              <Input
                id="secret"
                value={showSecret ? secret : "•".repeat(secret.length)}
                readOnly
                className="bg-muted font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copySecret}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Verification */}
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
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleVerify} 
              disabled={loading || token.length !== 6}
              className="flex-1"
            >
              {loading ? "Verifying..." : "Verify & Enable"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setStep("setup")}
              disabled={loading}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "backup") {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>2FA Enabled Successfully</span>
          </CardTitle>
          <CardDescription>
            Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-background p-2 rounded text-center">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Each backup code can only be used once. Store them in a secure password manager or print them out.
            </p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={copyBackupCodes} variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy Codes
            </Button>
            <Button onClick={downloadBackupCodes} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <Button onClick={handleComplete} className="w-full">
            I've Saved My Backup Codes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}