import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar no-print">
      <div className="brand">
        <Logo className="leaf" />
        SkinHairDoc
      </div>
      {user && (
        <div className="nav-meta">
          <span className="hide-mobile">{user.name}</span>
          <span className="role-pill">{user.role}</span>
          <button className="btn btn-ghost" style={{ color: "white" }} onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
