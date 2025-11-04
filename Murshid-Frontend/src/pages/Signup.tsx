import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BookOpen, Users, UserCheck, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import PasswordValidationPopup from "@/components/PasswordValidationPopup";
import PasswordInput from "@/components/PasswordInput";
import { useI18n } from "@/contexts/I18nContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [establishment_name, setEstablishmentName] = useState("");
  const [level, setLevel] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");
  const [student_type, setStudentType] = useState("");
  const [track, setTrack] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const { user, signup, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useI18n();

  const signupSchema = useMemo(
    () =>
      z
        .object({
          email: z.string().trim().email({ message: t("auth.errors.invalidEmail") }).max(255),
          password: z
            .string()
            .min(8, { message: t("auth.errors.passwordMin", { count: 8 }) })
            .max(100)
            .regex(/[A-Z]/, { message: t("auth.errors.passwordUppercase") })
            .regex(/[a-z]/, { message: t("auth.errors.passwordLowercase") }),
          name: z
            .string()
            .trim()
            .min(2, { message: t("auth.errors.nameMin", { count: 2 }) })
            .max(100),
          confirmPassword: z.string(),
          establishment_name: z.string().optional(),
          level: z.string().optional(),
          gender: z.string().optional(),
          role: z.string().optional(),
          student_type: z.string().optional(),
          track: z.string().optional(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("auth.errors.passwordsMismatch"),
          path: ["confirmPassword"],
        }),
    [language, t],
  );

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signupSchema.parse({
        email,
        password,
        confirmPassword,
        name,
        establishment_name,
        level,
        gender,
        role,
        student_type,
        track,
      });
      setIsLoading(true);
      await signup(email, password, name, establishment_name, level, gender, role, student_type, track);
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
          <div className="inline-flex items-center justify-center mb-4">
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
              <Link to="/" id="signup-back-to-home-link">
                <Button 
                  variant="outline"
                  className="rounded-2xl px-3 py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                  id="signup-back-to-home-button"
                >
                  <ArrowLeft className={`w-4 h-4 ${language === "ar" ? "ml-2 rotate-180" : "mr-2"}`} />
                  {t("auth.actions.backToHome")}
                </Button>
              </Link>
            </div>
            <CardTitle className="text-gray-900 dark:text-gray-100">{t("auth.signup.title")}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {t("auth.signup.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-gray-900 dark:text-gray-200">
                  {t("auth.fields.name")}
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder={t("auth.placeholders.name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-gray-900 dark:text-gray-200">
                  {t("auth.fields.email")}
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder={t("auth.placeholders.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="signup-password" className="text-gray-900 dark:text-gray-200">
                  {t("auth.fields.password")}
                </Label>
                <PasswordInput
                  id="signup-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowPasswordValidation(true)}
                  onBlur={() => setShowPasswordValidation(false)}
                  required
                  disabled={isLoading}
                />
                <PasswordValidationPopup 
                  password={password} 
                  isVisible={showPasswordValidation} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="text-gray-900 dark:text-gray-200">
                  {t("auth.fields.confirmPassword")}
                </Label>
                <PasswordInput
                  id="signup-confirm-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-establishment-name" className="text-gray-900 dark:text-gray-200">
                  {t("auth.fields.institution")}
                </Label>
                <Input
                  id="signup-establishment-name"
                  type="text"
                  placeholder={t("auth.placeholders.institution")}
                  value={establishment_name}
                  onChange={(e) => setEstablishmentName(e.target.value)}
                  disabled={isLoading}
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="signup-gender" className="text-gray-900 dark:text-gray-200">
                  {t("auth.fields.gender")}
                </Label>
                <Select value={gender} onValueChange={setGender} disabled={isLoading}>
                  <SelectTrigger id="signup-gender">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder={t("auth.placeholders.gender")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male" id="signup-gender-male">{t("auth.gender.male")}</SelectItem>
                    <SelectItem value="Female" id="signup-gender-female">{t("auth.gender.female")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-role" className="text-gray-900 dark:text-gray-200">
                  {t("auth.fields.role")}
                </Label>
                <Select value={role} onValueChange={setRole} disabled={isLoading}>
                  <SelectTrigger id="signup-role">
                    <div className="flex items-center">
                      <UserCheck className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder={t("auth.placeholders.role")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student" id="signup-role-student">{t("auth.role.student")}</SelectItem>
                    <SelectItem value="Specialist" id="signup-role-specialist">{t("auth.role.specialist")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional fields based on role */}
              {role === "Student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="signup-student-type" className="text-gray-900 dark:text-gray-200">
                      {t("auth.fields.studentType")}
                    </Label>
                    <Select value={student_type} onValueChange={setStudentType} disabled={isLoading}>
                      <SelectTrigger id="signup-student-type">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder={t("auth.placeholders.studentType")} />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High School" id="signup-student-type-high-school">{t("auth.studentType.highSchool")}</SelectItem>
                        <SelectItem value="University" id="signup-student-type-university">{t("auth.studentType.university")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {student_type === "High School" && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-level-high-school" className="text-gray-900 dark:text-gray-200">
                        {t("auth.fields.academicLevel")}
                      </Label>
                      <Select value={level} onValueChange={setLevel} disabled={isLoading}>
                        <SelectTrigger id="signup-level-high-school">
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder={t("auth.placeholders.academicLevel")} />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year" id="signup-level-high-school-1">{t("auth.academicLevel.year1")}</SelectItem>
                          <SelectItem value="2nd Year" id="signup-level-high-school-2">{t("auth.academicLevel.year2")}</SelectItem>
                          <SelectItem value="3rd Year" id="signup-level-high-school-3">{t("auth.academicLevel.year3")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {student_type === "University" && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-track" className="text-gray-900 dark:text-gray-200">
                        {t("auth.fields.academicTrack")}
                      </Label>
                      <Select value={track} onValueChange={setTrack} disabled={isLoading}>
                        <SelectTrigger id="signup-track">
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder={t("auth.placeholders.academicTrack")} />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Science" id="signup-track-science">{t("auth.track.science")}</SelectItem>
                          <SelectItem value="Medicine" id="signup-track-medicine">{t("auth.track.medicine")}</SelectItem>
                          <SelectItem value="Literature" id="signup-track-literature">{t("auth.track.literature")}</SelectItem>
                          <SelectItem value="Business" id="signup-track-business">{t("auth.track.business")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {role === "Specialist" && (
                <div className="space-y-2">
                  <Label htmlFor="signup-level-specialist" className="text-gray-900 dark:text-gray-200">
                    {t("auth.fields.academicLevel")}
                  </Label>
                  <Select value={level} onValueChange={setLevel} disabled={isLoading}>
                    <SelectTrigger id="signup-level-specialist">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder={t("auth.placeholders.academicLevel")} />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3rd Year" id="signup-level-specialist-3">{t("auth.academicLevel.year3")}</SelectItem>
                      <SelectItem value="4th Year" id="signup-level-specialist-4">{t("auth.academicLevel.year4")}</SelectItem>
                      <SelectItem value="Graduate" id="signup-level-specialist-graduate">{t("auth.academicLevel.graduate")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button
                type="submit"
                id="signup-submit-button"
                className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl px-8 py-6 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className={`${language === "ar" ? "ml-2" : "mr-2"} h-4 w-4 animate-spin`}
                    />
                    {t("auth.signup.loading")}
                  </>
                ) : (
                  t("auth.signup.submit")
                )}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{t("auth.common.or")}</span>
                </div>
              </div>

              <Button
                type="button"
                id="signup-guest-button"
                variant="outline"
                className="w-full rounded-2xl px-8 py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                {t("auth.common.continueAsGuest")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {t("auth.signup.haveAccount") + " "}
              <Link to="/login" id="signup-login-link" className="text-primary hover:underline">
                {t("auth.signup.login")}
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("auth.common.agreement")}
        </p>
      </div>
    </div>
  );
};

export default Signup;
