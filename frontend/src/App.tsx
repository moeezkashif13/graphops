// src/App.tsx
import { useState, useEffect } from "react";
import { TicketQueue } from "../components/TicketQueue";
import { Simulator } from "../components/Simulator";
import { AgentWorkspace } from "../components/AgentWorkspace";
import { BehindTheScenes } from "../components/BehindTheScenes";
import Tour from "../components/Tour";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Layers, Loader2, Terminal } from "lucide-react";
import {
  useGetTicketsQuery,
  useGetGraphStateQuery,
  useResumeGraphEngineMutation,
  useRejectGraphEngineMutation,
} from "@/redux/apiSlice";

export default function App() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isSimOpen, setIsSimOpen] = useState(false);
  const [isBtsOpen, setIsBtsOpen] = useState(false);

  // 1. Fetch live queue with automatic loading states and polling/caching
  const { data: tickets = [], isLoading: loadingQueue } = useGetTicketsQuery();

  // 2. Fetch the graph state checkpoint dynamically whenever a ticket is highlighted
  // ADDED: refetchOnMountOrArgChange forces RTK Query to check the server for fresh data
  const { data: graphState, refetch: refetchGraphState } =
    useGetGraphStateQuery(selectedTicketId ?? "", {
      skip: !selectedTicketId,
      refetchOnMountOrArgChange: true,
    });

  // 3. Destructure resume/reject mutations
  const [resumeGraph] = useResumeGraphEngineMutation();
  const [rejectGraph] = useRejectGraphEngineMutation();

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  // FORCE FIX: Automatically trigger a fresh server pull the moment the active
  // ticket changes state (e.g. from background 'processing' to 'pending_approval')
  useEffect(() => {
    if (
      selectedTicketId &&
      activeTicket &&
      activeTicket.status !== "processing"
    ) {
      refetchGraphState();
    }
  }, [selectedTicketId, activeTicket?.status, refetchGraphState]);

  const handleApproveAndResume = async (finalDraft: string) => {
    if (!selectedTicketId) return;
    try {
      await resumeGraph({ ticketId: selectedTicketId, finalDraft }).unwrap();
    } catch (err) {
      console.error(
        "Failed to unpause the target LangGraph engine state:",
        err,
      );
    }
  };

  const handleRejectWorkflow = async () => {
    if (!selectedTicketId) return;
    await rejectGraph(selectedTicketId).unwrap();
  };

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
  };

  // Convert the graph object parameters into sequential text arrays
  const derivedLogs = graphState
    ? [
        `Analyzing State Checkpoint for Thread Context: ${selectedTicketId}`,
        `Extracted Metadata Categories: [${graphState.categories.join(", ")}]`,
        `Sentiment Evaluated: ${graphState.sentiment}`,
        graphState.requiresHumanReview && !graphState.humanApproved
          ? "Condition Target Met: [requiresHumanReview = true] -> Graph Execution Interrupted. Awaiting human input."
          : "Graph processing successfully finalized.",
      ]
    : ["Select an inbound queue option to unpack execution logs..."];

  return (
    <>
      <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-slate-950 text-slate-100 antialiased">
        {/* ─── Premium Modern Header ─── */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-lg border border-indigo-500/20">
              <Layers className="h-5 w-5 text-indigo-400 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white">
                OmniAgent CRM Control Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBtsOpen(!isBtsOpen)}
              className="flex items-center gap-2 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-all"
            >
              <Terminal className="h-4 w-4 text-indigo-400" />
              {isBtsOpen ? "Hide Behind The Scenes" : "View Behind The Scenes"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              id="ticket-queue-trigger"
              onClick={() => setIsSimOpen(!isSimOpen)}
              className="flex items-center gap-2 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-all"
            >
              <Terminal className="h-4 w-4 text-indigo-400" />
              {isSimOpen ? "Hide Simulator" : "Open Simulation Panel"}
            </Button>
            <Badge
              variant="outline"
              className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 font-mono shadow-sm animate-pulse"
            >
              • Agent Engine Online
            </Badge>
          </div>
        </header>

        {/* ─── Main Content Container ─── */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Hand Queue Panel */}
          <div className="w-96 border-r border-slate-800 h-full flex flex-col bg-slate-900/20 shrink-0">
            {loadingQueue ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : (
              <TicketQueue
                tickets={tickets}
                selectedTicketId={selectedTicketId}
                onSelectTicket={handleSelectTicket}
              />
            )}
          </div>

          {/* Central Core Agent Workflow Canvas */}
          <main
            className={`flex-1 h-full ${!activeTicket ? "flex items-center" : ""} overflow-y-auto bg-slate-950/40 custom-scrollbar p-1`}
          >
            <AgentWorkspace
              key={selectedTicketId} // FORCE FIX: Destroys & completely resets workspace states on switch
              ticket={activeTicket}
              graphLogs={derivedLogs}
              currentDraft={graphState?.draftResponse || null}
              onApprove={handleApproveAndResume}
              onReject={handleRejectWorkflow}
            />
          </main>

          {/* Behind The Scenes Panel Start*/}
          <div
            className={`absolute top-0 right-0 h-full w-full bg-black shadow-2xl z-50 transition duration-300 ease-in-out flex flex-col ${
              isBtsOpen ? " translate-x-0" : " translate-x-full"
            }`}
          >
            <BehindTheScenes
            // isOpen={isBtsOpen}
            // onClose={() => setIsBtsOpen(false)}
            />
          </div>
          {/* Behind The Scenes Panel End */}

          <div
            className={`absolute top-0 right-0 h-full w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out flex flex-col ${
              isSimOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <span className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
                Pipeline Testing Playground
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSimOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs px-2 h-7"
              >
                ✕ Close
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <Simulator
                toggleSimulator={setIsSimOpen}
                onTicketCreated={(id) => setSelectedTicketId(id)}
              />
            </div>
          </div>
        </div>
      </div>

      <Tour />
    </>
  );
}
