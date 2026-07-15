import { useState } from "react";

const mockTemplates = [
  {
    label: "Angry technical issue",
    hint: "Triggers human-in-the-loop",
    tone: "#a63d40",
    body: "I am extremely frustrated! Your real-time document sync sessions keep disconnecting constantly. Our team is facing critical delivery blockers due to your Nginx proxy socket layer timing out. Fix this immediately!",
    sender: "frustrated_client@enterprise.com",
  },
  {
    label: "Billing mismatch",
    hint: "Triggers Stripe RAG path",
    tone: "#d4a147",
    body: "Hello, my premium tier invoice shows an extra $50 charge that was supposed to be a promotional credit. Please check my billing history and adjust this back to zero.",
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

  const triggerSimulation = async (sender: string, body: string) => {
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
      if (res.ok) {
        const data = await res.json();
        if (data?.id && onTicketCreated) onTicketCreated(data.id);
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
    <div className="space-y-6">
      <div>
        <span
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "#e07856" }}
        >
          Playground
        </span>
        <h3
          className="mt-1 font-serif text-3xl leading-none"
          style={{ color: "#1a1a2e" }}
        >
          Simulate a ticket
        </h3>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "#6b6b7d" }}
        >
          Test the live pipeline with a preset scenario or type your own
          request.
        </p>
      </div>

      <div id="agent-graph-viewport">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "#1a1a2e" }}
        >
          Presets
        </span>
        <div className="mt-3 flex flex-col gap-2.5">
          {mockTemplates.map((t, i) => (
            <button
              key={i}
              disabled={loading}
              onClick={() => triggerSimulation(t.sender, t.body)}
              className="group flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all disabled:opacity-50"
              style={{ background: "#fff", borderColor: "#e6dfd1" }}
            >
              <div className="flex w-full items-center gap-2">
                <span
                  className="h-2 min-w-2 rounded-full"
                  style={{ background: t.tone }}
                />
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "#1a1a2e" }}
                >
                  {t.label}
                </span>
              </div>
              <span className="pl-3.5 text-[11px]" style={{ color: "#6b6b7d" }}>
                {t.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px w-full" style={{ background: "#e6dfd1" }} />

      <div>
        <span
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "#1a1a2e" }}
        >
          Custom input
        </span>
        <div className="mt-3 flex flex-col gap-3">
          <input
            type="email"
            value={customSender}
            onChange={(e) => setCustomSender(e.target.value)}
            placeholder="Sender email"
            className="rounded-xl border px-3 py-2.5 text-[13px] transition focus:outline-none"
            style={{
              background: "#fff",
              borderColor: "#e6dfd1",
              color: "#1a1a2e",
            }}
          />
          <textarea
            rows={7}
            value={customBody}
            onChange={(e) => setCustomBody(e.target.value)}
            placeholder="Type an angry complaint or a billing question and watch the graph trigger…"
            className="resize-none rounded-xl border px-3 py-2.5 text-[13px] leading-relaxed transition focus:outline-none"
            style={{
              background: "#fff",
              borderColor: "#e6dfd1",
              color: "#1a1a2e",
            }}
          />
          <button
            disabled={loading || !customBody.trim()}
            onClick={() => triggerSimulation(customSender, customBody)}
            className="rounded-xl px-4 py-2.5 text-[13px] font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#0d5c63" }}
          >
            {loading ? "Processing…" : "Inject webhook"}
          </button>
        </div>
      </div>
    </div>
  );
}
