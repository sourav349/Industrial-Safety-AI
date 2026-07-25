import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FaExclamationTriangle,
  FaHardHat,
  FaShieldAlt,
  FaUserCheck,
} from "react-icons/fa";

import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import LiveStream from "./components/LiveStream";
import WorkerTable from "./components/WorkerTable";
import IncidentTable from "./components/IncidentTable";

import {
  STREAM_URL,
  deleteIncident,
  getCameraStatus,
  getDashboardSummary,
  getIncidents,
  getWorkers,
  startCamera,
  stopCamera,
  updateIncidentStatus,
} from "./services/api";

import "./App.css";

function normalizeList(response, possibleKeys) {
  if (Array.isArray(response)) {
    return response;
  }

  for (const key of possibleKeys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  return [];
}

function App() {
  const [workers, setWorkers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState({});

  const [cameraRunning, setCameraRunning] = useState(false);
  const [cameraSource, setCameraSource] = useState("0");

  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  const refreshDashboard = useCallback(async () => {
    const results = await Promise.allSettled([
      getCameraStatus(),
      getWorkers(),
      getIncidents(),
      getDashboardSummary(),
    ]);

    const [
      cameraStatusResult,
      workersResult,
      incidentsResult,
      summaryResult,
    ] = results;

    if (cameraStatusResult.status === "fulfilled") {
      setBackendOnline(true);

      const cameraStatus = cameraStatusResult.value;

      setCameraRunning(
        Boolean(
          cameraStatus?.running ??
            cameraStatus?.is_running ??
            cameraStatus?.active
        )
      );
    } else {
      setBackendOnline(false);
    }

    if (workersResult.status === "fulfilled") {
      const workerList = normalizeList(workersResult.value, [
        "workers",
        "data",
        "results",
        "detections",
      ]);

      setWorkers(workerList);
    }

    if (incidentsResult.status === "fulfilled") {
      const incidentList = normalizeList(incidentsResult.value, [
        "incidents",
        "data",
        "results",
        "items",
      ]);

      setIncidents(incidentList);
    }

    if (summaryResult.status === "fulfilled") {
      setDashboardSummary(summaryResult.value ?? {});
    }
  }, []);

  useEffect(() => {
    refreshDashboard();

    const interval = window.setInterval(() => {
      refreshDashboard();
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshDashboard]);

  const startCameraHandler = async () => {
    setLoading(true);

    try {
      const source = cameraSource.trim() || "0";

      const response = await startCamera(source);

      setCameraRunning(response?.running ?? true);

      showMessage(
        response?.message || "Camera started successfully",
        "success"
      );

      window.setTimeout(() => {
        refreshDashboard();
      }, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Unable to start camera";

      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const stopCameraHandler = async () => {
    setLoading(true);

    try {
      const response = await stopCamera();

      setCameraRunning(response?.running ?? false);

      showMessage(
        response?.message || "Camera stopped successfully",
        "success"
      );

      window.setTimeout(() => {
        refreshDashboard();
      }, 500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Unable to stop camera";

      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatusHandler = async (incidentId, status) => {
    try {
      await updateIncidentStatus(incidentId, status);

      setIncidents((currentIncidents) =>
        currentIncidents.map((incident, index) => {
          const currentId =
            incident.incident_id ??
            incident.id ??
            incident.uuid ??
            index + 1;

          if (String(currentId) === String(incidentId)) {
            return {
              ...incident,
              status,
              incident_status: status,
            };
          }

          return incident;
        })
      );

      showMessage("Incident status updated", "success");
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "Unable to update incident status";

      showMessage(errorMessage, "error");
    }
  };

  const deleteIncidentHandler = async (incidentId) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete incident ${incidentId}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteIncident(incidentId);

      setIncidents((currentIncidents) =>
        currentIncidents.filter((incident, index) => {
          const currentId =
            incident.incident_id ??
            incident.id ??
            incident.uuid ??
            index + 1;

          return String(currentId) !== String(incidentId);
        })
      );

      showMessage("Incident deleted successfully", "success");
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        "Unable to delete incident";

      showMessage(errorMessage, "error");
    }
  };

  const summaryValues = useMemo(() => {
    const activeWorkers =
      dashboardSummary.active_workers ??
      dashboardSummary.total_workers ??
      dashboardSummary.workers ??
      workers.length;

    const compliantWorkers =
      dashboardSummary.compliant_workers ??
      dashboardSummary.compliant ??
      workers.filter((worker) => {
        const missingPPE =
          worker.missing_ppe ?? worker.ppe_missing ?? [];

        return Array.isArray(missingPPE) && missingPPE.length === 0;
      }).length;

    const activeIncidents =
      dashboardSummary.active_incidents ??
      dashboardSummary.open_incidents ??
      dashboardSummary.incidents ??
      incidents.filter((incident) => {
        const status = String(
          incident.status ??
            incident.incident_status ??
            "OPEN"
        ).toUpperCase();

        return status !== "RESOLVED";
      }).length;

    const highRiskWorkers =
      dashboardSummary.high_risk_workers ??
      dashboardSummary.high_risk ??
      workers.filter((worker) => {
        const riskLevel = String(
          worker.risk_level ?? worker.level ?? ""
        ).toUpperCase();

        return (
          riskLevel === "HIGH" ||
          riskLevel === "CRITICAL"
        );
      }).length;

    return {
      activeWorkers,
      compliantWorkers,
      activeIncidents,
      highRiskWorkers,
    };
  }, [dashboardSummary, workers, incidents]);

  return (
    <div className="app">
      <Header backendOnline={backendOnline} />

      <main className="dashboard-container">
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <section className="summary-grid">
          <SummaryCard
            title="Active Workers"
            value={summaryValues.activeWorkers}
            subtitle="Currently detected workers"
            icon={<FaHardHat />}
            type="blue"
          />

          <SummaryCard
            title="Compliant Workers"
            value={summaryValues.compliantWorkers}
            subtitle="Workers following PPE rules"
            icon={<FaUserCheck />}
            type="green"
          />

          <SummaryCard
            title="Active Incidents"
            value={summaryValues.activeIncidents}
            subtitle="Open safety violations"
            icon={<FaExclamationTriangle />}
            type="orange"
          />

          <SummaryCard
            title="High-Risk Workers"
            value={summaryValues.highRiskWorkers}
            subtitle="Workers requiring attention"
            icon={<FaShieldAlt />}
            type="red"
          />
        </section>

        <LiveStream
          streamUrl={STREAM_URL}
          cameraRunning={cameraRunning}
          cameraSource={cameraSource}
          setCameraSource={setCameraSource}
          startCameraHandler={startCameraHandler}
          stopCameraHandler={stopCameraHandler}
          loading={loading}
        />

        <WorkerTable workers={workers} />

        <IncidentTable
          incidents={incidents}
          updateStatusHandler={updateStatusHandler}
          deleteIncidentHandler={deleteIncidentHandler}
        />
      </main>
    </div>
  );
}

export default App;