import { useCallback } from "react";
import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";
import LiveStreamCard from "../components/shared/LiveStreamCard";
import usePolling from "../hooks/usePolling";
import { apiService } from "../services/api";
import { cameras } from "../data/mockData";

export default function LiveMonitoring() {
  const fetchStatus = useCallback(() => apiService.cameraStatus(), []);
  const { data, refresh } = usePolling(fetchStatus, 2500, {});
  const running = Boolean(data?.running ?? data?.active);

  return (
    <>
      <PageHeader title="Live Monitoring" subtitle="Monitor one or more cameras and review real-time AI detections" />
      <Panel title="Primary Camera" subtitle="Webcam, video file, or RTSP feed">
        <LiveStreamCard running={running} onChanged={refresh} />
      </Panel>
      <div className="camera-grid">
        {cameras.map((camera) => (
          <Panel key={camera.id} title={camera.id} subtitle={camera.location}>
            <div className="camera-tile">
              <div className={`camera-preview ${camera.status.toLowerCase()}`}>
                <span>{camera.status}</span>
              </div>
              <div className="camera-meta">
                <span>FPS <strong>{camera.fps}</strong></span>
                <span>Latency <strong>{camera.latency} ms</strong></span>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
