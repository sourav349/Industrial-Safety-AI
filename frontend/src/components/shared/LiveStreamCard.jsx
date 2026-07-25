import { FaPlay, FaStop, FaVideo } from "react-icons/fa";
import { STREAM_URL, apiService } from "../../services/api";
import { useState } from "react";
import { useToast } from "../../context/ToastContext";

export default function LiveStreamCard({ running, onChanged }) {
  const [source, setSource] = useState("0");
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();

  const start = async () => {
    setBusy(true);
    try {
      const result = await apiService.startCamera(source || "0");
      notify(result?.message || "Camera started", "success");
      onChanged?.();
    } catch (error) {
      notify(error.response?.data?.detail || "Unable to start camera", "error");
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      const result = await apiService.stopCamera();
      notify(result?.message || "Camera stopped", "success");
      onChanged?.();
    } catch {
      notify("Unable to stop camera", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="camera-toolbar">
        <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="0, file path, or RTSP URL" />
        <button className="btn btn-primary" onClick={start} disabled={busy || running}><FaPlay /> Start</button>
        <button className="btn btn-danger" onClick={stop} disabled={busy || !running}><FaStop /> Stop</button>
      </div>
      <div className="stream-frame">
        {running ? (
          <img src={`${STREAM_URL}?ts=${Date.now()}`} alt="Live PPE monitoring" />
        ) : (
          <div className="stream-empty">
            <FaVideo />
            <h4>Camera stopped</h4>
            <p>Start a webcam, file, or RTSP stream.</p>
          </div>
        )}
      </div>
    </div>
  );
}
