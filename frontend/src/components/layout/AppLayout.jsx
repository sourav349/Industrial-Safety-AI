import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AIAssistant from "../shared/AIAssistant";

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
