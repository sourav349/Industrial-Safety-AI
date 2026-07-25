import { FaPlay, FaStop, FaVideo } from "react-icons/fa";

function LiveStream({
  streamUrl,
  cameraRunning,
  cameraSource,
  setCameraSource,
  startCameraHandler,
  stopCameraHandler,
  loading,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Live PPE Monitoring</h2>
          <p>Real-time worker detection and PPE compliance</p>
        </div>

        <div
          className={`camera-status ${
            cameraRunning ? "running" : "stopped"
          }`}
        >
          <span></span>

          {cameraRunning ? "Camera Running" : "Camera Stopped"}
        </div>
      </div>

      <div className="camera-controls">
        <input
          type="text"
          value={cameraSource}
          onChange={(event) => setCameraSource(event.target.value)}
          placeholder="Enter 0 for webcam or video file path"
        />

        <button
          className="button start-button"
          onClick={startCameraHandler}
          disabled={loading || cameraRunning}
        >
          <FaPlay />
          Start Camera
        </button>

        <button
          className="button stop-button"
          onClick={stopCameraHandler}
          disabled={loading || !cameraRunning}
        >
          <FaStop />
          Stop Camera
        </button>
      </div>

      <div className="stream-container">
        {cameraRunning ? (
          <img
            className="stream-image"
            src={`${streamUrl}?time=${Date.now()}`}
            alt="HumanShield live PPE stream"
          />
        ) : (
          <div className="stream-placeholder">
            <FaVideo />

            <h3>Camera is stopped</h3>

            <p>
              Enter camera source 0 and click Start Camera to begin monitoring.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default LiveStream;