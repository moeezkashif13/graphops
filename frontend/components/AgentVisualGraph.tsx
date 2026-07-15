import React, { useMemo } from "react";
import { ReactFlow, Position, Handle } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { Ticket } from "./TicketQueue";
import { Brain, Search, PenTool, UserCheck, CheckCircle2 } from "lucide-react";

interface AgentVisualGraphProps {
  status: Ticket["status"];
  logs?: string[];
}

const CustomWorkflowNode = ({ data }: any) => {
  const Icon = data.icon;
  const tone = data.isActive
    ? { bg: "#e4efef", bd: "#0d5c63", fg: "#0d5c63", dot: "#0d5c63" }
    : data.isPaused
      ? { bg: "#fbf1dc", bd: "#d4a147", fg: "#8a6414", dot: "#d4a147" }
      : data.isCompleted
        ? { bg: "#ecf1ea", bd: "#7a9b76", fg: "#4a6a48", dot: "#7a9b76" }
        : data.isFailed
          ? { bg: "#f6e5e5", bd: "#a63d40", fg: "#a63d40", dot: "#a63d40" }
          : { bg: "#faf7f2", bd: "#e6dfd1", fg: "#6b6b7d", dot: "#c9c0ad" };

  return (
    <div
      className="relative w-[190px] rounded-2xl border px-4 py-3 transition-all duration-300"
      style={{
        background: tone.bg,
        borderColor: tone.bd,
        color: tone.fg,
        boxShadow: data.isActive ? `0 4px 20px -10px ${tone.bd}` : "none",
      }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center gap-3">
        <div
          className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border"
          style={{ background: "#fff", borderColor: tone.bd + "55" }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-serif text-[15px] leading-tight truncate">
            {data.label}
          </div>
          <div className="mt-0.5 truncate text-[10px] font-sans opacity-70">
            {data.subLabel}
          </div>
        </div>
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{
            background: tone.dot,
            boxShadow: data.isActive ? `0 0 0 4px ${tone.dot}22` : "none",
          }}
        />
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = { workflow: CustomWorkflowNode };

export function AgentVisualGraph({ status, logs = [] }: AgentVisualGraphProps) {
  const hasLog = (term: string) =>
    logs.some((l) => l.toLowerCase().includes(term));

  const pipelineState = useMemo(() => {
    const totalLogs = logs.length;
    const isProcessing = status === "processing";
    const isPaused = status === "pending_approval";
    const isResolved = status === "resolved";
    const isRejected = status === "rejected";
    return {
      classifierActive:
        isProcessing && (totalLogs === 0 || hasLog("classifier")),
      classifierDone: totalLogs > 0 || isPaused || isResolved || isRejected,
      researcherActive: isProcessing && hasLog("researcher"),
      researcherDone:
        hasLog("composer") || isPaused || isResolved || isRejected,
      composerActive: isProcessing && hasLog("composer"),
      composerDone: isPaused || isResolved || isRejected,
      humanActive: isPaused,
      humanDone: isResolved && hasLog("review"),
    };
  }, [status, logs]);

  const nodes = useMemo(() => {
    const isPaused = status === "pending_approval";
    const isResolved = status === "resolved";
    const isRejected = status === "rejected";
    const isProcessing = status === "processing";
    return [
      {
        id: "classifier",
        type: "workflow",
        position: { x: 110, y: 10 },
        data: {
          label: "Classifier",
          subLabel: pipelineState.classifierActive
            ? "Evaluating sentiment"
            : "Inbound cleared",
          icon: Brain,
          isActive: pipelineState.classifierActive,
          isCompleted: pipelineState.classifierDone,
        },
      },
      {
        id: "researcher",
        type: "workflow",
        position: { x: 110, y: 100 },
        data: {
          label: "Researcher",
          subLabel: pipelineState.researcherActive
            ? "Querying pgvector"
            : pipelineState.researcherDone
              ? "Context injected"
              : "Awaiting state",
          icon: Search,
          isActive: pipelineState.researcherActive,
          isCompleted: pipelineState.researcherDone,
        },
      },
      {
        id: "composer",
        type: "workflow",
        position: { x: 110, y: 190 },
        data: {
          label: "Composer",
          subLabel: pipelineState.composerActive
            ? "Drafting response"
            : pipelineState.composerDone
              ? "Draft ready"
              : "Waiting",
          icon: PenTool,
          isActive: pipelineState.composerActive,
          isCompleted: pipelineState.composerDone,
        },
      },
      {
        id: "human_review",
        type: "workflow",
        position: { x: 0, y: 300 },
        data: {
          label: "Human Review",
          subLabel: isPaused
            ? "Awaiting action"
            : isResolved
              ? "Approved"
              : isRejected
                ? "Terminated"
                : "Bypassed",
          icon: UserCheck,
          isPaused,
          isCompleted: isResolved && !isProcessing,
          isFailed: isRejected,
        },
      },
      {
        id: "end_terminal",
        type: "workflow",
        position: { x: 220, y: 390 },
        data: {
          label: "Terminal",
          subLabel: isResolved
            ? "Dispatched"
            : isRejected
              ? "Closed"
              : "Awaiting",
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
    const stroke = (active: boolean, done: boolean) =>
      active ? "#0d5c63" : done ? "#7a9b76" : "#c9c0ad";
    return [
      {
        id: "e1",
        source: "classifier",
        target: "researcher",
        animated: pipelineState.classifierActive,
        style: {
          stroke: stroke(
            pipelineState.classifierActive,
            pipelineState.classifierDone,
          ),
          strokeWidth: 1.5,
        },
      },
      {
        id: "e2",
        source: "researcher",
        target: "composer",
        animated: pipelineState.researcherActive,
        style: {
          stroke: stroke(
            pipelineState.researcherActive,
            pipelineState.researcherDone,
          ),
          strokeWidth: 1.5,
        },
      },
      {
        id: "e3",
        source: "composer",
        target: "human_review",
        label: isPaused || isRejected ? "requires review" : "",
        labelStyle: {
          fill: "#d4a147",
          fontSize: 9,
          fontFamily: "JetBrains Mono",
        },
        animated: isPaused,
        style: {
          stroke: isPaused
            ? "#d4a147"
            : isRejected
              ? "#a63d40"
              : isResolved && !pipelineState.humanDone
                ? "#c9c0ad"
                : "#7a9b76",
          strokeWidth: 1.5,
          strokeDasharray: isPaused ? "4" : "0",
        },
      },
      {
        id: "e4",
        source: "composer",
        target: "end_terminal",
        label: isResolved && !isPaused ? "auto-clear" : "",
        labelStyle: {
          fill: "#7a9b76",
          fontSize: 9,
          fontFamily: "JetBrains Mono",
        },
        style: {
          stroke: isResolved && !isPaused ? "#7a9b76" : "#c9c0ad",
          strokeWidth: 1.5,
        },
      },
      {
        id: "e5",
        source: "human_review",
        target: "end_terminal",
        style: {
          stroke: isResolved ? "#7a9b76" : isRejected ? "#a63d40" : "#c9c0ad",
          strokeWidth: 1.5,
        },
      },
    ];
  }, [status, pipelineState]);

  return (
    <div className="relative h-full w-full" style={{ background: "#faf7f2" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
      />
    </div>
  );
}
