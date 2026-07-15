import { useState } from "react";

const mockTemplates = [
  {
    label: "Angry Technical Issue (Triggers Human-in-the-Loop)",
    body: "I am extremely frustrated! Your real-time document sync sessions keep disconnecting constantly. Our team is facing critical delivery blockers due to your Nginx proxy socket layer timing out. Fix this immediately!",
    sender: "frustrated_client@enterprise.com",
  },
  {
    label: "Billing Mismatch (Triggers Stripe RAG Path)",
    body: "Hello, I am writing because my premium tier invoice shows an extra charge of $50 that was supposed to be a promotional ledger credit. Please check my billing history and adjust this back to zero.",
    sender: "finance_lead@startup.co",
  },
];

interface SimulatorProps {
  toggleSimulator: (isOpen: boolean) => void;
  onTicketCreated?: (id: string) => void;
}

export function Simulator({
  toggleSimulator,
  onTicketCreated,
}: SimulatorProps) {
  const [loading, setLoading] = useState(false);
  const [customBody, setCustomBody] = useState("");
  const [customSender, setCustomSender] = useState("recruiter_test@hiring.com");

  const triggerSimulation = async (sender, body) => {
    if (!body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tickets/webhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender, body }),
        },
      );

      // ADDED: Parse response payload to retrieve the generated id
      if (res.ok) {
        const data = await res.json();
        if (data?.id && onTicketCreated) {
          onTicketCreated(data.id);
        }
      }

      if (body === customBody) setCustomBody("");
    } catch (err) {
      console.error("Simulation trigger failed", err);
    } finally {
      setLoading(false);
      toggleSimulator(false);
    }
  };

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl mb-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
        Live Pipeline Simulation Playground
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Test the real-time AI engine. Use a pre-configured scenario or type any
        custom request to see the LangGraph state machine categorize, search,
        and pause live.
      </p>

      {/* --- Section A: Quick Presets --- */}
      <div id="agent-graph-viewport" className="mb-4">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
          Option 1: Quick Presets
        </span>
        <div className="flex flex-col gap-2">
          {mockTemplates.map((tmpl, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => {
                triggerSimulation(tmpl.sender, tmpl.body);
              }}
              className="text-left cursor-pointer text-xs bg-slate-50 hover:bg-slate-100/80 text-slate-700 p-2.5 rounded-lg border border-slate-200/80 transition-all duration-150 disabled:opacity-50"
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 my-4"></div>

      {/* --- Section B: Custom Free-Form Input --- */}
      <div>
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
          Option 2: Custom Live Input (No Strings Attached)
        </span>
        <div className="flex flex-col gap-3">
          <input
            type="email"
            value={customSender}
            onChange={(e) => setCustomSender(e.target.value)}
            placeholder="Sender Email Address"
            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition"
          />
          <textarea
            rows={8}
            value={customBody}
            onChange={(e) => setCustomBody(e.target.value)}
            placeholder="Type anything here... Try writing an angry complaint or a simple technical question to watch the vector database trigger."
            className="bg-slate-50 border border-slate-200 placeholder:text-slate-400 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 resize-none transition"
          />
          <button
            disabled={loading || !customBody.trim()}
            onClick={() => triggerSimulation(customSender, customBody)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            {loading
              ? "Processing Dynamic Graph Loop..."
              : "Inject Custom Webhook"}
          </button>
        </div>
      </div>
    </div>
  );
}
