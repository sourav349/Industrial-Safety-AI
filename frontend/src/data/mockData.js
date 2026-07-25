export const violationTrend = [
  { day: "Mon", helmet: 14, vest: 8, gloves: 11, shoes: 5 },
  { day: "Tue", helmet: 11, vest: 7, gloves: 9, shoes: 4 },
  { day: "Wed", helmet: 16, vest: 10, gloves: 12, shoes: 7 },
  { day: "Thu", helmet: 9, vest: 6, gloves: 8, shoes: 3 },
  { day: "Fri", helmet: 13, vest: 9, gloves: 10, shoes: 4 },
  { day: "Sat", helmet: 7, vest: 4, gloves: 6, shoes: 2 },
  { day: "Sun", helmet: 5, vest: 3, gloves: 4, shoes: 1 },
];

export const hourlyIncidents = [
  { hour: "08", incidents: 4 },
  { hour: "10", incidents: 9 },
  { hour: "12", incidents: 13 },
  { hour: "14", incidents: 18 },
  { hour: "16", incidents: 15 },
  { hour: "18", incidents: 7 },
];

export const cameras = [
  { id: "CAM-01", location: "Assembly Line", status: "Online", fps: 24, latency: 118, model: "YOLO11m" },
  { id: "CAM-02", location: "Packaging", status: "Online", fps: 22, latency: 141, model: "YOLO11m" },
  { id: "CAM-03", location: "Warehouse", status: "Offline", fps: 0, latency: 0, model: "YOLO11m" },
  { id: "CAM-04", location: "Loading Bay", status: "Online", fps: 20, latency: 165, model: "YOLO11m" },
];

export const zones = [
  { name: "Assembly", risk: "Low", incidents: 8 },
  { name: "Packaging", risk: "Medium", incidents: 17 },
  { name: "Warehouse", risk: "High", incidents: 29 },
  { name: "Loading Bay", risk: "Critical", incidents: 42 },
];

export const alerts = [
  { id: 1, title: "Helmet violation", detail: "Worker #1274 at Loading Bay", severity: "Critical", time: "3 min ago" },
  { id: 2, title: "Camera latency", detail: "CAM-04 latency crossed 160 ms", severity: "Medium", time: "11 min ago" },
  { id: 3, title: "Repeated glove violation", detail: "Worker #830 has 3 violations today", severity: "High", time: "18 min ago" },
];
