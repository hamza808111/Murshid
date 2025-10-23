import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// App user shape (frontend)
interface AppUser {
  id: string;
  email: string;
  name?: string;
  establishment_name?: string;
  level?: string;
  gender?: string;
  role?: string;
  student_type?: string;
  track?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, establishment_name?: string, level?: string, gender?: string, role?: string, student_type?: string, track?: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string, establishment_name?: string, level?: string, gender?: string, role?: string, student_type?: string, track?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Map Supabase auth user to AppUser, augmenting with profile data if present
  const mapUserWithProfile = async (authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) => {
    let derivedName: string | undefined = (authUser.user_metadata?.["name"] as string | undefined) || undefined;
    let establishmentName: string | undefined;
    let level: string | undefined;
    let gender: string | undefined;
    let role: string | undefined;
    let studentType: string | undefined;
    let track: string | undefined;
    
    // Always load profile data to get all fields, regardless of whether name is in metadata
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("name, establishment_name, level, gender, role, student_type, track")
      .eq("id", authUser.id)
      .single();
    
    // Use profile data if available, otherwise fall back to metadata or email
    if (profileData && !error) {
      derivedName = profileData.name || derivedName || (authUser.email ? authUser.email.split("@")[0] : undefined);
      establishmentName = profileData.establishment_name;
      level = profileData.level;
      gender = profileData.gender;
      role = profileData.role;
      studentType = profileData.student_type;
      track = profileData.track;
      
      // Debug logging
      console.log("Profile data loaded:", {
        establishmentName,
        level,
        gender,
        role,
        studentType,
        track
      });
    } else {
      // If no profile data exists, use fallback values
      derivedName = derivedName || (authUser.email ? authUser.email.split("@")[0] : undefined);
      console.log("No profile data found for user:", authUser.id, "Error:", error);
    }
    
    return {
      id: authUser.id,
      email: authUser.email || "",
      name: derivedName,
      establishment_name: establishmentName,
      level: level,
      gender: gender,
      role: role,
      student_type: studentType,
      track: track,
    } as AppUser;
  };

  // Load session and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!isMounted) return;
      if (session?.user) {
        const mapped = await mapUserWithProfile(session.user);
        if (!isMounted) return;
        setUser(mapped);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    init();

    const { data: authSub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const mapped = await mapUserWithProfile(session.user);
        if (!isMounted) return;
        setUser(mapped);
      } else {
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      authSub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      if (data.user && data.session) {
        const mapped = await mapUserWithProfile(data.user);
        setUser(mapped);
        localStorage.setItem("murshid_token", data.session.access_token);
        toast.success("Successfully logged in!");
        navigate("/");
      }
    } catch (error) {
      const supabaseError = error as unknown as { message?: string };
      if (supabaseError?.message?.toLowerCase().includes("invalid login credentials")) {
        toast.error("Incorrect email or password. Please try again or sign up.");
      } else {
        const message = (error as Error)?.message || "Login failed. Please check your credentials.";
        toast.error(message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string, establishment_name?: string, level?: string, gender?: string, role?: string, student_type?: string, track?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: name ? { name } : undefined,
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        if (error.message?.toLowerCase().includes("already registered") || error.message?.toLowerCase().includes("user already registered")) {
          throw new Error("An account with this email already exists. Please log in instead.");
        }
        throw error;
      }
      if (data.user && data.session) {
        // Ensure a profiles row exists with the provided data (if the table/policy is set up)
        if (name || establishment_name || level || gender || role || student_type || track) {
          await supabase.from("profiles").upsert({ 
            id: data.user.id, 
            name, 
            establishment_name, 
            level, 
            gender,
            role,
            student_type,
            track
          }).select().single();
        }
        const mapped = await mapUserWithProfile(data.user);
        setUser(mapped);
        localStorage.setItem("murshid_token", data.session.access_token);
      }
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      const message = (error as Error)?.message || "Signup failed. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    try {
      setLoading(true);
      // Guest user (non-persistent)
      const guestUser: AppUser = {
        id: "guest",
        email: "guest@murshid.com",
        name: "Guest User"
      };
      setUser(guestUser);
      toast.success("Logged in as guest!");
      navigate("/");
    } catch (error) {
      toast.error("Guest login failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    (async () => {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("murshid_token");
      toast.success("Logged out successfully");
      navigate("/login");
    })();
  };

  const updateProfile = async (name: string, email: string, establishment_name?: string, level?: string, gender?: string, role?: string, student_type?: string, track?: string) => {
    try {
      setLoading(true);
      // Update auth profile (name in metadata, and email if changed)
      const updates: { data?: Record<string, unknown>; email?: string } = {};
      if (name) updates.data = { name };
      if (email && email !== user?.email) updates.email = email;
      if (updates.data || updates.email) {
        const { error: authErr } = await supabase.auth.updateUser(updates);
        if (authErr) throw authErr;
      }

      // Upsert into profiles table for normalized data
      if (user?.id) {
        const { error: profileErr } = await supabase.from("profiles").upsert({ 
          id: user.id, 
          name, 
          establishment_name, 
          level,
          gender,
          role,
          student_type,
          track
        });
        if (profileErr) throw profileErr;
      }

      // Update local user state
      const updatedUser: AppUser = {
        ...(user as AppUser),
        name,
        email,
        establishment_name,
        level,
        gender,
        role,
        student_type,
        track,
      };
      setUser(updatedUser);
    } catch (error) {
      toast.error("Failed to update profile");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginAsGuest, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
