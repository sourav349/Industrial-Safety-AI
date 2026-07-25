function SummaryCard({ title, value, subtitle, icon, type = "blue" }) {
  return (
    <div className={`summary-card ${type}`}>
      <div>
        <p className="summary-card-title">{title}</p>

        <h2>{value}</h2>

        <p className="summary-card-subtitle">{subtitle}</p>
      </div>

      <div className="summary-card-icon">{icon}</div>
    </div>
  );
}

export default SummaryCard;