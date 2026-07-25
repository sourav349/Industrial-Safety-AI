import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";
import { cameras } from "../data/mockData";

export default function Cameras() {
  return (
    <>
      <PageHeader title="Camera Management" subtitle="Track camera connectivity, FPS, latency, and model health" />
      <div className="camera-grid">
        {cameras.map((camera) => (
          <Panel key={camera.id} title={camera.id} subtitle={camera.location}>
            <div className="camera-health">
              <div className={`camera-preview ${camera.status.toLowerCase()}`}>{camera.status}</div>
              <div className="health-grid">
                <div><span>Status</span><strong>{camera.status}</strong></div>
                <div><span>FPS</span><strong>{camera.fps}</strong></div>
                <div><span>Latency</span><strong>{camera.latency} ms</strong></div>
                <div><span>Model</span><strong>{camera.model}</strong></div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
