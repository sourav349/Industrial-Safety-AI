function IncidentTable({
  incidents,
  updateStatusHandler,
  deleteIncidentHandler,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Safety Incidents</h2>
          <p>Detected PPE violations and incident status</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Incident ID</th>
              <th>Worker</th>
              <th>Violation</th>
              <th>Severity</th>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-table-message">
                  No safety incidents recorded
                </td>
              </tr>
            ) : (
              incidents.map((incident, index) => {
                const incidentId =
                  incident.incident_id ??
                  incident.id ??
                  incident.uuid ??
                  index + 1;

                const workerId =
                  incident.worker_id ??
                  incident.track_id ??
                  incident.person_id ??
                  "Unknown";

                const violation =
                  incident.violation ??
                  incident.description ??
                  incident.missing_ppe ??
                  "PPE violation";

                const severity = String(
                  incident.severity ??
                    incident.risk_level ??
                    "MEDIUM"
                ).toUpperCase();

                const timestamp =
                  incident.timestamp ??
                  incident.created_at ??
                  incident.time ??
                  "Not available";

                const status =
                  incident.status ??
                  incident.incident_status ??
                  "OPEN";

                return (
                  <tr key={incidentId}>
                    <td>
                      <strong>#{incidentId}</strong>
                    </td>

                    <td>Worker #{workerId}</td>

                    <td>{String(violation)}</td>

                    <td>
                      <span
                        className={`risk-badge ${severity.toLowerCase()}`}
                      >
                        {severity}
                      </span>
                    </td>

                    <td>{timestamp}</td>

                    <td>
                      <select
                        value={status}
                        onChange={(event) =>
                          updateStatusHandler(
                            incidentId,
                            event.target.value
                          )
                        }
                      >
                        <option value="OPEN">OPEN</option>

                        <option value="ACKNOWLEDGED">
                          ACKNOWLEDGED
                        </option>

                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </td>

                    <td>
                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteIncidentHandler(incidentId)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default IncidentTable;