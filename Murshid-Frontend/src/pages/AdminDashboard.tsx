import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Search, Users, Loader2, Trash2, RefreshCw, Building2, BookOpen, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  establishment_name: string | null;
  level: string | null;
  gender: string | null;
  role: string | null;
  student_type: string | null;
  track: string | null;
  is_admin: boolean | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!user.is_admin) {
      toast.error(t("admin.dashboard.toast.accessDenied"));
      navigate("/");
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      setFilteredUsers(data || []);
      
      // Only show success message if manually refreshed (not on initial load)
      if (users.length > 0) {
        toast.success(t("admin.dashboard.toast.refreshSuccess", { count: data?.length || 0 }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(t("admin.dashboard.toast.loadError"));
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((u) =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.establishment_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteClick = (userData: UserData) => {
    // Prevent admin from deleting themselves
    if (userData.id === user?.id) {
      toast.error(t("admin.dashboard.toast.deleteSelf"));
      return;
    }
    setUserToDelete(userData);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);

      // Delete from Supabase Auth (this will cascade delete from profiles table)
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);

      if (error) {
        // If admin API fails, try deleting from profiles table directly
        // This will work if RLS policies allow it
        const { error: profileError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", userToDelete.id);

        if (profileError) throw profileError;
      }

      // Update local state
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setFilteredUsers(filteredUsers.filter((u) => u.id !== userToDelete.id));

      toast.success(t("admin.dashboard.toast.deleteSuccess", { name: userToDelete.name || userToDelete.email }));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(t("admin.dashboard.toast.deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="admin-layout min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5" dir={language}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Shield className="w-10 h-10 text-primary" />
                {t("admin.dashboard.title")}
              </h1>
              <p className="text-muted-foreground mt-2">{t("admin.dashboard.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={fetchUsers} 
                variant="outline" 
                className="gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {t("admin.dashboard.refresh")}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("admin.dashboard.stats.totalUsers")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("admin.dashboard.stats.students")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {users.filter((u) => u.role === "Student").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("admin.dashboard.stats.specialists")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {users.filter((u) => u.role === "Specialist").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">{t("admin.dashboard.tools.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/universities">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("admin.dashboard.tools.manageUniversities.title")}</h3>
                      <p className="text-sm text-muted-foreground">{t("admin.dashboard.tools.manageUniversities.desc")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/majors">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("admin.dashboard.tools.manageMajors.title")}</h3>
                      <p className="text-sm text-muted-foreground">{t("admin.dashboard.tools.manageMajors.desc")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/university-majors">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <LinkIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("admin.dashboard.tools.assignMajors.title")}</h3>
                      <p className="text-sm text-muted-foreground">{t("admin.dashboard.tools.assignMajors.desc")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t("admin.dashboard.table.title")}
              </CardTitle>
              <div className="relative w-64">
                <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                <Input
                  placeholder={t("admin.dashboard.table.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={language === "ar" ? "pr-10" : "pl-10"}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? t("admin.dashboard.table.noSearchResults") : t("admin.dashboard.table.noResults")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.dashboard.table.headers.name")}</TableHead>
                      <TableHead>{t("admin.dashboard.table.headers.email")}</TableHead>
                      <TableHead>{t("admin.dashboard.table.headers.role")}</TableHead>
                      <TableHead>{t("admin.dashboard.table.headers.institution")}</TableHead>
                      <TableHead>{t("admin.dashboard.table.headers.level")}</TableHead>
                      <TableHead>{t("admin.dashboard.table.headers.gender")}</TableHead>
                      <TableHead>{t("admin.dashboard.table.headers.joined")}</TableHead>
                      <TableHead>{t("admin.dashboard.table.headers.status")}</TableHead>
                      <TableHead className="text-right">{t("admin.dashboard.table.headers.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((userData) => (
                      <TableRow key={userData.id}>
                        <TableCell className="font-medium">
                          {userData.name || t("profile.display.notSet")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {userData.email}
                        </TableCell>
                        <TableCell>
                          {userData.role ? (
                            <Badge variant="outline">{userData.role === "Student" ? t("auth.role.student") : userData.role === "Specialist" ? t("auth.role.specialist") : userData.role}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">{t("profile.display.notSet")}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {userData.establishment_name || t("profile.display.notSet")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {userData.level || t("profile.display.notSet")}
                        </TableCell>
                        <TableCell className="text-sm">
                          {userData.gender === "Male"
                            ? t("auth.gender.male")
                            : userData.gender === "Female"
                            ? t("auth.gender.female")
                            : userData.gender || t("profile.display.notSet")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(userData.created_at)}
                        </TableCell>
                        <TableCell>
                          {userData.is_admin ? (
                            <Badge className="bg-gradient-to-r from-primary to-accent">
                              <Shield className={`w-3 h-3 ${language === "ar" ? "ml-1" : "mr-1"}`} />
                              {t("admin.dashboard.table.status.admin")}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{t("admin.dashboard.table.status.user")}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(userData)}
                            disabled={userData.id === user?.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.dashboard.dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.dashboard.dialog.description", {
                name: userToDelete?.name || userToDelete?.email || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleting}>
              {t("admin.dashboard.dialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"} animate-spin`} />
                  {t("admin.dashboard.dialog.deleting")}
                </>
              ) : (
                t("admin.dashboard.dialog.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;

