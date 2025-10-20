import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// App user shape (frontend)
interface AppUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<void>;
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

  // Map Supabase auth user to AppUser, augmenting with profile name if present
  const mapUserWithProfile = async (authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) => {
    let derivedName: string | undefined = (authUser.user_metadata?.["name"] as string | undefined) || undefined;
    if (!derivedName) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", authUser.id)
        .single();
      derivedName = profileData?.name || (authUser.email ? authUser.email.split("@")[0] : undefined);
    }
    return {
      id: authUser.id,
      email: authUser.email || "",
      name: derivedName,
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

  const signup = async (email: string, password: string, name?: string) => {
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
        // Ensure a profiles row exists with the provided name (if the table/policy is set up)
        if (name) {
          await supabase.from("profiles").upsert({ id: data.user.id, name }).select().single();
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

  const updateProfile = async (name: string, email: string) => {
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

      // Upsert into profiles table for normalized name
      if (user?.id) {
        const { error: profileErr } = await supabase.from("profiles").upsert({ id: user.id, name });
        if (profileErr) throw profileErr;
      }

      // Update local user state
      const updatedUser: AppUser = {
        ...(user as AppUser),
        name,
        email,
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
