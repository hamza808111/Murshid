import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// User interface - adjust according to your Spring Boot user model
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("murshid_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("murshid_user");
      }
    }
    setLoading(false);
  }, []);

  // TODO: Replace these placeholder functions with actual Spring Boot API calls
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // PLACEHOLDER: Replace with your Spring Boot login endpoint
      // Example:
      // const response = await fetch('http://your-backend.com/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();
      
      // For now, simulating a successful login
      const mockUser: User = {
        id: "1",
        email: email,
        name: email.split("@")[0]
      };
      
      setUser(mockUser);
      localStorage.setItem("murshid_user", JSON.stringify(mockUser));
      
      toast.success("Successfully logged in!");
      navigate("/");
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      
      // PLACEHOLDER: Replace with your Spring Boot signup endpoint
      // Example:
      // const response = await fetch('http://your-backend.com/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, name })
      // });
      // const data = await response.json();
      
      // For now, simulating a successful signup
      const mockUser: User = {
        id: "1",
        email: email,
        name: name || email.split("@")[0]
      };
      
      setUser(mockUser);
      localStorage.setItem("murshid_user", JSON.stringify(mockUser));
      
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // TODO: Call Spring Boot logout endpoint if needed
    setUser(null);
    localStorage.removeItem("murshid_user");
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
