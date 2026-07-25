import { useCallback, useState } from "react";
import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";
import EmptyState from "../components/shared/EmptyState";
import usePolling from "../hooks/usePolling";
import { apiService, normalizeList } from "../services/api";
import { useToast } from "../context/ToastContext";

export default function Incidents() {
  const fetchIncidents = useCallback(async () => normalizeList(await apiService.incidents(), ["incidents", "data", "results", "items"]), []);
  const { data: incidents = [], refresh } = usePolling(fetchIncidents, 3000, []);
  const [filter, setFilter] = useState("ALL");
  const { notify } = useToast();

  const update = async (id, status) => {
    try {
      await apiService.updateIncident(id, status);
      notify("Incident updated", "success");
      refresh();
    } catch {
      notify("Could not update incident", "error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this incident?")) return;
    try {
      await apiService.deleteIncident(id);
      notify("Incident deleted", "success");
      refresh();
    } catch {
      notify("Could not delete incident", "error");
    }
  };

  const filtered = incidents.filter((incident) => filter === "ALL" || String(incident.status ?? "OPEN").toUpperCase() === filter);

  return (
    <>
      <PageHeader
        title="Incident Management"
        subtitle="Investigate, acknowledge, resolve, and audit PPE violations"
        action={
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>ALL</option><option>OPEN</option><option>ACKNOWLEDGED</option><option>RESOLVED</option>
          </select>
        }
      />
      <Panel title="Safety Incidents" subtitle={`${filtered.length} records`}>
        {filtered.length === 0 ? <EmptyState /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Worker</th><th>Violation</th><th>Severity</th><th>Timestamp</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map((incident, index) => {
                  const id = incident.incident_id ?? incident.id ?? index + 1;
                  const severity = String(incident.severity ?? incident.risk_level ?? "MEDIUM").toLowerCase();
                  return (
                    <tr key={id}>
                      <td>#{id}</td>
                      <td>{incident.worker_id ?? incident.track_id ?? "—"}</td>
                      <td>{String(incident.violation ?? incident.description ?? incident.missing_ppe ?? "PPE violation")}</td>
                      <td><span className={`severity ${severity}`}>{severity}</span></td>
                      <td>{incident.timestamp ?? incident.created_at ?? "—"}</td>
                      <td>
                        <select value={incident.status ?? "OPEN"} onChange={(e) => update(id, e.target.value)}>
                          <option>OPEN</option><option>ACKNOWLEDGED</option><option>RESOLVED</option>
                        </select>
                      </td>
                      <td><button className="btn btn-danger btn-small" onClick={() => remove(id)}>Delete</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
