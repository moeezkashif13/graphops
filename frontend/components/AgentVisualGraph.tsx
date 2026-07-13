import React, { useMemo } from "react";
import { ReactFlow, Position, Handle } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { Ticket } from "./TicketQueue";
import {
  Webhook,
  Brain,
  Search,
  PenTool,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

interface AgentVisualGraphProps {
  status: Ticket["status"]; // 'processing' | 'pending_approval' | 'resolved' | 'rejected'
  logs?: string[];
}

const CustomWorkflowNode = ({ data }: any) => {
  const Icon = data.icon;
  return (
    <div
      className={`px-3 py-2.5 shadow-2xl rounded-xl border font-mono transition-all duration-300 w-[170px] backdrop-blur-sm relative ${
        data.isActive
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-indigo-500/5 ring-1 ring-indigo-500/20"
          : data.isPaused
            ? "border-amber-500 bg-amber-50 text-amber-700 shadow-amber-500/5 ring-1 ring-amber-500/20 animate-pulse"
            : data.isCompleted
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : data.isFailed
                ? "border-rose-500 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center gap-2">
        <div
          className={`p-1 rounded-lg border shrink-0 ${
            data.isActive || data.isPaused
              ? "bg-indigo-500/10 border-indigo-500/20"
              : data.isCompleted
                ? "bg-emerald-500/10 border-emerald-500/20"
                : data.isFailed
                  ? "bg-rose-500/10 border-rose-500/20"
                  : "bg-white border-slate-200"
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[9px] uppercase font-bold tracking-wider leading-none truncate">
            {data.label}
          </span>
          <span className="text-[8px] font-medium opacity-60 mt-0.5 truncate uppercase">
            {data.subLabel}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = { workflow: CustomWorkflowNode };

export function AgentVisualGraph({ status, logs = [] }: AgentVisualGraphProps) {
  const hasLog = (term: string) =>
    logs.some((log) => log.toLowerCase().includes(term));

  // Trace telemetry steps matching backend node executions
  const pipelineState = useMemo(() => {
    const totalLogs = logs.length;

    const isProcessing = status === "processing";
    const isPaused = status === "pending_approval";
    const isResolved = status === "resolved";
    const isRejected = status === "rejected";

    // 1. Classifier Node State
    const classifierActive =
      isProcessing && (totalLogs === 0 || hasLog("classifier"));
    const classifierDone =
      totalLogs > 0 || isPaused || isResolved || isRejected;

    // 2. Researcher Node State
    const researcherActive = isProcessing && hasLog("researcher");
    const researcherDone =
      hasLog("composer") || isPaused || isResolved || isRejected;

    // 3. Composer Node State
    const composerActive = isProcessing && hasLog("composer");
    const composerDone = isPaused || isResolved || isRejected;

    // 4. Human Review Node State (Conditional path selection matching backend)
    const humanActive = isPaused;
    const humanDone = isResolved && hasLog("review"); // If it went through human checkpoint

    return {
      classifierActive,
      classifierDone,
      researcherActive,
      researcherDone,
      composerActive,
      composerDone,
      humanActive,
      humanDone,
    };
  }, [status, logs]);

  const nodes = useMemo(() => {
    const isProcessing = status === "processing";
    const isPaused = status === "pending_approval";
    const isResolved = status === "resolved";
    const isRejected = status === "rejected";

    return [
      {
        id: "classifier",
        type: "workflow",
        position: { x: 110, y: 10 },
        data: {
          label: "Classifier",
          subLabel: pipelineState.classifierActive
            ? "Evaluating Sentiment..."
            : "Inbound Cleared",
          icon: Brain,
          isActive: pipelineState.classifierActive,
          isCompleted: pipelineState.classifierDone,
        },
      },
      {
        id: "researcher",
        type: "workflow",
        position: { x: 110, y: 90 },
        data: {
          label: "RAG Researcher",
          subLabel: pipelineState.researcherActive
            ? "Querying pgvector..."
            : pipelineState.researcherDone
              ? "Context Injected"
              : "Awaiting State",
          icon: Search,
          isActive: pipelineState.researcherActive,
          isCompleted: pipelineState.researcherDone,
        },
      },
      {
        id: "composer",
        type: "workflow",
        position: { x: 110, y: 170 },
        data: {
          label: "Composer",
          subLabel: pipelineState.composerActive
            ? "Drafting Gemini Flash..."
            : pipelineState.composerDone
              ? "Draft Completed"
              : "Waiting for Data",
          icon: PenTool,
          isActive: pipelineState.composerActive,
          isCompleted: pipelineState.composerDone,
        },
      },
      // BRANCH PATH A: Human Review Boundary (Triggered via conditional edge routing)
      {
        id: "human_review",
        type: "workflow",
        position: { x: 10, y: 270 },
        data: {
          label: "Human Review",
          subLabel: isPaused
            ? "Awaiting Action"
            : isResolved
              ? "Approved & Resumed"
              : isRejected
                ? "Thread Terminated"
                : "Bypassed",
          icon: UserCheck,
          isPaused: isPaused,
          isCompleted: isResolved && !isProcessing,
          isFailed: isRejected,
        },
      },
      // BRANCH PATH B: Straight to Exit Terminal (Bypassing Human review safely)
      {
        id: "end_terminal",
        type: "workflow",
        position: { x: 210, y: 360 },
        data: {
          label: "Terminal Exit",
          subLabel: isResolved
            ? "Payload Dispatched"
            : isRejected
              ? "Session Dead"
              : "Awaiting Stream",
          icon: CheckCircle2,
          isCompleted: isResolved,
          isFailed: isRejected,
        },
      },
    ];
  }, [status, pipelineState]);

  const edges = useMemo(() => {
    const isPaused = status === "pending_approval";
    const isResolved = status === "resolved";
    const isRejected = status === "rejected";

    return [
      {
        id: "e-class-research",
        source: "classifier",
        target: "researcher",
        animated: pipelineState.classifierActive,
        style: {
          stroke: pipelineState.classifierActive
            ? "#6366f1"
            : pipelineState.classifierDone
              ? "#10b981"
              : "#cbd5e1",
          strokeWidth: 1.5,
        },
      },
      {
        id: "e-research-compose",
        source: "researcher",
        target: "composer",
        animated: pipelineState.researcherActive,
        style: {
          stroke: pipelineState.researcherActive
            ? "#6366f1"
            : pipelineState.researcherDone
              ? "#10b981"
              : "#cbd5e1",
          strokeWidth: 1.5,
        },
      },
      // CONDITIONAL ROUTE LEFT: Activated when requiresHumanReview is true
      {
        id: "e-compose-human",
        source: "composer",
        target: "human_review",
        label: isPaused || isRejected ? "requires review" : "",
        labelStyle: { fill: "#f59e0b", fontSize: 7, fontFamily: "monospace" },
        animated: isPaused,
        style: {
          stroke: isPaused
            ? "#f59e0b"
            : isRejected
              ? "#f43f5e"
              : isResolved && !pipelineState.humanDone
                ? "#cbd5e1"
                : "#10b981",
          strokeWidth: 1.5,
          strokeDasharray: isPaused ? "4" : "0",
        },
      },
      // CONDITIONAL ROUTE RIGHT: Straight optimization path skipping review
      {
        id: "e-compose-end",
        source: "composer",
        target: "end_terminal",
        label: isResolved && !isPaused ? "auto-clear" : "",
        labelStyle: { fill: "#10b981", fontSize: 7, fontFamily: "monospace" },
        style: {
          stroke: isResolved && !isPaused ? "#10b981" : "#cbd5e1",
          strokeWidth: 1.5,
        },
      },
      // LINK FROM HUMAN EXITS INTO COMPLETION TERMINAL
      {
        id: "e-human-end",
        source: "human_review",
        target: "end_terminal",
        style: {
          stroke: isResolved ? "#10b981" : isRejected ? "#f43f5e" : "#cbd5e1",
          strokeWidth: 1.5,
        },
      },
    ];
  }, [status, pipelineState]);

  return (
    <div className="w-full h-full bg-slate-50 relative shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        // nodesDraggable={false}
        // nodesConnectable={false}
        // zoomOnScroll={false}
        // zoomOnPinch={false}
        // panOnDrag={false}
      />
    </div>
  );
}
