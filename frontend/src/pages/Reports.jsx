import { useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";
import usePolling from "../hooks/usePolling";
import { apiService, normalizeList } from "../services/api";
import { useToast } from "../context/ToastContext";

export default function Reports() {
  const fetchIncidents = useCallback(async () => normalizeList(await apiService.incidents(), ["incidents", "data", "results", "items"]), []);
  const { data: incidents = [] } = usePolling(fetchIncidents, 5000, []);
  const { notify } = useToast();

  const rows = incidents.map((x, i) => [
    x.incident_id ?? x.id ?? i + 1,
    x.worker_id ?? "—",
    String(x.violation ?? x.description ?? "PPE violation"),
    x.severity ?? x.risk_level ?? "MEDIUM",
    x.status ?? "OPEN",
    x.timestamp ?? x.created_at ?? "—",
  ]);

  const downloadCSV = () => {
    const csv = [["Incident ID","Worker","Violation","Severity","Status","Timestamp"], ...rows]
      .map((row) => row.map((v) => `"${String(v).replaceAll('"','""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "humanshield-incidents.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("CSV report downloaded", "success");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("HumanShield AI Safety Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    autoTable(doc, {
      startY: 32,
      head: [["Incident ID","Worker","Violation","Severity","Status","Timestamp"]],
      body: rows,
      styles: { fontSize: 7 },
    });
    doc.save("humanshield-safety-report.pdf");
    notify("PDF report downloaded", "success");
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Export safety records for management, compliance, and audit teams" />
      <div className="report-grid">
        <Panel title="Daily Safety Report" subtitle="Incident-level operational report">
          <div className="report-card">
            <strong>{incidents.length}</strong><span>incident records available</span>
            <div className="button-row">
              <button className="btn btn-primary" onClick={downloadPDF}>Download PDF</button>
              <button className="btn btn-secondary" onClick={downloadCSV}>Download CSV</button>
            </div>
          </div>
        </Panel>
        <Panel title="Executive Summary" subtitle="Print-friendly management overview">
          <div className="report-card">
            <p>Use your browser print dialog to create a monthly executive PDF.</p>
            <button className="btn btn-secondary" onClick={() => window.print()}>Print Dashboard</button>
          </div>
        </Panel>
      </div>
    </>
  );
}
