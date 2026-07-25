export default function EmptyState({ title = "No data available", text = "Data will appear here when available." }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}
