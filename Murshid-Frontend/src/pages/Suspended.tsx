import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Suspended = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not logged in, go to login
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full border rounded-lg p-6 shadow-sm bg-card text-card-foreground">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Account Suspended</h1>
          {user?.suspended_reason ? (
            <p className="text-muted-foreground">{user.suspended_reason}</p>
          ) : (
            <p className="text-muted-foreground">
              Your account has been suspended by an administrator. You cannot access the application at this time.
            </p>
          )}
          <p className="text-muted-foreground">
            Please contact support or your administrator if you believe this is a mistake.
          </p>
        </div>
        <div className="mt-6 flex justify-center">
          <Button variant="destructive" onClick={handleLogout} id="suspended-logout-button">
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Suspended;
