import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";
import { hourlyIncidents, violationTrend } from "../data/mockData";

const pie = [
  { name: "Helmet", value: 42 },
  { name: "Vest", value: 22 },
  { name: "Gloves", value: 28 },
  { name: "Shoes", value: 8 },
];
const colors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"];

export default function Analytics() {
  return (
    <>
      <PageHeader title="Safety Analytics" subtitle="Violation trends, PPE breakdown, and time-based risk analysis" />
      <div className="analytics-grid">
        <Panel title="Weekly PPE Violations" className="span-2">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={violationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" /><YAxis /><Tooltip /><Legend />
                <Line dataKey="helmet" stroke="#2563eb" />
                <Line dataKey="vest" stroke="#16a34a" />
                <Line dataKey="gloves" stroke="#f59e0b" />
                <Line dataKey="shoes" stroke="#dc2626" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Violation Distribution">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pie.map((_, i) => <Cell key={i} fill={colors[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Incidents by Hour" className="span-2">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyIncidents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" /><YAxis /><Tooltip />
                <Bar dataKey="incidents" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
