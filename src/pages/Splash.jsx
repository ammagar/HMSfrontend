import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../AuthContext";

const ROUTE_BY_ROLE = {
  admin: "/admin",
  doctor: "/doctor",
  receptionist: "/receptionist",
  patient: "/patient",
};

export default function Splash() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready) return;
      if (user) navigate(ROUTE_BY_ROLE[user.role] || "/login", { replace: true });
      else navigate("/login", { replace: true });
    }, 1800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  return (
    <div className="splash-screen">
      <div className="splash-rings" aria-hidden="true">
        <span className="splash-ring r1" />
        <span className="splash-ring r2" />
        <span className="splash-ring r3" />
      </div>
      <div className="splash-content">
        <Logo className="splash-mark" />
        <h1>SkinHairDoc</h1>
        <p>Skin &amp; Hair Care, Looked After</p>
        <div className="splash-bar">
          <div className="splash-bar-fill" />
        </div>
      </div>
    </div>
  );
}
