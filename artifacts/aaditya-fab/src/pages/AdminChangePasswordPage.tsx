import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { KeyRound, Send, ShieldCheck, Eye, EyeOff, CheckCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetAdminSession, useAdminLogout, getGetAdminSessionQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type Step = "request" | "verify" | "done";

export default function AdminChangePasswordPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("request");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Change Password | Admin | Aadity Fabrication Works";
  }, []);

  const { data: session, isLoading: sessionLoading } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });

  const logout = useAdminLogout();

  useEffect(() => {
    if (!sessionLoading && !session?.authenticated) {
      setLocation("/admin");
    }
  }, [session, sessionLoading, setLocation]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin");
      },
    });
  };

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/request-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep("verify");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP + set new password
  const handleChangePassword = async () => {
    setError("");
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) return <div className="p-8 text-sm text-muted-foreground">Checking session…</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin nav */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <button className="text-xs text-white/70 hover:text-accent transition-colors">← Dashboard</button>
          </Link>
          <span className="font-bold text-sm">Change Password</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60">{session?.email}</span>
          <Button size="sm" variant="ghost" onClick={handleLogout} className="text-white/70 hover:text-white h-7 text-xs">
            <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-16">
        {/* Step: Done */}
        {step === "done" && (
          <Card className="text-center">
            <CardContent className="pt-10 pb-8">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Password Changed</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your admin password has been updated successfully. Use your new password next time you log in.
              </p>
              <Link href="/admin/dashboard">
                <Button className="bg-accent hover:bg-accent/90 text-white">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Step: Request OTP */}
        {step === "request" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-1">
                <KeyRound className="w-6 h-6 text-accent" />
                <CardTitle className="text-lg">Change Admin Password</CardTitle>
              </div>
              <CardDescription>
                We will send a 6-digit OTP to your registered email{" "}
                <span className="font-medium text-foreground">{session?.email}</span>,
                WhatsApp, and Telegram (if configured).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/60 border border-border p-4 text-sm space-y-1.5">
                <p className="font-semibold text-foreground">OTP will be sent to:</p>
                <p className="text-muted-foreground">📧 Email: <span className="text-foreground">{session?.email}</span></p>
                <p className="text-muted-foreground">📱 WhatsApp: +91-9019565420 (if configured)</p>
                <p className="text-muted-foreground">✈️ Telegram: your registered chat (if configured)</p>
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <Button
                className="w-full bg-accent hover:bg-accent/90 text-white"
                onClick={handleRequestOtp}
                disabled={loading}
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Sending OTP…" : "Send OTP"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Verify OTP + new password */}
        {step === "verify" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-1">
                <ShieldCheck className="w-6 h-6 text-accent" />
                <CardTitle className="text-lg">Enter OTP & New Password</CardTitle>
              </div>
              <CardDescription>
                Check your email, WhatsApp, and Telegram for the 6-digit OTP. It expires in 10 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="otp" className="text-sm font-medium">6-Digit OTP *</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="e.g. 482931"
                  className="mt-1 text-center text-xl tracking-widest font-bold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-sm font-medium">New Password *</Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password *</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  className="mt-1"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setStep("request"); setError(""); setOtp(""); }}
                  disabled={loading}
                >
                  Resend OTP
                </Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90 text-white"
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? "Updating…" : "Change Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
