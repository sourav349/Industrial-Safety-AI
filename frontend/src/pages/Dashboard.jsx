import { useCallback } from "react";
import { FaCamera, FaExclamationTriangle, FaHardHat, FaShieldAlt } from "react-icons/fa";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";
import StatCard from "../components/shared/StatCard";
import LiveStreamCard from "../components/shared/LiveStreamCard";
import usePolling from "../hooks/usePolling";
import { apiService, normalizeList } from "../services/api";
import { violationTrend, zones } from "../data/mockData";

export default function Dashboard() {
  const fetchDashboard = useCallback(async () => {
    const [status, workersRaw, incidentsRaw, summary] = await Promise.all([
      apiService.cameraStatus(),
      apiService.workers(),
      apiService.incidents(),
      apiService.dashboardSummary(),
    ]);
    return {
      status,
      workers: normalizeList(workersRaw, ["workers", "data", "results"]),
      incidents: normalizeList(incidentsRaw, ["incidents", "data", "results", "items"]),
      summary,
    };
  }, []);

  const { data, refresh } = usePolling(fetchDashboard, 3000, {
    status: {},
    workers: [],
    incidents: [],
    summary: {},
  });

  const running = Boolean(data?.status?.running ?? data?.status?.active);
  const workers = data?.workers || [];
  const incidents = data?.incidents || [];
  const summary = data?.summary || {};

  return (
    <>
      <PageHeader title="Safety Operations Dashboard" subtitle="Real-time visibility across workers, cameras, risks, and incidents" />
      <div className="stats-grid">
        <StatCard label="Active Workers" value={summary.active_workers ?? workers.length} helper="Currently detected" icon={<FaHardHat />} />
        <StatCard label="Open Incidents" value={summary.active_incidents ?? incidents.length} helper="Needs attention" icon={<FaExclamationTriangle />} tone="orange" />
        <StatCard label="Compliance" value={`${summary.compliance_rate ?? 92}%`} helper="Current PPE compliance" icon={<FaShieldAlt />} tone="green" />
        <StatCard label="Active Cameras" value={running ? 1 : 0} helper="Live monitoring streams" icon={<FaCamera />} tone="purple" />
      </div>

      <div className="dashboard-grid">
        <Panel title="Live PPE Monitoring" subtitle="YOLO11m + ByteTrack real-time detection" className="span-2">
          <LiveStreamCard running={running} onChanged={refresh} />
        </Panel>

        <Panel title="Risk by Zone" subtitle="Operational risk concentration">
          <div className="zone-list">
            {zones.map((zone) => (
              <div className="zone-row" key={zone.name}>
                <div><strong>{zone.name}</strong><small>{zone.incidents} incidents</small></div>
                <span className={`severity ${zone.risk.toLowerCase()}`}>{zone.risk}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Violation Trend" subtitle="Last seven days" className="span-2">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={violationTrend}>
                <defs>
                  <linearGradient id="helmetFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="helmet" stroke="#2563eb" fill="url(#helmetFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
