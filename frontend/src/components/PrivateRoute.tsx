import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useCurrentUser } from "@/hooks/auth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, setUser } = useAuthStore();
  const { data: user } = useCurrentUser();

  // Sincronizza i dati utente nello store quando disponibili
  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

export default PrivateRoute;
