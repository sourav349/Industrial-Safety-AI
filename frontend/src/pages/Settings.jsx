import { useState } from "react";
import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";
import { useToast } from "../context/ToastContext";

export default function Settings() {
  const { notify } = useToast();
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem("humanshield-settings") || '{"confidence":0.5,"alertDelay":3,"fps":24,"email":true,"voice":false,"sms":false}'));

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));
  const save = () => {
    localStorage.setItem("humanshield-settings", JSON.stringify(settings));
    notify("Settings saved", "success");
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Configure model thresholds, alerts, notifications, and performance" />
      <Panel title="AI Detection Settings">
        <div className="settings-grid">
          <label>Confidence threshold<input type="number" min="0" max="1" step="0.05" value={settings.confidence} onChange={(e) => update("confidence", Number(e.target.value))} /></label>
          <label>Alert delay (seconds)<input type="number" value={settings.alertDelay} onChange={(e) => update("alertDelay", Number(e.target.value))} /></label>
          <label>Target FPS<input type="number" value={settings.fps} onChange={(e) => update("fps", Number(e.target.value))} /></label>
        </div>
      </Panel>
      <Panel title="Notification Channels">
        <div className="switch-list">
          {["email","sms","voice"].map((key) => (
            <label key={key} className="switch-row"><span>{key.toUpperCase()} alerts</span><input type="checkbox" checked={settings[key]} onChange={(e) => update(key, e.target.checked)} /></label>
          ))}
        </div>
      </Panel>
      <button className="btn btn-primary" onClick={save}>Save settings</button>
    </>
  );
}
