import { useState, useEffect } from "react";
import { TicketQueue } from "../components/TicketQueue";
import { Simulator } from "../components/Simulator";
import { AgentWorkspace } from "../components/AgentWorkspace";
import { BehindTheScenes } from "../components/BehindTheScenes";
import Tour from "../components/Tour";
import { Button } from "../components/ui/button";
import { Keyboard, Layers, Loader2, Terminal, User, X } from "lucide-react";
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

  const { data: tickets = [], isLoading: loadingQueue } = useGetTicketsQuery();
  const { data: graphState, refetch: refetchGraphState } =
    useGetGraphStateQuery(selectedTicketId ?? "", {
      skip: !selectedTicketId,
      refetchOnMountOrArgChange: true,
    });
  const [resumeGraph] = useResumeGraphEngineMutation();
  const [rejectGraph] = useRejectGraphEngineMutation();
  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  useEffect(() => {
    if (
      selectedTicketId &&
      activeTicket &&
      activeTicket.status !== "processing"
    )
      refetchGraphState();
  }, [selectedTicketId, activeTicket?.status, refetchGraphState]);

  const handleApproveAndResume = async (finalDraft: string) => {
    if (!selectedTicketId) return;
    try {
      await resumeGraph({ ticketId: selectedTicketId, finalDraft }).unwrap();
    } catch (err) {
      console.error("Failed to resume:", err);
    }
  };
  const handleRejectWorkflow = async () => {
    if (!selectedTicketId) return;
    await rejectGraph(selectedTicketId).unwrap();
  };

  const derivedLogs = graphState
    ? [
        `Analyzing state checkpoint for thread: ${selectedTicketId}`,
        `Extracted categories: [${graphState.categories.join(", ")}]`,
        `Sentiment: ${graphState.sentiment}`,
        graphState.requiresHumanReview && !graphState.humanApproved
          ? "Condition met: requiresHumanReview = true → graph interrupted, awaiting human input."
          : "Graph processing finalized.",
      ]
    : ["Select an inbound ticket to unpack execution logs…"];

  return (
    <>
      <div
        className="flex h-screen w-screen flex-col overflow-hidden antialiased font-sans"
        style={{
          background: "#faf7f2",
          color: "#1a1a2e",
        }}
      >
        {/* HEADER */}
        <header
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-6 py-4 sm:flex sm:justify-between"
          style={{ borderColor: "#e6dfd1", background: "#fff" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{ background: "#0d5c63" }}
            >
              <Layers className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div
                className="truncate font-serif text-2xl leading-none"
                style={{ color: "#1a1a2e" }}
              >
                GraphOps
              </div>
              <div
                className="mt-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em]"
                style={{ color: "#6b6b7d" }}
              >
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ background: "#7a9b76" }}
                />
                Agent engine online
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 border text-[12px] font-medium"
              style={{
                borderColor: "#e6dfd1",
                background: "#faf7f2",
                color: "#1a1a2e",
              }}
            >
              <a
                href="https://abdulmoeez.online"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-2.5"
              >
                <User className="h-4 w-4" style={{ color: "#e07856" }} />{" "}
                Portfolio
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsBtsOpen(!isBtsOpen);
                setIsSimOpen(false);
              }}
              className="gap-2 text-[12px] font-medium"
              style={{
                borderColor: "#e6dfd1",
                background: "#faf7f2",
                color: "#1a1a2e",
              }}
            >
              <Terminal className="h-4 w-4" style={{ color: "#d4a147" }} />
              {isBtsOpen ? "Hide architecture" : "Architecture"}
            </Button>
            <Button
              size="sm"
              id="ticket-queue-trigger"
              onClick={() => {
                setIsBtsOpen(false);
                setIsSimOpen(!isSimOpen);
              }}
              className="gap-2 text-[12px] font-medium text-white"
              style={{ background: "#e07856" }}
            >
              <Keyboard className="h-4 w-4" />
              {isSimOpen ? "Close simulator" : "Open simulator"}
            </Button>
          </div>
        </header>

        {/* MAIN */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Queue */}
          <aside
            className="flex h-full w-96 shrink-0 flex-col border-r"
            style={{ borderColor: "#e6dfd1" }}
          >
            {loadingQueue ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2
                  className="h-6 w-6 animate-spin"
                  style={{ color: "#0d5c63" }}
                />
              </div>
            ) : (
              <TicketQueue
                tickets={tickets}
                selectedTicketId={selectedTicketId}
                onSelectTicket={setSelectedTicketId}
              />
            )}
          </aside>

          {/* Workspace */}
          <main className="flex-1 overflow-hidden">
            <AgentWorkspace
              key={selectedTicketId}
              ticket={activeTicket}
              graphLogs={derivedLogs}
              currentDraft={graphState?.draftResponse || null}
              onApprove={handleApproveAndResume}
              onReject={handleRejectWorkflow}
            />
          </main>

          {/* BTS overlay */}
          <div
            className={`absolute inset-0 z-40 transition-transform duration-300 ease-in-out ${isBtsOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <BehindTheScenes />
          </div>

          {/* Simulator drawer */}
          <div
            className={`absolute top-0 right-0 z-30 flex h-full w-[440px] max-w-full flex-col border-l shadow-2xl transition-transform duration-300 ease-in-out ${isSimOpen ? "translate-x-0" : "translate-x-full"}`}
            style={{ background: "#faf7f2", borderColor: "#e6dfd1" }}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: "#e6dfd1", background: "#fff" }}
            >
              <span
                className="text-[11px] font-medium uppercase tracking-[0.18em]"
                style={{ color: "#6b6b7d" }}
              >
                Pipeline playground
              </span>
              <button
                onClick={() => setIsSimOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full transition-colors"
                style={{ color: "#6b6b7d", background: "#faf7f2" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
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
