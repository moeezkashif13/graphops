import React, { useState } from "react";
import { X, Cpu, Maximize2, Move } from "lucide-react";
import { ReactFlow, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  topologyNodes,
  topologyEdges,
  graphNodes,
  graphEdges,
  sequenceNodes,
  sequenceEdges,
} from "../src/utils/flowdata";

type DiagramKey = "topology" | "stateGraph" | "hitlSequence";
interface DiagramSpec {
  id: DiagramKey;
  title: string;
  description: string;
  nodes: any[];
  edges: any[];
}

export function BehindTheScenes() {
  const [activeExpanded, setActiveExpanded] = useState<DiagramSpec | null>(
    null,
  );

  const diagrams: DiagramSpec[] = [
    {
      id: "topology",
      title: "Infrastructure topology",
      description:
        "End-to-end payload trace from client through NestJS to pgvector.",
      nodes: topologyNodes,
      edges: topologyEdges,
    },
    {
      id: "stateGraph",
      title: "LangGraph state loop",
      description:
        "Isolated logical nodes mapping decision channels and evaluation edges.",
      nodes: graphNodes,
      edges: graphEdges,
    },
    {
      id: "hitlSequence",
      title: "Human-in-the-loop sequence",
      description: "How threads freeze, snapshot, and resume on override.",
      nodes: sequenceNodes,
      edges: sequenceEdges,
    },
  ];

  return (
    <>
      <div
        className="h-full w-full overflow-y-auto p-8"
        style={{ background: "#1a1a2e" }}
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: "#3a3a52", background: "#232340" }}
          >
            <div
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "#d4a147" }}
            >
              <Cpu className="h-3.5 w-3.5" /> Architecture index
            </div>
            <h2
              className="mt-2 font-serif text-4xl"
              style={{ color: "#faf7f2" }}
            >
              Behind the scenes
            </h2>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: "#c9c0ad" }}
            >
              Pick an architecture layer to open the interactive canvas.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {diagrams.map((diag) => (
              <div
                key={diag.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all"
                style={{ borderColor: "#3a3a52", background: "#faf7f2" }}
              >
                <div
                  className="flex items-start justify-between gap-4 border-b p-4"
                  style={{ borderColor: "#e6dfd1" }}
                >
                  <div>
                    <h5
                      className="font-serif text-xl leading-tight"
                      style={{ color: "#1a1a2e" }}
                    >
                      {diag.title}
                    </h5>
                    <p
                      className="mt-1 text-[12px] leading-normal"
                      style={{ color: "#6b6b7d" }}
                    >
                      {diag.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveExpanded(diag)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-all group-hover:text-white"
                    style={{ borderColor: "#0d5c63", color: "#0d5c63" }}
                    onMouseEnter={(e) => (
                      (e.currentTarget.style.background = "#0d5c63"),
                      (e.currentTarget.style.color = "#fff")
                    )}
                    onMouseLeave={(e) => (
                      (e.currentTarget.style.background = "transparent"),
                      (e.currentTarget.style.color = "#0d5c63")
                    )}
                  >
                    <Maximize2 className="h-3 w-3" /> Open
                  </button>
                </div>
                <div
                  className="pointer-events-none relative h-[240px]"
                  style={{ background: "#fff" }}
                >
                  <ReactFlow
                    nodes={diag.nodes}
                    edges={diag.edges}
                    fitView
                    fitViewOptions={{ padding: 0.1 }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    zoomOnScroll={false}
                    panOnDrag={false}
                  >
                    <Background color="#e6dfd1" gap={14} size={1} />
                  </ReactFlow>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: "rgba(26,26,46,0.7)" }}
            onClick={() => setActiveExpanded(null)}
          />
          <div
            className="relative flex h-[85vh] w-full flex-col overflow-hidden rounded-2xl border shadow-2xl"
            style={{ background: "#faf7f2", borderColor: "#e6dfd1" }}
          >
            <div
              className="z-10 flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: "#e6dfd1", background: "#fff" }}
            >
              <div>
                <div
                  className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em]"
                  style={{ color: "#e07856" }}
                >
                  <Move className="h-3 w-3" /> Scroll to zoom · drag to pan
                </div>
                <h3
                  className="mt-1 font-serif text-2xl"
                  style={{ color: "#1a1a2e" }}
                >
                  {activeExpanded.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveExpanded(null)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all"
                style={{
                  borderColor: "#e6dfd1",
                  background: "#faf7f2",
                  color: "#1a1a2e",
                }}
              >
                <X className="h-3.5 w-3.5" /> Close
              </button>
            </div>
            <div
              className="relative h-full w-full flex-1"
              style={{ background: "#fff" }}
            >
              <ReactFlow
                defaultNodes={activeExpanded.nodes}
                defaultEdges={activeExpanded.edges}
                fitView
                fitViewOptions={{ padding: 0.25 }}
                minZoom={0.15}
                maxZoom={1.5}
                colorMode="light"
              >
                <Background color="#e6dfd1" gap={16} size={1.5} />
              </ReactFlow>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
