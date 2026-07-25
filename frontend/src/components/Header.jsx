import { FaShieldAlt } from "react-icons/fa";

function Header({ backendOnline }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-logo">
          <FaShieldAlt />
        </div>

        <div>
          <h1>HumanShield AI</h1>
          <p>PPE Compliance and Safety Monitoring</p>
        </div>
      </div>

      <div
        className={`backend-status ${
          backendOnline ? "online" : "offline"
        }`}
      >
        <span className="status-dot"></span>

        {backendOnline ? "Backend Online" : "Backend Offline"}
      </div>
    </header>
  );
}

export default Header;