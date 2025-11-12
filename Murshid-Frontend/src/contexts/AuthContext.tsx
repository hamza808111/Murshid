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
  is_admin?: boolean;
  avatar_url?: string;
  is_suspended?: boolean;
  suspended_reason?: string | null;
  suspended_until?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name?: string,
    establishment_name?: string,
    level?: string,
    gender?: string,
    role?: string,
    student_type?: string,
    track?: string,
    specialistProofFile?: File | null
  ) => Promise<void>;
  logout: () => Promise<void>;
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
    // Add timeout to prevent hanging
    const profilePromise = supabase
      .from("profiles")
      .select("name, establishment_name, level, gender, role, student_type, track, is_admin, avatar_url, is_suspended, suspended_reason, suspended_until")
      .eq("id", authUser.id)
      .single();
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
    );
    
    let profileData, error;
    try {
      const result = await Promise.race([profilePromise, timeoutPromise]) as any;
      profileData = result.data;
      error = result.error;
    } catch (timeoutError) {
      console.warn("Profile fetch timed out, using fallback data");
      error = timeoutError;
    }
    
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
        track,
        is_admin: profileData.is_admin,
        is_suspended: profileData.is_suspended,
        suspended_reason: profileData.suspended_reason,
        suspended_until: profileData.suspended_until
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
        is_admin: profileData?.is_admin || false,
        avatar_url: profileData?.avatar_url || undefined,
        is_suspended: profileData?.is_suspended || false,
        suspended_reason: profileData?.suspended_reason ?? null,
        suspended_until: profileData?.suspended_until ?? null,
      } as AppUser;
  };

  // Load session and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        // Add timeout to getSession call
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Session fetch timeout")), 8000)
        );
        
        const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        const session = data?.session;
        
        if (!isMounted) return;
        if (session?.user) {
          const mapped = await mapUserWithProfile(session.user);
          if (!isMounted) return;
          setUser(mapped);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        // If session restoration fails, just set user to null and stop loading
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    init();

    const { data: authSub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      try {
        if (session?.user) {
          const mapped = await mapUserWithProfile(session.user);
          if (!isMounted) return;
          setUser(mapped);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
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
        // If the account is suspended, redirect to the suspended page
        {
          const lang = localStorage.getItem('language') || 'en';
          if ((mapped as any)?.is_suspended) {
            toast.error(lang === 'ar' ? 'تم تعليق حسابك من قبل المشرف.' : 'Your account has been suspended by an administrator.');
            navigate('/suspended');
            return;
          }
        }
        localStorage.setItem("murshid_token", data.session.access_token);
        
        console.log("🔐 Login successful - User data:", {
          id: mapped.id,
          email: mapped.email,
          is_admin: mapped.is_admin
        });
        
        const language = localStorage.getItem('language') || 'en';
        toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Successfully logged in!');
        
        // Redirect admin users to admin dashboard
        if (mapped.is_admin) {
          console.log("✅ Admin detected - redirecting to /admin");
          navigate("/admin");
        } else {
          console.log("👤 Regular user - redirecting to /");
          navigate("/");
        }
      }
    } catch (error) {
      const language = localStorage.getItem('language') || 'en';
      const supabaseError = error as unknown as { message?: string };
      if (supabaseError?.message?.toLowerCase().includes("invalid login credentials")) {
        toast.error(language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى أو التسجيل.' : 'Incorrect email or password. Please try again or sign up.');
      } else {
        const message = (error as Error)?.message || (language === 'ar' ? 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.' : 'Login failed. Please check your credentials.');
        toast.error(message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    name?: string,
    establishment_name?: string,
    level?: string,
    gender?: string,
    role?: string,
    student_type?: string,
    track?: string,
    specialistProofFile?: File | null
  ) => {
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
      
      // Check if user was created
      if (!data.user) {
        throw new Error("Signup failed. Please try again.");
      }
      
      console.log("User created:", data.user.id, "Session:", data.session ? "Active" : "Pending email confirmation");
      
      // If session exists (email confirmation disabled), create profile and login
      if (data.session) {
        // Ensure a profiles row exists with the provided data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .upsert({ 
            id: data.user.id, 
            name: name || null, 
            establishment_name: establishment_name || null, 
            level: level || null, 
            gender: gender || null,
            role: role || null,
            student_type: student_type || null,
            track: track || null
          })
          .select()
          .single();
        
        if (profileError) {
          console.error("Profile creation error during signup:", profileError);
          // Don't throw - allow signup to complete even if profile creation fails
          toast.warning("Account created, but profile setup had an issue. You can update it later.");
        } else {
          console.log("Profile created successfully:", profileData);
        }

        // If Specialist, upload proof and deactivate account until approved
        try {
          if (role === 'Specialist' && specialistProofFile) {
            const file = specialistProofFile;
            const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
            const path = `${data.user.id}/proof_${Date.now()}.${ext}`;
            const { error: uploadErr } = await supabase.storage
              .from('specialist-proofs')
              .upload(path, file, { upsert: true, contentType: file.type });
            if (uploadErr) throw uploadErr;

            const { data: pub } = supabase.storage
              .from('specialist-proofs')
              .getPublicUrl(path);
            const proofUrl = pub.publicUrl;

            // Mark account as suspended pending verification and save reason
            await supabase.from('profiles')
              .update({
                is_suspended: true,
                suspended_reason: 'Pending specialist verification',
                // If the column exists, store proof url
                specialist_proof_url: (proofUrl as any)
              } as any)
              .eq('id', data.user.id);
          }
        } catch (e) {
          console.warn('Specialist proof handling encountered an issue:', e);
        }
        
        localStorage.setItem("murshid_token", data.session.access_token);
        toast.success("Account created successfully!");
        // If suspended (e.g., Specialist pending), redirect to suspended page
        const mapped = await mapUserWithProfile(data.user);
        setUser(mapped);
        if ((mapped as any)?.is_suspended) {
          toast.error('Your account is pending verification by an administrator.');
          navigate('/suspended');
        } else {
          navigate("/");
        }
      } else {
        // Email confirmation required
        toast.success("Account created! Please check your email to confirm your account.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
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
      const language = localStorage.getItem('language') || 'en';
      toast.success(language === 'ar' ? 'تم تسجيل الدخول كضيف!' : 'Logged in as guest!');
      navigate("/");
    } catch (error) {
      const language = localStorage.getItem('language') || 'en';
      toast.error(language === 'ar' ? 'فشل تسجيل الدخول كضيف. يرجى المحاولة مرة أخرى.' : 'Guest login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Logging out...");
      
      // Sign out without waiting (fire and forget - same Supabase promise issue)
      supabase.auth.signOut().catch((error) => {
        console.error("Sign out error (ignored):", error);
      });
      
      // Clear local state immediately
      setUser(null);
      localStorage.removeItem("murshid_token");
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const language = localStorage.getItem('language') || 'en';
      toast.success(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
      // Navigation is handled by the component calling logout()
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
      const language = localStorage.getItem('language') || 'en';
      toast.error(language === 'ar' ? 'فشل تسجيل الخروج. يرجى المحاولة مرة أخرى.' : 'Logout failed. Please try again.');
    }
  };

  const updateProfile = async (name: string, email: string, establishment_name?: string, level?: string, gender?: string, role?: string, student_type?: string, track?: string) => {
    try {
      console.log("🔄 Starting profile update...");
      console.log("User ID:", user?.id);
      console.log("Update data:", { name, email, establishment_name, level, gender, role, student_type, track });
      
      // Skip auth metadata update - it has issues with Supabase JS client
      // We'll store everything in the profiles table instead
      console.log("⏭️ Skipping auth metadata update (known Supabase JS issue)");

      // Upsert into profiles table for normalized data
      if (!user?.id) {
        throw new Error("No user ID found. Please log in again.");
      }
      
      console.log("💾 Upserting to profiles table...");
      const profilePayload = { 
        id: user.id, 
        name: name || null, 
        establishment_name: establishment_name || null, 
        level: level || null,
        gender: gender || null,
        role: role || null,
        student_type: student_type || null,
        track: track || null
      };
      console.log("Payload:", profilePayload);
      
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .upsert(profilePayload)
        .select()
        .single();
      
      if (profileErr) {
        console.error("❌ Profile update error:", profileErr);
        console.error("Error code:", profileErr.code);
        console.error("Error message:", profileErr.message);
        console.error("Error details:", profileErr.details);
        console.error("Error hint:", profileErr.hint);
        
        // Provide user-friendly error messages
        if (profileErr.code === '42501') {
          toast.error("Permission denied. Please contact support.");
        } else if (profileErr.code === 'PGRST116') {
          toast.error("Profile not found. Please log out and log in again.");
        } else {
          toast.error(`Database error: ${profileErr.message}`);
        }
        
        throw profileErr;
      }
      
      console.log("✅ Profile updated successfully:", profileData);

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
        avatar_url: (user as AppUser)?.avatar_url,
      };
      setUser(updatedUser);
      
      console.log("🎉 Profile update complete!");
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("💥 Update profile error:", error);
      // Don't show another toast if we already showed a specific one
      if (error instanceof Error && !error.message.includes("Permission denied") && !error.message.includes("Profile not found")) {
        toast.error("Failed to update profile. Please try again.");
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
