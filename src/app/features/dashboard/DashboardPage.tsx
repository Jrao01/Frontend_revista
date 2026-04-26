import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth, ROLE_CONFIG } from "../../context/AuthContext";

export function DashboardPage() {
  const { isLoggedIn, userRole, openAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      openAuth();
      navigate("/");
      return;
    }
    if (userRole && ROLE_CONFIG[userRole]) {
      navigate(ROLE_CONFIG[userRole].dashboardPath, { replace: true });
    }
  }, [isLoggedIn, userRole, navigate, openAuth]);

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="text-center">
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#3ecf8e", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          Redirigiendo a tu panel...
        </p>
      </div>
    </div>
  );
}
