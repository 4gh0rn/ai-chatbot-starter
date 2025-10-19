"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Copy, Download, Shield, ShieldOff } from "lucide-react";
import { toast } from "@/components/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TwoFactorManagementProps {
  isEnabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

export function TwoFactorManagement({ isEnabled, onStatusChange }: TwoFactorManagementProps) {
  const [loading, setLoading] = useState(false);
  const [disableToken, setDisableToken] = useState("");
  const [backupCodesToken, setBackupCodesToken] = useState("");
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [backupCodesInfo, setBackupCodesInfo] = useState<{
    hasBackupCodes: boolean;
    remainingCodes: number;
  } | null>(null);

  useEffect(() => {
    if (isEnabled) {
      checkBackupCodes();
    }
  }, [isEnabled]);

  const checkBackupCodes = async () => {
    try {
      const response = await fetch("/api/2fa/backup-codes");
      if (response.ok) {
        const data = await response.json();
        setBackupCodesInfo(data);
      }
    } catch (error) {
      console.error("Failed to check backup codes:", error);
    }
  };

  const handleDisable2FA = async () => {
    if (!disableToken || disableToken.length !== 6) {
      toast({
        type: "error",
        description: "Please enter a 6-digit code from your authenticator app.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: disableToken }),
      });

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      toast({
        type: "success",
        description: "Two-factor authentication has been disabled.",
      });
      setShowDisableDialog(false);
      setDisableToken("");
      onStatusChange?.(false);
    } catch (error) {
      toast({
        type: "error",
        description: "The verification code is incorrect. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!backupCodesToken || backupCodesToken.length !== 6) {
      toast({
        type: "error",
        description: "Please enter a 6-digit code from your authenticator app.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/2fa/backup-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: backupCodesToken }),
      });

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      const data = await response.json();
      setNewBackupCodes(data.backupCodes);
      setBackupCodesToken("");
      checkBackupCodes(); // Refresh backup codes info
      
      toast({
        type: "success",
        description: "New backup codes have been generated. Save them securely.",
      });
    } catch (error) {
      toast({
        type: "error",
        description: "The verification code is incorrect. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = newBackupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    toast({
      type: "success",
      description: "Backup codes copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    const codesText = newBackupCodes.join("\n");
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

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isEnabled ? (
              <>
                <Shield className="h-5 w-5 text-green-600" />
                <span>Two-Factor Authentication Enabled</span>
              </>
            ) : (
              <>
                <ShieldOff className="h-5 w-5 text-gray-400" />
                <span>Two-Factor Authentication Disabled</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isEnabled
              ? "Your account is protected with two-factor authentication."
              : "Enable 2FA to add an extra layer of security to your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEnabled && (
            <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Disable 2FA
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>Disable Two-Factor Authentication</span>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the extra security layer from your account. 
                    Enter a verification code from your authenticator app to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="disable-token">Verification Code</Label>
                    <Input
                      id="disable-token"
                      type="text"
                      placeholder="000000"
                      value={disableToken}
                      onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDisableToken("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDisable2FA}
                    disabled={loading || disableToken.length !== 6}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {loading ? "Disabling..." : "Disable 2FA"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>

      {/* Backup Codes Card */}
      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Backup Codes</CardTitle>
            <CardDescription>
              Use backup codes to access your account if you lose your authenticator device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {backupCodesInfo && (
              <div className="text-sm text-muted-foreground">
                {backupCodesInfo.hasBackupCodes ? (
                  <p>You have {backupCodesInfo.remainingCodes} backup codes remaining.</p>
                ) : (
                  <p>You don't have any backup codes yet.</p>
                )}
              </div>
            )}

            <AlertDialog open={showBackupCodesDialog} onOpenChange={setShowBackupCodesDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  Generate New Backup Codes
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Generate New Backup Codes</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will invalidate any existing backup codes. Enter a verification 
                    code from your authenticator app to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="backup-codes-token">Verification Code</Label>
                    <Input
                      id="backup-codes-token"
                      type="text"
                      placeholder="000000"
                      value={backupCodesToken}
                      onChange={(e) => setBackupCodesToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setBackupCodesToken("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRegenerateBackupCodes}
                    disabled={loading || backupCodesToken.length !== 6}
                  >
                    {loading ? "Generating..." : "Generate Codes"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* New Backup Codes Display */}
            {newBackupCodes.length > 0 && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {newBackupCodes.map((code, index) => (
                      <div key={index} className="bg-background p-2 rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Save these codes in a secure place. Each code can only be used once.
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={copyBackupCodes} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadBackupCodes} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}