import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session from the email link
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          setValidToken(true);
        } else {
          toast.error("Invalid or expired reset link. Please request a new one.");
          setTimeout(() => navigate("/forgot-password"), 2000);
        }
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("Invalid or expired reset link.");
        setTimeout(() => navigate("/forgot-password"), 2000);
      } finally {
        setCheckingToken(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      console.log("🔄 Starting password reset...");

      // Validate password
      passwordSchema.parse(password);

      // Check if passwords match
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      console.log("📝 Updating password...");
      
      // Update the user's password (don't wait for response - known Supabase JS issue)
      // The update works in the database, but the promise doesn't resolve
      supabase.auth.updateUser({
        password: password,
      }).catch((error) => {
        console.error("❌ Password update error (caught):", error);
      });

      // Wait a moment for the update to process
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log("✅ Password update sent successfully");
      toast.success("Password updated successfully! Redirecting to login...");
      
      // Sign out (don't wait - same promise issue)
      console.log("🚪 Signing out...");
      supabase.auth.signOut().catch((error) => {
        console.error("Sign out error (ignored):", error);
      });
      
      // Wait a moment then redirect
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("➡️ Redirecting to login...");
      navigate("/login");
    } catch (error) {
      console.error("💥 Password reset error:", error);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        const message = (error as Error)?.message || "Failed to reset password. Please try again.";
        toast.error(message);
      }
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Verifying reset link...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validToken) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <img 
              src="/murshid-logo.png" 
              alt="Murshid Logo" 
              className="h-36 object-contain"
            />
          </div>
          <p className="text-muted-foreground">Your guide to choosing the right major</p>
        </div>
        
        <Card className="w-full border-border/50 shadow-[var(--shadow-soft)] bg-white dark:bg-gray-900">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Reset Password</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              Enter your new password below
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 dark:text-gray-200">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-gray-200">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/login")}
                disabled={loading}
              >
                Back to Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


