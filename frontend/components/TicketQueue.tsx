import { ScrollArea } from "./ui/scroll-area";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

export interface Ticket {
  id: string;
  sender: string;
  body: string;
  category: string[] | null;
  sentiment: "URGENT_CHURN" | "NEUTRAL" | "ANGRY" | null;
  status: "processing" | "pending_approval" | "resolved" | "rejected";
  timestamp: string;
  createdAt: string;
}

interface TicketQueueProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
}

const sentimentTone = (s: Ticket["sentiment"]) => {
  switch (s) {
    case "URGENT_CHURN":
      return {
        label: "Churn risk",
        bg: "#f6e5e5",
        fg: "#a63d40",
        Icon: ShieldAlert,
      };
    case "ANGRY":
      return {
        label: "Angry",
        bg: "#fbeae2",
        fg: "#c05a30",
        Icon: AlertCircle,
      };
    default:
      return { label: "Neutral", bg: "#ecf1ea", fg: "#4a6a48", Icon: null };
  }
};

const statusIcon = (s: Ticket["status"]) => {
  switch (s) {
    case "processing":
      return (
        <Clock className="h-4 w-4 animate-pulse" style={{ color: "#0d5c63" }} />
      );
    case "pending_approval":
      return <AlertCircle className="h-4 w-4" style={{ color: "#d4a147" }} />;
    case "resolved":
      return <CheckCircle2 className="h-4 w-4" style={{ color: "#7a9b76" }} />;
    default:
      return <AlertCircle className="h-4 w-4" style={{ color: "#a63d40" }} />;
  }
};

export function TicketQueue({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: TicketQueueProps) {
  return (
    <div
      className="flex h-full max-h-full w-full flex-col overflow-hidden"
      style={{ background: "#faf7f2" }}
    >
      <div
        className="shrink-0 border-b px-6 py-5"
        style={{ borderColor: "#e6dfd1" }}
      >
        <span
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "#e07856" }}
        >
          Inbound
        </span>
        <h2
          className="mt-1 font-serif text-3xl leading-none"
          style={{ color: "#1a1a2e" }}
        >
          Triage queue
        </h2>
        <p className="mt-1.5 text-[12px]" style={{ color: "#6b6b7d" }}>
          Real-time asynchronous streams
        </p>
      </div>

      <div className="min-h-0 w-full flex-1">
        <ScrollArea className="custom-scrollbar h-full w-full p-4">
          <div className="space-y-2.5 pb-6">
            {tickets.map((ticket) => {
              const isSelected = selectedTicketId === ticket.id;
              const tone = sentimentTone(ticket.sentiment);
              return (
                <button
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket.id)}
                  className="w-full rounded-2xl border p-4 text-left transition-all"
                  style={{
                    background: isSelected ? "#fff" : "#fff",
                    borderColor: isSelected ? "#0d5c63" : "#e6dfd1",
                    boxShadow: isSelected
                      ? "0 6px 24px -14px rgba(13,92,99,0.5)"
                      : "none",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="truncate text-[13px] font-medium"
                      style={{ color: isSelected ? "#0d5c63" : "#1a1a2e" }}
                    >
                      {ticket.sender}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className="font-serif text-[10px]"
                        style={{ color: "#6b6b7d" }}
                      >
                        {ticket.timestamp}
                      </span>
                      {statusIcon(ticket.status)}
                    </div>
                  </div>

                  <p
                    className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed"
                    style={{ color: "#3a3a52" }}
                  >
                    {ticket.body}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {ticket.sentiment && (
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: tone.bg, color: tone.fg }}
                      >
                        {tone.Icon && <tone.Icon className="h-2.5 w-2.5" />}
                        {tone.label}
                      </span>
                    )}
                    {ticket.category?.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border px-2 py-0.5 font-serif text-[10px] uppercase tracking-wider"
                        style={{
                          borderColor: "#e6dfd1",
                          color: "#6b6b7d",
                          background: "#faf7f2",
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
