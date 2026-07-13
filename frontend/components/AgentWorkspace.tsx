// src/components/AgentWorkspace.tsx
// @ts-nocheck

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  BrainCircuit,
  Check,
  GitBranch,
  XCircle,
  Activity,
} from "lucide-react";
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
    if (ticket) {
      setEditedDraft(currentDraft || "");
    }
  }, [ticket, currentDraft]);

  useEffect(() => {
    if (currentDraft) {
      setEditedDraft(currentDraft);
    } else {
      setEditedDraft("");
    }
  }, [currentDraft]);

  if (!ticket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50 h-full">
        <BrainCircuit className="h-12 w-12 text-indigo-500/60 stroke-[1.5] mb-3 animate-pulse" />
        <p className="text-xs font-mono tracking-wide max-w-[280px] text-center leading-relaxed">
          Select an inbound pipeline node to visualize LangGraph orchestration
          tracks.
        </p>
      </div>
    );
  }

  const shouldShowApprovalWorkspace =
    ticket.status === "pending_approval" ||
    (currentDraft &&
      ticket.status !== "resolved" &&
      ticket.status !== "rejected");

  return (
    <div className="w-full h-full max-h-full flex flex-col overflow-hidden bg-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full max-h-full flex-1 overflow-hidden">
        {/* Left Hand: Ticket Details & NEW Real-time LangGraph Visual Engine */}
        <div className="p-6 overflow-y-auto border-r border-slate-200 flex flex-col space-y-5 custom-scrollbar h-full min-h-0">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-500">
              ⚡ Live Channel Stream Payload
            </span>
            <h1 className="text-lg font-mono font-semibold text-slate-900 mt-1 truncate">
              {ticket.sender}
            </h1>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              TIMESTAMP // {ticket.timestamp}
            </p>
          </div>

          <div className="p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-xs text-slate-700 font-normal leading-relaxed whitespace-pre-wrap shadow-sm shrink-0">
            {ticket.body}
          </div>

          {/* SWAPPED OUT TEXT LOGS WITH THE REACT FLOW CANVAS INTEGRATION */}
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              LangGraph Orchestration Trace Canvas
            </span>
            <ModeToggle />
            <div className="flex-1 w-full border border-slate-200 rounded-xl overflow-hidden relative bg-slate-100/20 min-h-[340px]">
              <AgentVisualGraph status={ticket.status} logs={graphLogs} />
            </div>
            <div className="border-t border-slate-200 bg-slate-50">
              <TraceLogsDisplay logs={graphLogs} />
            </div>
          </div>
        </div>

        {/* Right Hand: Human-In-The-Loop Interactive Control Interface */}
        <div className="p-6 bg-white flex flex-col space-y-5 h-full min-h-0 overflow-hidden">
          <div className="shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
              State Interpolation Intercept
            </span>
            <h3 className="text-sm font-semibold text-slate-800 mt-1">
              Autonomous Safety Assessment
            </h3>
          </div>

          {/* Render Condition Variant Context Blocks */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 space-y-4">
            {shouldShowApprovalWorkspace ? (
              <Card className="border-amber-500/20 shadow-sm bg-amber-500/[0.01] flex flex-col rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-amber-500/10 bg-amber-500/[0.01] shrink-0">
                  <CardTitle className="text-xs font-semibold font-mono flex items-center gap-2 text-amber-600">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Execution Paused: `interrupt()`
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 font-normal leading-relaxed mt-1">
                    High churn risk classification detected. Audit or mutate the
                    current LLM state machine context frame draft below before
                    unpausing.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-4 bg-slate-50/50">
                  <Textarea
                    value={editedDraft}
                    onChange={(e) => setEditedDraft(e.target.value)}
                    className="w-full min-h-[140px] font-mono text-xs p-3.5 bg-white border-slate-200 text-slate-800 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50 rounded-xl overflow-y-auto custom-scrollbar resize-none"
                    placeholder="Reviewing active agent response buffer data..."
                  />
                  <div className="flex items-center justify-end gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                      onClick={onReject}
                    >
                      Kill Thread Context
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-lg shadow-indigo-600/20 font-medium"
                      onClick={() => onApprove(editedDraft)}
                    >
                      <Check className="h-3.5 w-3.5" /> Commit State
                      Modification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : ticket.status === "rejected" ? (
              <div className="p-6 border border-rose-500/20 rounded-xl bg-rose-500/[0.01] shadow-sm text-center flex flex-col items-center justify-center">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 mb-3 animate-pulse">
                  <XCircle className="h-5 w-5" />
                </div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-rose-600">
                  Thread Killed — Manual Routing Engaged
                </h4>
                <p className="text-[11px] text-slate-600 mt-2 max-w-[290px] leading-relaxed">
                  The autonomous trace engine loop was terminated to enforce
                  safety barriers.
                </p>
              </div>
            ) : ticket.status === "resolved" ? (
              <div className="p-6 border border-emerald-500/20 rounded-xl bg-emerald-500/[0.01] shadow-sm text-center flex flex-col items-center justify-center">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 mb-3">
                  <Check className="h-5 w-5" />
                </div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Ticket Automation Finalized
                </h4>
                <p className="text-[11px] text-slate-600 mt-2 max-w-[240px] leading-relaxed">
                  Graph execution sequence concluded cleanly. Permanent ledger
                  checkpoints written down across datastores successfully.
                </p>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-center flex items-center justify-center">
                <p className="text-[11px] font-mono tracking-wider animate-pulse">
                  Asynchronous background workers active...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
