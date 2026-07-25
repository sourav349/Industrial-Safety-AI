function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  return [value];
}

function WorkerTable({ workers }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Worker Compliance</h2>
          <p>Worker PPE status and risk assessment</p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Worker ID</th>
              <th>Detected PPE</th>
              <th>Missing PPE</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
            </tr>
          </thead>

          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-table-message">
                  No workers detected
                </td>
              </tr>
            ) : (
              workers.map((worker, index) => {
                const workerId =
                  worker.worker_id ??
                  worker.track_id ??
                  worker.person_id ??
                  worker.id ??
                  index + 1;

                const detectedPPE = normalizeArray(
                  worker.detected_ppe ??
                    worker.ppe_detected ??
                    worker.ppe
                );

                const missingPPE = normalizeArray(
                  worker.missing_ppe ?? worker.ppe_missing
                );

                const riskScore =
                  worker.risk_score ?? worker.score ?? 0;

                const riskLevel = String(
                  worker.risk_level ?? worker.level ?? "LOW"
                ).toUpperCase();

                return (
                  <tr key={workerId}>
                    <td>
                      <strong>Worker #{workerId}</strong>
                    </td>

                    <td>
                      <div className="tag-container">
                        {detectedPPE.length > 0 ? (
                          detectedPPE.map((ppe, ppeIndex) => (
                            <span
                              className="tag detected-tag"
                              key={`${ppe}-${ppeIndex}`}
                            >
                              {ppe}
                            </span>
                          ))
                        ) : (
                          <span className="muted-text">None</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="tag-container">
                        {missingPPE.length > 0 ? (
                          missingPPE.map((ppe, ppeIndex) => (
                            <span
                              className="tag missing-tag"
                              key={`${ppe}-${ppeIndex}`}
                            >
                              {ppe}
                            </span>
                          ))
                        ) : (
                          <span className="tag detected-tag">
                            Compliant
                          </span>
                        )}
                      </div>
                    </td>

                    <td>{riskScore}</td>

                    <td>
                      <span
                        className={`risk-badge ${riskLevel.toLowerCase()}`}
                      >
                        {riskLevel}
                      </span>
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

export default WorkerTable;