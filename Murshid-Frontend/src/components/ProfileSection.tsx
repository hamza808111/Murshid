import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Mail, Edit2, Save, X, GraduationCap, BookOpen, Users, UserCheck } from "lucide-react";
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

      // TODO: Replace with actual Spring Boot API call
      // Example:
      // const response = await fetch('http://your-backend.com/api/users/profile', {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(formData)
      // });

      await updateProfile(formData.name, formData.email, formData.establishment_name, formData.level, formData.gender, formData.role, formData.student_type, formData.track);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
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
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

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
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="establishment_name"
                      type="text"
                      value={formData.establishment_name}
                      onChange={(e) => setFormData({ ...formData, establishment_name: e.target.value })}
                      className="pl-10"
                      placeholder="University of Example or High School Name"
                    />
                  </div>
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

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" disabled={loading}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{user.name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Educational Institution</p>
                    <p className="font-medium">{user.establishment_name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Academic Level</p>
                    <p className="font-medium">{user.level || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{user.gender || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{user.role || "Not set"}</p>
                  </div>
                  {user.role === "Student" && user.student_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Student Type</p>
                      <p className="font-medium">{user.student_type}</p>
                    </div>
                  )}
                  {user.role === "Student" && user.student_type === "University" && user.track && (
                    <div>
                      <p className="text-sm text-muted-foreground">Academic Track</p>
                      <p className="font-medium">{user.track}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <p className="font-medium">{user.id === "guest" ? "Guest" : "Registered"}</p>
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
