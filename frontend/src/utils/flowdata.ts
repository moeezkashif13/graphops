import type { Node, Edge } from "@xyflow/react";

const commonNodeStyles = {
  background: "#0f172a",
  color: "#cbd5e1",
  border: "2px solid #334155",
  borderRadius: "12px",
  padding: "12px",
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "11px",
  textAlign: "center" as const,
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  width: 180,
};

// ============================================================================
// DIAGRAM 1: GLOBAL INFRASTRUCTURE TOPOLOGY (Macro View)
// ============================================================================
export const topologyNodes: Node[] = [
  {
    id: "t1",
    position: { x: 40, y: 150 },
    data: { label: "💻 React Client\n(Tailwind Workspace UI)" },
    style: { ...commonNodeStyles, borderColor: "#3b82f6", color: "#f8fafc" },
  },
  {
    id: "t2",
    position: { x: 290, y: 150 },
    data: { label: "🛡️ NestJS Gateway\n(REST Controllers & Socket.io)" },
    style: { ...commonNodeStyles, borderColor: "#e02424" },
  },
  {
    id: "t3",
    position: { x: 540, y: 150 },
    data: {
      label: "⚙️ LangGraph Core Engine\n(State Orchestration Framework)",
    },
    style: { ...commonNodeStyles, borderColor: "#7c3aed" },
  },
  {
    id: "t4",
    position: { x: 790, y: 150 },
    data: { label: "🗄️ PostgreSQL System Layer\n(TypeORM + pgvector storage)" },
    style: { ...commonNodeStyles, borderColor: "#4b5563" },
  },
];

export const topologyEdges: Edge[] = [
  {
    id: "et1",
    source: "t1",
    target: "t2",
    label: "HTTP POST Webhook",
    animated: true,
    style: { stroke: "#3b82f6" },
  },
  {
    id: "et2",
    source: "t2",
    target: "t3",
    label: "Invoke Workflow Thread",
    style: { stroke: "#e02424" },
  },
  {
    id: "et3",
    source: "t3",
    target: "t4",
    label: "Durable Vector Ops",
    style: { stroke: "#7c3aed" },
  },
];

// ============================================================================
// DIAGRAM 2: LANGGRAPH STATE MACHINE LOOP (Micro View)
// ============================================================================
export const graphNodes: Node[] = [
  {
    id: "g1",
    position: { x: 300, y: 20 },
    data: { label: "▶️ __start__" },
    style: { ...commonNodeStyles, width: 120, borderColor: "#475569" },
  },
  {
    id: "g2",
    position: { x: 270, y: 100 },
    data: { label: "🔍 Node 1: Classifier\n(Intent & Sentiment Analysis)" },
    style: { ...commonNodeStyles, borderColor: "#059669", color: "#a7f3d0" },
  },
  {
    id: "g3",
    position: { x: 270, y: 200 },
    data: { label: "📖 Node 2: Vector RAG\n(pgvector Index Match)" },
    style: { ...commonNodeStyles, borderColor: "#059669", color: "#a7f3d0" },
  },
  {
    id: "g4",
    position: { x: 270, y: 300 },
    data: { label: "✍️ Node 3: Composer\n(Response Generation Buffer)" },
    style: { ...commonNodeStyles, borderColor: "#059669", color: "#a7f3d0" },
  },
  {
    id: "g5",
    position: { x: 285, y: 400 },
    data: { label: "⚖️ Urgency Intercept?\n(Conditional Flow Edge)" },
    style: {
      ...commonNodeStyles,
      borderColor: "#d97706",
      width: 150,
      color: "#fde68a",
    },
  },
  {
    id: "g6",
    position: { x: 490, y: 490 },
    data: { label: "⚠️ Node 4: Human Review\n(State Halted & Saved)" },
    style: { ...commonNodeStyles, borderColor: "#ef4444", color: "#fee2e2" },
  },
  {
    id: "g7",
    position: { x: 100, y: 500 },
    data: { label: "⏹️ __end__" },
    style: { ...commonNodeStyles, width: 120, borderColor: "#475569" },
  },
];

export const graphEdges: Edge[] = [
  { id: "eg1", source: "g1", target: "g2", style: { stroke: "#475569" } },
  { id: "eg2", source: "g2", target: "g3", style: { stroke: "#059669" } },
  { id: "eg3", source: "g3", target: "g4", style: { stroke: "#059669" } },
  { id: "eg4", source: "g4", target: "g5", style: { stroke: "#059669" } },
  {
    id: "eg5",
    source: "g5",
    target: "g6",
    label: "Angry / Churn Risk",
    style: { stroke: "#ef4444" },
  },
  {
    id: "eg6",
    source: "g5",
    target: "g7",
    label: "Neutral Stream",
    style: { stroke: "#475569" },
  },
  {
    id: "eg7",
    source: "g6",
    target: "g7",
    label: "Commit Resume Override",
    animated: true,
    style: { stroke: "#3b82f6" },
  },
];

// ============================================================================
// DIAGRAM 3: HUMAN-IN-THE-LOOP STATE TIMELINE MATRIX (Sequence Matrix)
// ============================================================================
export const sequenceNodes: Node[] = [
  {
    id: "s1",
    position: { x: 50, y: 50 },
    data: { label: "1. Composer Finishes Context Generation Draft" },
    style: { ...commonNodeStyles, borderColor: "#7c3aed", width: 220 },
  },
  {
    id: "s2",
    position: { x: 320, y: 50 },
    data: { label: "2. Conditional Edge Evaluates State Context Parameters" },
    style: { ...commonNodeStyles, borderColor: "#d97706", width: 220 },
  },
  {
    id: "s3",
    position: { x: 590, y: 50 },
    data: { label: "3. interruptBefore Hook Halts Engine Mid-Flight" },
    style: { ...commonNodeStyles, borderColor: "#ef4444", width: 220 },
  },
  {
    id: "s4",
    position: { x: 590, y: 200 },
    data: {
      label: "4. Memory Snapshot Serializes to PostgresSaver Storage Pool",
    },
    style: { ...commonNodeStyles, borderColor: "#4b5563", width: 220 },
  },
  {
    id: "s5",
    position: { x: 320, y: 200 },
    data: {
      label: "5. Socket.io Event Emits To Open Workspace Control Interface",
    },
    style: { ...commonNodeStyles, borderColor: "#3b82f6", width: 220 },
  },
  {
    id: "s6",
    position: { x: 50, y: 200 },
    data: { label: "6. POST /resume Commits Manual Overridden Memory Values" },
    style: { ...commonNodeStyles, borderColor: "#059669", width: 220 },
  },
  {
    id: "s7",
    position: { x: 50, y: 350 },
    data: {
      label: "7. Thread Wakes Up At Checkpoint & Resolves Cleanly To Exit",
    },
    style: { ...commonNodeStyles, borderColor: "#6366f1", width: 220 },
  },
];

export const sequenceEdges: Edge[] = [
  { id: "es1", source: "s1", target: "s2", style: { stroke: "#7c3aed" } },
  { id: "es2", source: "s2", target: "s3", style: { stroke: "#d97706" } },
  {
    id: "es3",
    source: "s3",
    target: "s4",
    label: "Freeze State",
    style: { stroke: "#ef4444" },
  },
  { id: "es4", source: "s4", target: "s5", style: { stroke: "#4b5563" } },
  {
    id: "es5",
    source: "s5",
    target: "s6",
    label: "Unlock UI Buffer Textarea",
    animated: true,
    style: { stroke: "#3b82f6" },
  },
  {
    id: "es6",
    source: "s6",
    target: "s7",
    label: "Invoke Pipeline",
    style: { stroke: "#059669" },
  },
];
