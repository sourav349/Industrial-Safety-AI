import { FaMoon, FaSignOutAlt, FaSun } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div>
        <h1>HumanShield AI</h1>
        <p>Real-time PPE compliance and workplace safety intelligence</p>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" onClick={toggleTheme} title="Toggle theme">
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
        <div className="user-chip">
          <span>{user?.name}</span>
          <small>{user?.role}</small>
        </div>
        <button className="icon-button" onClick={logout} title="Sign out">
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}
