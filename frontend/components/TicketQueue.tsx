import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

export interface Ticket {
  id: string;
  sender: string;
  body: string;
  category: string[] | null;
  sentiment: "URGENT_CHURN" | "NEUTRAL" | "ANGRY" | null;
  status: "processing" | "pending_approval" | "resolved" | "rejected";
  timestamp: string;
}

interface TicketQueueProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
}

export function TicketQueue({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: TicketQueueProps) {
  const getSentimentBadge = (sentiment: Ticket["sentiment"]) => {
    switch (sentiment) {
      case "URGENT_CHURN":
        return (
          <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] gap-1 hover:bg-red-500/20">
            <ShieldAlert className="h-3 w-3" /> Churn Risk
          </Badge>
        );
      case "ANGRY":
        return (
          <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] gap-1 hover:bg-orange-500/20">
            <AlertCircle className="h-3 w-3" /> Angry
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] hover:bg-slate-100">
            Neutral
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: Ticket["status"]) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4 text-indigo-400 animate-pulse" />;
      case "pending_approval":
        return <AlertCircle className="h-4 w-4 text-amber-400" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
    }
  };

  return (
    // Fixed: Force strict maximum heights and block native window overflows
    <div className="w-full h-full max-h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Header Context Section */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 backdrop-blur-sm shrink-0">
        <h2 className="font-semibold text-sm tracking-tight text-slate-900">
          Inbound Triage Engine
        </h2>
        <p className="text-[11px] text-slate-500 font-mono tracking-wider mt-0.5">
          Real-time asynchronous streams
        </p>
      </div>

      {/* Stream Queue Item List */}
      {/* Fixed: Added min-h-0 so flexbox allows the container to shrink and scroll rather than overflow */}
      <div className="flex-1 min-h-0 w-full">
        <ScrollArea className="h-full w-full p-3 custom-scrollbar">
          <div className="space-y-2 pb-6">
            {tickets.map((ticket) => {
              const isSelected = selectedTicketId === ticket.id;
              return (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition-all duration-200 border bg-white backdrop-blur-sm ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/50 shadow-sm shadow-indigo-500/10 ring-1 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  onClick={() => onSelectTicket(ticket.id)}
                >
                  <CardContent className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-mono font-medium truncate ${
                          isSelected ? "text-indigo-600" : "text-slate-700"
                        }`}
                      >
                        {ticket.sender}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-500">
                          {ticket.timestamp}
                        </span>
                        {getStatusIcon(ticket.status)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 font-normal leading-relaxed">
                      {ticket.body}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ticket.sentiment && getSentimentBadge(ticket.sentiment)}
                      {ticket.category?.map((cat) => (
                        <Badge
                          key={cat}
                          className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] uppercase font-semibold tracking-wider font-mono"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
