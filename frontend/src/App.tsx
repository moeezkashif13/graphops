// src/App.tsx
import { useState, useEffect } from "react";
import { TicketQueue } from "../components/TicketQueue";
import { Simulator } from "../components/Simulator";
import { AgentWorkspace } from "../components/AgentWorkspace";
import { BehindTheScenes } from "../components/BehindTheScenes";
import Tour from "../components/Tour";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Keyboard, Layers, Loader2, Terminal, User } from "lucide-react";
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
      <div className="h-screen w-screen flex flex-col overflow-hidden font-sans bg-slate-50 text-slate-800 antialiased">
        {/* ─── Premium Modern Header ─── */}
        <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-lg border border-indigo-500/20">
              <Layers className="h-5 w-5 text-indigo-400 stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-slate-900">
                GraphOps Control Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className=" cursor-pointer gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs transition-all p-0!"
            >
              <a
                href="https://abdulmoeez.online"
                target="_blank"
                className="px-2.5 flex items-center h-full gap-2 "
              >
                <User className="h-4 w-4 text-indigo-400" />
                <p>View Portfolio</p>
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsBtsOpen(!isBtsOpen);
                setIsSimOpen(false);
              }}
              className="flex items-center cursor-pointer gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs transition-all"
            >
              <Terminal className="h-4 w-4 text-indigo-400" />
              {isBtsOpen ? "Hide Behind The Scenes" : "View Behind The Scenes"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              id="ticket-queue-trigger"
              onClick={() => {
                setIsBtsOpen(false);
                setIsSimOpen(!isSimOpen);
              }}
              className="flex items-center cursor-pointer gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs transition-all"
            >
              <Keyboard className="h-4 w-4 text-indigo-400" />
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
          <div className="w-96 border-r border-slate-200 h-full flex flex-col bg-slate-100/30 shrink-0">
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
            className={`flex-1 ${!activeTicket ? "flex items-center" : ""} bg-slate-50/50 custom-scrollbar p-1`}
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
            className={`absolute top-0 right-0 h-full w-full bg-black/85 shadow-2xl z-50 transition duration-300 ease-in-out flex flex-col ${
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
            className={`absolute top-0 right-0 h-full w-[420px] bg-white border-l border-slate-200 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out flex flex-col ${
              isSimOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">
                Pipeline Testing Playground
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSimOpen(false)}
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs px-2 h-7"
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
