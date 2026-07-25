import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const STREAM_URL = `${API_BASE_URL}/camera/stream`;

export async function safeGet(path, fallback) {
  try {
    const response = await api.get(path);
    return response.data;
  } catch {
    return fallback;
  }
}

export const apiService = {
  health: () => api.get("/health").then((r) => r.data),
  cameraStatus: () => api.get("/camera/status").then((r) => r.data),
  startCamera: (source = "0") =>
    api.post("/camera/start", null, { params: { source } }).then((r) => r.data),
  stopCamera: () => api.post("/camera/stop").then((r) => r.data),
  workers: () => api.get("/camera/workers").then((r) => r.data),
  detections: () => api.get("/camera/detections").then((r) => r.data),
  incidents: () => api.get("/incidents").then((r) => r.data),
  incidentSummary: () => api.get("/incidents/summary").then((r) => r.data),
  dashboardSummary: () => api.get("/dashboard/summary").then((r) => r.data),
  updateIncident: (id, status) =>
    api.patch(`/incidents/${id}/status`, { status }).then((r) => r.data),
  deleteIncident: (id) => api.delete(`/incidents/${id}`).then((r) => r.data),
};

export function normalizeList(data, keys = []) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

export default api;
