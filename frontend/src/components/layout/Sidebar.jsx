import {
  FaBell,
  FaCamera,
  FaChartLine,
  FaClipboardList,
  FaHome,
  FaRobot,
  FaShieldAlt,
  FaUsers,
  FaUserShield,
  FaVideo,
  FaCog,
  FaFileAlt,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const links = [
  ["/", "Dashboard", FaHome],
  ["/live", "Live Monitoring", FaVideo],
  ["/incidents", "Incidents", FaShieldAlt],
  ["/workers", "Workers", FaUsers],
  ["/cameras", "Cameras", FaCamera],
  ["/analytics", "Analytics", FaChartLine],
  ["/reports", "Reports", FaFileAlt],
  ["/alerts", "Alerts", FaBell],
  ["/ai-insights", "AI Insights", FaRobot],
  ["/settings", "Settings", FaCog],
  ["/users", "Users", FaUserShield],
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark"><FaShieldAlt /></div>
        <div>
          <strong>HumanShield AI</strong>
          <small>Industrial Safety Platform</small>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <FaClipboardList />
        <span>Safety first, always.</span>
      </div>
    </aside>
  );
}
