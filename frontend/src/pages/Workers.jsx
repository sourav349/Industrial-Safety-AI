import { useCallback, useMemo, useState } from "react";
import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";
import EmptyState from "../components/shared/EmptyState";
import usePolling from "../hooks/usePolling";
import { apiService, normalizeList } from "../services/api";

export default function Workers() {
  const fetchWorkers = useCallback(async () => normalizeList(await apiService.workers(), ["workers", "data", "results"]), []);
  const { data: workers = [] } = usePolling(fetchWorkers, 3000, []);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => workers.filter((w, i) => String(w.worker_id ?? w.track_id ?? i + 1).includes(query)),
    [workers, query]
  );

  return (
    <>
      <PageHeader
        title="Workers"
        subtitle="Current PPE state, risk score, and compliance history"
        action={<input className="search-input" placeholder="Search worker ID" value={query} onChange={(e) => setQuery(e.target.value)} />}
      />
      <Panel title="Worker Compliance">
        {filtered.length === 0 ? <EmptyState title="No workers detected" /> : (
          <div className="worker-card-grid">
            {filtered.map((worker, index) => {
              const id = worker.worker_id ?? worker.track_id ?? index + 1;
              const missing = worker.missing_ppe ?? [];
              const detected = worker.detected_ppe ?? [];
              const level = String(worker.risk_level ?? "LOW").toLowerCase();
              return (
                <article className="worker-card" key={id}>
                  <div className="worker-card-head">
                    <div className="avatar">{String(id).slice(-2)}</div>
                    <div><h4>Worker #{id}</h4><span className={`severity ${level}`}>{level}</span></div>
                  </div>
                  <div className="worker-metric"><span>Risk score</span><strong>{worker.risk_score ?? 0}</strong></div>
                  <div><small>Detected PPE</small><div className="tag-row">{detected.length ? detected.map((x) => <span className="tag good" key={x}>{x}</span>) : <span>None</span>}</div></div>
                  <div><small>Missing PPE</small><div className="tag-row">{missing.length ? missing.map((x) => <span className="tag bad" key={x}>{x}</span>) : <span className="tag good">Compliant</span>}</div></div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}
