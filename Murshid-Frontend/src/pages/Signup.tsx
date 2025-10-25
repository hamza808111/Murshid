import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BookOpen, Users, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import PasswordValidationPopup from "@/components/PasswordValidationPopup";
import PasswordInput from "@/components/PasswordInput";
import logo from "@/assets/logo.png";

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100)
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" }),
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  confirmPassword: z.string(),
  establishment_name: z.string().optional(),
  level: z.string().optional(),
  gender: z.string().optional(),
  role: z.string().optional(),
  student_type: z.string().optional(),
  track: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src={logo} 
              alt="Murshid Logo" 
              className="h-28 object-contain"
            />
          </div>
          <p className="text-muted-foreground">Your guide to choosing the right major</p>
        </div>

        <Card className="border-border/50 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Start your journey to finding the perfect major</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
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
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <PasswordInput
                  id="confirm-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="establishment_name">Educational Institution</Label>
                <Input
                  id="establishment_name"
                  type="text"
                  placeholder="University of Example or High School Name"
                  value={establishment_name}
                  onChange={(e) => setEstablishmentName(e.target.value)}
                  disabled={isLoading}
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender} disabled={isLoading}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Select your gender" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole} disabled={isLoading}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <UserCheck className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Select your role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Specialist">Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional fields based on role */}
              {role === "Student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="student_type">Student Type</Label>
                    <Select value={student_type} onValueChange={setStudentType} disabled={isLoading}>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Select your student type" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="University">University</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {student_type === "High School" && (
                    <div className="space-y-2">
                      <Label htmlFor="level">Academic Level</Label>
                      <Select value={level} onValueChange={setLevel} disabled={isLoading}>
                        <SelectTrigger>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Select your level" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {student_type === "University" && (
                    <div className="space-y-2">
                      <Label htmlFor="track">Academic Track</Label>
                      <Select value={track} onValueChange={setTrack} disabled={isLoading}>
                        <SelectTrigger>
                          <div className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Select your track" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="Medicine">Medicine</SelectItem>
                          <SelectItem value="Literature">Literature</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {role === "Specialist" && (
                <div className="space-y-2">
                  <Label htmlFor="level">Academic Level</Label>
                  <Select value={level} onValueChange={setLevel} disabled={isLoading}>
                    <SelectTrigger>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select your level" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                Continue as Guest
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Signup;
