import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getCameraStatus = async () => {
  const response = await api.get("/camera/status");
  return response.data;
};

export const startCamera = async (source = "0") => {
  const response = await api.post("/camera/start", null, {
    params: {
      source,
    },
  });

  return response.data;
};

export const stopCamera = async () => {
  const response = await api.post("/camera/stop");
  return response.data;
};

export const getWorkers = async () => {
  const response = await api.get("/camera/workers");
  return response.data;
};

export const getDetections = async () => {
  const response = await api.get("/camera/detections");
  return response.data;
};

export const getIncidents = async () => {
  const response = await api.get("/incidents");
  return response.data;
};

export const getIncidentSummary = async () => {
  const response = await api.get("/incidents/summary");
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data;
};

export const updateIncidentStatus = async (incidentId, status) => {
  const response = await api.patch(`/incidents/${incidentId}/status`, {
    status,
  });

  return response.data;
};

export const deleteIncident = async (incidentId) => {
  const response = await api.delete(`/incidents/${incidentId}`);
  return response.data;
};

export const STREAM_URL = `${API_BASE_URL}/camera/stream`;

export default api;