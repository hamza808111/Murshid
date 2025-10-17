import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Murshid
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/">
              <Button 
                variant={isActive("/") ? "default" : "ghost"}
                className={isActive("/") ? "" : "hover:bg-accent/10"}
              >
                Home
              </Button>
            </Link>
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </span>
                <Link to="/profile">
                  <Button 
                    variant={isActive("/profile") ? "default" : "ghost"}
                    className={isActive("/profile") ? "" : "hover:bg-accent/10"}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button 
                  onClick={logout}
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button 
                  variant={isActive("/login") ? "default" : "outline"}
                  className={isActive("/login") ? "" : "border-primary/50 hover:bg-primary/10"}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
