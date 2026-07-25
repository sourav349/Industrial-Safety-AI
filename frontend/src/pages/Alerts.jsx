import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";
import { alerts } from "../data/mockData";

export default function Alerts() {
  return (
    <>
      <PageHeader title="Alerts" subtitle="Real-time operational notifications and escalation events" />
      <Panel title="Recent Alerts">
        <div className="alert-list">
          {alerts.map((alert) => (
            <article className="alert-item" key={alert.id}>
              <span className={`severity ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
              <div><h4>{alert.title}</h4><p>{alert.detail}</p></div>
              <small>{alert.time}</small>
            </article>
          ))}
        </div>
      </Panel>
    </>
  );
}
