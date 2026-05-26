import { useEffect } from "react";
import { useNavigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const subscriptionStatus = localStorage.getItem("subscriptionStatus");
    
    if (subscriptionStatus !== "active") {
      navigate("/subscription");
    }
  }, [navigate]);

  const subscriptionStatus = localStorage.getItem("subscriptionStatus");
  
  if (subscriptionStatus !== "active") {
    return null;
  }

  return <>{children}</>;
}
