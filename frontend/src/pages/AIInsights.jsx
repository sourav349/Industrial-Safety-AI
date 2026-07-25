import PageHeader from "../components/shared/PageHeader";
import Panel from "../components/shared/Panel";

const insights = [
  { title: "Peak risk window", text: "Most violations occur between 2 PM and 4 PM. Increase supervisor rounds during this period." },
  { title: "Primary violation", text: "Helmet violations account for the largest share of incidents this week." },
  { title: "High-risk zone", text: "Loading Bay has the highest incident concentration and should receive additional signage and monitoring." },
  { title: "Recommended action", text: "Run a targeted toolbox talk for helmet and glove compliance before the next shift." },
];

export default function AIInsights() {
  return (
    <>
      <PageHeader title="AI Insights" subtitle="Automated safety observations and recommended actions" />
      <div className="insight-grid">
        {insights.map((insight, index) => (
          <Panel key={insight.title} title={`Insight ${index + 1}`}>
            <div className="insight-card"><h3>{insight.title}</h3><p>{insight.text}</p></div>
          </Panel>
        ))}
      </div>
      <Panel title="Architecture Note" subtitle="Production enhancement">
        <p className="muted">Connect this page to a grounded LLM endpoint that summarizes PostgreSQL incident data and cites source incident IDs.</p>
      </Panel>
    </>
  );
}
