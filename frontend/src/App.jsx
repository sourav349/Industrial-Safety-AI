import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LiveMonitoring from "./pages/LiveMonitoring";
import Incidents from "./pages/Incidents";
import Workers from "./pages/Workers";
import Cameras from "./pages/Cameras";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import AIInsights from "./pages/AIInsights";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/live" element={<LiveMonitoring />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/workers" element={<Workers />} />
        <Route path="/cameras" element={<Cameras />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/ai-insights" element={<AIInsights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} />
      </Route>
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
