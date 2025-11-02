import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import { useI18n } from "@/contexts/I18nContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, login, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useI18n();

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().trim().email({ message: t("auth.errors.invalidEmail") }).max(255),
        password: z
          .string()
          .min(6, { message: t("auth.errors.passwordMin", { count: 6 }) })
          .max(100),
      }),
    [language, t],
  );

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      loginSchema.parse({ email, password });
      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await loginAsGuest();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/30 p-4"
      dir={language}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <img 
              src="/murshid-logo.png" 
              alt="Murshid Logo" 
              className="h-36 object-contain dark:brightness-0 dark:invert dark:opacity-90"
            />
          </div>
          <p className="text-muted-foreground">{t("auth.tagline")}</p>
        </div>

        <Card className="border-border/50 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/">
                <Button 
                  variant="outline"
                  className="rounded-2xl px-3 py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <ArrowLeft className={`w-4 h-4 ${language === "ar" ? "ml-2 rotate-180" : "mr-2"}`} />
                  {t("auth.actions.backToHome")}
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 dark:text-gray-100">{t("auth.login.title")}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {t("auth.login.subtitle")}
                </CardDescription>
              </div>
              <Shield className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-gray-200">
                  {t("auth.fields.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.placeholders.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 dark:text-gray-200">
                  {t("auth.fields.password")}
                </Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl px-8 py-6 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className={`${language === "ar" ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`}
                    />
                    {t("auth.login.loading")}
                  </>
                ) : (
                  t("auth.login.submit")
                )}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background dark:bg-gray-900 px-2 text-muted-foreground">
                    {t("auth.common.or")}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-2xl px-8 py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                {t("auth.common.continueAsGuest")}
              </Button>
            </form>

            <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("auth.login.noAccount") + " "}
                <Link to="/signup" className="text-primary hover:underline font-semibold">
                  {t("auth.login.signUp")}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                <Link to="/forgot-password" className="text-primary hover:underline font-semibold">
                  {t("auth.login.forgot")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("auth.common.agreement")}
        </p>
      </div>
    </div>
  );
};

export default Login;
