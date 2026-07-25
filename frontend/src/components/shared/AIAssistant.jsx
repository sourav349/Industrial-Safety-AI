import { useMemo, useState } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";

const canned = {
  incident: "The highest incident volume is linked to helmet and glove violations. Review the Incidents and Analytics pages for details.",
  worker: "Workers with repeated HIGH or CRITICAL risk should be prioritized for supervisor intervention.",
  report: "Open Reports to download a CSV or PDF safety summary.",
  camera: "Open Cameras to view stream status, health, FPS, and latency.",
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "ai", text: "Ask about incidents, workers, reports, or cameras." },
  ]);

  const suggestions = useMemo(() => ["Summarize incidents", "Highest risk worker", "Generate report"], []);

  const send = (text = input) => {
    if (!text.trim()) return;
    const key = Object.keys(canned).find((item) => text.toLowerCase().includes(item));
    const answer = canned[key] || "This demo assistant uses local rules. Connect an LLM endpoint later for grounded answers.";
    setMessages((items) => [...items, { from: "user", text }, { from: "ai", text: answer }]);
    setInput("");
  };

  return (
    <>
      <button className="assistant-fab" onClick={() => setOpen((v) => !v)}>
        {open ? <FaTimes /> : <FaRobot />}
      </button>
      {open && (
        <div className="assistant-panel">
          <div className="assistant-header">
            <strong>HumanShield Assistant</strong>
            <small>Safety intelligence helper</small>
          </div>
          <div className="assistant-messages">
            {messages.map((message, index) => (
              <div key={index} className={`assistant-message ${message.from}`}>{message.text}</div>
            ))}
          </div>
          <div className="assistant-suggestions">
            {suggestions.map((item) => <button key={item} onClick={() => send(item)}>{item}</button>)}
          </div>
          <div className="assistant-input">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <button onClick={() => send()}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
