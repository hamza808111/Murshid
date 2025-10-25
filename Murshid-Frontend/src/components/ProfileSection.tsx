import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Mail, Edit2, Save, X, BookOpen, Users, UserCheck, Sparkles, Building2, Award } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  establishment_name: z.string().optional(),
  level: z.string().optional(),
  gender: z.string().optional(),
  role: z.string().optional(),
  student_type: z.string().optional(),
  track: z.string().optional(),
});

const ProfileSection = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    establishment_name: user?.establishment_name || "",
    level: user?.level || "",
    gender: user?.gender || "",
    role: user?.role || "",
    student_type: user?.student_type || "",
    track: user?.track || "",
  });

  // Update form data when user data changes
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      establishment_name: user?.establishment_name || "",
      level: user?.level || "",
      gender: user?.gender || "",
      role: user?.role || "",
      student_type: user?.student_type || "",
      track: user?.track || "",
    });
  }, [user]);

  const handleSave = async () => {
    try {
      profileSchema.parse(formData);
      setLoading(true);

      await updateProfile(
        formData.name, 
        formData.email, 
        formData.establishment_name, 
        formData.level, 
        formData.gender, 
        formData.role, 
        formData.student_type, 
        formData.track
      );
      
      setIsEditing(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      // Error toast is already shown by updateProfile function
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      establishment_name: user?.establishment_name || "",
      level: user?.level || "",
      gender: user?.gender || "",
      role: user?.role || "",
      student_type: user?.student_type || "",
      track: user?.track || "",
    });
    setIsEditing(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <section className="min-h-screen py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto overflow-hidden border-border/50 shadow-2xl">
          {/* Header with gradient background */}
          <div className="relative h-32 bg-gradient-to-r from-primary via-primary/90 to-accent overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/40" />
          </div>

          <CardHeader className="relative -mt-16 pb-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
              {/* Avatar with fancy border */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <Avatar className="relative w-28 h-28 border-4 border-background shadow-xl">
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* User info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-block bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-md border-2 border-primary/30 rounded-2xl px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-shadow">
                  <div className="flex items-center gap-2.5 justify-center sm:justify-start flex-wrap mb-1.5">
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: '"Poppins", "Inter", system-ui, sans-serif' }}>
                      {user.name || "User"}
                    </CardTitle>
                    {user.role && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20">
                        <Award className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2 justify-center sm:justify-start text-sm">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </CardDescription>
                  {user.establishment_name && (
                    <p className="flex items-center gap-2 justify-center sm:justify-start text-xs text-muted-foreground mt-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {user.establishment_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Edit button */}
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
                  size="sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establishment_name">Educational Institution</Label>
                  <Input
                    id="establishment_name"
                    type="text"
                    value={formData.establishment_name}
                    onChange={(e) => setFormData({ ...formData, establishment_name: e.target.value })}
                    placeholder="University of Example or High School Name"
                  />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    disabled={loading}
                  >
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
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                    disabled={loading}
                  >
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
                {formData.role === "Student" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="student_type">Student Type</Label>
                      <Select 
                        value={formData.student_type} 
                        onValueChange={(value) => setFormData({ ...formData, student_type: value })}
                        disabled={loading}
                      >
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

                    {formData.student_type === "High School" && (
                      <div className="space-y-2">
                        <Label htmlFor="level">Academic Level</Label>
                        <Select 
                          value={formData.level} 
                          onValueChange={(value) => setFormData({ ...formData, level: value })}
                          disabled={loading}
                        >
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

                    {formData.student_type === "University" && (
                      <div className="space-y-2">
                        <Label htmlFor="track">Academic Track</Label>
                        <Select 
                          value={formData.track} 
                          onValueChange={(value) => setFormData({ ...formData, track: value })}
                          disabled={loading}
                        >
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

                {formData.role === "Specialist" && (
                  <div className="space-y-2">
                    <Label htmlFor="level">Academic Level</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                      disabled={loading}
                    >
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

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading} 
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    disabled={loading}
                    className="hover:bg-muted/50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group p-4 rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                          <p className="font-semibold text-foreground">{user.name || "Not set"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group p-4 rounded-lg border border-border/50 bg-gradient-to-br from-accent/5 to-transparent hover:border-accent/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <Mail className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                          <p className="font-semibold text-foreground break-all">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group p-4 rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Gender</p>
                          <p className="font-semibold text-foreground">{user.gender || "Not set"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group p-4 rounded-lg border border-border/50 bg-gradient-to-br from-accent/5 to-transparent hover:border-accent/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <UserCheck className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Role</p>
                          <p className="font-semibold text-foreground">{user.role || "Not set"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group p-4 rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Educational Institution</p>
                          <p className="font-semibold text-foreground">{user.establishment_name || "Not set"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group p-4 rounded-lg border border-border/50 bg-gradient-to-br from-accent/5 to-transparent hover:border-accent/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <BookOpen className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Academic Level</p>
                          <p className="font-semibold text-foreground">{user.level || "Not set"}</p>
                        </div>
                      </div>
                    </div>
                    
                    {user.role === "Student" && user.student_type && (
                      <div className="group p-4 rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Student Type</p>
                            <p className="font-semibold text-foreground">{user.student_type}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {user.role === "Student" && user.student_type === "University" && user.track && (
                      <div className="group p-4 rounded-lg border border-border/50 bg-gradient-to-br from-accent/5 to-transparent hover:border-accent/30 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-accent/10">
                            <Award className="w-4 h-4 text-accent" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Academic Track</p>
                            <p className="font-semibold text-foreground">{user.track}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProfileSection;
