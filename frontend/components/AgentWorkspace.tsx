// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { BrainCircuit, Check, XCircle, Activity } from "lucide-react";
import type { Ticket } from "./TicketQueue";
import { AgentVisualGraph } from "./AgentVisualGraph";
import { ModeToggle } from "./ModeToggle";
import { TraceLogsDisplay } from "./LogsDisplay";

interface AgentWorkspaceProps {
  ticket: Ticket | null;
  graphLogs: string[];
  currentDraft: string | null;
  onApprove: (finalDraft: string) => void;
  onReject: () => void;
}

export function AgentWorkspace({
  ticket,
  graphLogs,
  currentDraft,
  onReject,
  onApprove,
}: AgentWorkspaceProps) {
  const [editedDraft, setEditedDraft] = useState("");

  useEffect(() => {
    setEditedDraft(currentDraft || "");
  }, [ticket, currentDraft]);

  if (!ticket) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        style={{ background: "#faf7f2" }}
      >
        <div
          className="grid h-16 w-16 place-items-center rounded-full border"
          style={{ borderColor: "#e6dfd1", background: "#fff" }}
        >
          <BrainCircuit
            className="h-7 w-7"
            style={{ color: "#0d5c63" }}
            strokeWidth={1.5}
          />
        </div>
        <h2 className="mt-6 font-serif text-3xl" style={{ color: "#1a1a2e" }}>
          Select a ticket
        </h2>
        <p
          className="mt-2 max-w-sm text-center text-sm"
          style={{ color: "#6b6b7d" }}
        >
          Choose an inbound thread from the queue to inspect its orchestration
          trace.
        </p>
      </div>
    );
  }

  const showApproval =
    ticket.status === "pending_approval" ||
    (currentDraft &&
      ticket.status !== "resolved" &&
      ticket.status !== "rejected");

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ background: "#faf7f2" }}
    >
      <div className="grid h-full w-full flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        {/* LEFT — Payload + Graph */}
        <section
          className="custom-scrollbar flex h-full flex-col space-y-6 overflow-y-auto border-r p-8"
          style={{ borderColor: "#e6dfd1" }}
        >
          <div>
            <span
              className="text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "#0d5c63" }}
            >
              Live
            </span>
            <h1
              className="my-2 truncate font-serif text-2xl leading-none"
              style={{ color: "#1a1a2e" }}
            >
              {ticket.sender}
            </h1>
            <p className=" font-serif text-[11px]" style={{ color: "#6b6b7d" }}>
              {ticket.timestamp}
            </p>
          </div>

          <div
            className="shrink-0 rounded-2xl border p-5 text-sm leading-relaxed"
            style={{
              background: "#fff",
              borderColor: "#e6dfd1",
              color: "#3a3a52",
            }}
          >
            {ticket.body}
          </div>

          <div className="flex min-h-0 flex-1 flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]"
                style={{ color: "#1a1a2e" }}
              >
                <Activity
                  className="h-3.5 w-3.5"
                  style={{ color: "#e07856" }}
                />
                Orchestration trace
              </span>
              <ModeToggle />
            </div>
            <div
              className="relative min-h-[360px] w-full flex-1 overflow-hidden rounded-2xl border"
              style={{ borderColor: "#e6dfd1", background: "#fff" }}
            >
              <AgentVisualGraph status={ticket.status} logs={graphLogs} />
            </div>
            <TraceLogsDisplay logs={graphLogs} />
          </div>
        </section>

        {/* RIGHT — Human in the loop */}
        <section
          className="flex h-full min-h-0 flex-col space-y-6 overflow-hidden p-8"
          style={{ background: "#fff" }}
        >
          <div className="shrink-0">
            <span
              className="text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "#e07856" }}
            >
              Interpolation intercept
            </span>
            <h3
              className="mt-2 font-serif text-3xl leading-none"
              style={{ color: "#1a1a2e" }}
            >
              Safety assessment
            </h3>
          </div>

          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-1">
            {showApproval ? (
              <div
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: "#d4a147", background: "#fbf1dc" }}
              >
                <div
                  className="border-b px-5 py-4"
                  style={{ borderColor: "#e8d49a" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 animate-pulse rounded-full"
                      style={{ background: "#d4a147" }}
                    />
                    <span
                      className="font-serif text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: "#8a6414" }}
                    >
                      Execution paused · interrupt()
                    </span>
                  </div>
                  <p
                    className="mt-2 text-[13px] leading-relaxed"
                    style={{ color: "#5c4a1e" }}
                  >
                    High churn risk detected. Audit or edit the draft below
                    before resuming the graph.
                  </p>
                </div>
                <div
                  className="space-y-4 p-5"
                  style={{ background: "#faf7f2" }}
                >
                  <Textarea
                    value={editedDraft}
                    onChange={(e) => setEditedDraft(e.target.value)}
                    className="custom-scrollbar min-h-[180px] w-full resize-none rounded-xl border p-4 font-serif text-[13px] leading-relaxed"
                    style={{
                      background: "#fff",
                      borderColor: "#e6dfd1",
                      color: "#1a1a2e",
                    }}
                    placeholder="Reviewing agent response buffer..."
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onReject}
                      className="border font-medium text-xs"
                      style={{
                        borderColor: "#a63d40",
                        background: "#f6e5e5",
                        color: "#a63d40",
                      }}
                    >
                      Reject thread
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApprove(editedDraft)}
                      className="gap-1.5 text-xs font-medium text-white"
                      style={{ background: "#0d5c63" }}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve & resume
                    </Button>
                  </div>
                </div>
              </div>
            ) : ticket.status === "rejected" ? (
              <StatusPanel
                tone={{ border: "#a63d40", bg: "#f6e5e5", fg: "#a63d40" }}
                icon={<XCircle className="h-5 w-5" />}
                title="Thread terminated"
                body="The autonomous loop was closed to enforce safety."
              />
            ) : ticket.status === "resolved" ? (
              <StatusPanel
                tone={{ border: "#7a9b76", bg: "#ecf1ea", fg: "#4a6a48" }}
                icon={<Check className="h-5 w-5" />}
                title="Automation finalized"
                body="Graph concluded cleanly. Checkpoints written to datastore."
              />
            ) : (
              <div
                className="rounded-2xl border border-dashed p-10 text-center"
                style={{ borderColor: "#e6dfd1", background: "#faf7f2" }}
              >
                <p
                  className="font-serif text-[11px] animate-pulse"
                  style={{ color: "#6b6b7d" }}
                >
                  Background workers active…
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusPanel({ tone, icon, title, body }: any) {
  return (
    <div
      className="flex flex-col items-center rounded-2xl border p-8 text-center"
      style={{ borderColor: tone.border, background: tone.bg }}
    >
      <div
        className="grid h-11 w-11 place-items-center rounded-full"
        style={{ background: "#fff", color: tone.fg }}
      >
        {icon}
      </div>
      <h4 className="mt-4 font-serif text-2xl" style={{ color: tone.fg }}>
        {title}
      </h4>
      <p
        className="mt-1 max-w-xs text-[13px] leading-relaxed"
        style={{ color: "#3a3a52" }}
      >
        {body}
      </p>
    </div>
  );
}
