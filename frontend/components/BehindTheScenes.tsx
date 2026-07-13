import React, { useState } from "react";
import { X, Layers, Cpu, Maximize2, Move } from "lucide-react";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
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
      title: "01 Infrastructure Topology Map",
      description:
        "Macro end-to-end trace payload mapping from client to NestJS routing and pgvector layers.",
      nodes: topologyNodes,
      edges: topologyEdges,
    },
    {
      id: "stateGraph",
      title: "02 LangGraph State Machine Loop",
      description:
        "Isolated logical state node layout mapping decision channels and evaluation edges.",
      nodes: graphNodes,
      edges: graphEdges,
    },
    {
      id: "hitlSequence",
      title: "03 Human-in-the-Loop Serialization Matrix",
      description:
        "Step-by-step chronology displaying how threads freeze, store snapshots, and wake up upon override actions.",
      nodes: sequenceNodes,
      edges: sequenceEdges,
    },
  ];

  return (
    <>
      {/* Backdrop overlay */}

      {/* Structural drawer layout viewport */}
      <div>
        {/* <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button> */}

        {/* Content Lists */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar ">
          <div className="p-4 rounded-xl border border-indigo-500/10 bg-[#0f172b] space-y-1.5 shrink-0">
            <h4 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wide flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> Core Architecture Index
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Select an architecture layer category from the panel configuration
              indexes below to open an interactive full-screen viewport
              environment.
            </p>
          </div>

          {/* Map Grid Lists Rendering all 3 Diagrams */}
          <div className="space-y-4 flex flex-wrap justify-between">
            {diagrams.map((diag) => (
              <div
                key={diag.id}
                className="group relative border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950 transition-all duration-300 hover:border-slate-700 shadow-lg flex flex-col w-[450px]"
              >
                {/* Meta Panel Info */}
                <div className="p-3 bg-slate-900/40 border-b border-slate-900 flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wide">
                      {diag.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-sans leading-normal">
                      {diag.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveExpanded(diag)}
                    className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono font-bold uppercase text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.03] rounded-md transition-all group-hover:bg-indigo-600 group-hover:text-white shadow-sm shrink-0"
                  >
                    <Maximize2 className="h-3 w-3" />
                    Open Canvas
                  </button>
                </div>

                <div className="h-[250px] bg-[#0b0f19]/60 relative pointer-events-none transition-opacity">
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
                    <Background color="#1e293b" gap={12} size={1} />
                  </ReactFlow>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 90% SCREEN WORKSPACE INTERACTIVE MODAL CANVAS --- */}
      {activeExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setActiveExpanded(null)}
          />

          {/* Main Display Core Canvas Container */}
          <div className="relative w-full h-[85vh] md:h-[90vh] bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Control Strip Top Header Info */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between z-10">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1.5">
                  <Move className="h-3 w-3 animate-pulse" /> Use scroll-wheel to
                  zoom // click and hold canvas viewport grid background to pan
                </span>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                  {activeExpanded.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveExpanded(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-slate-400 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-all shadow-sm"
              >
                <X className="h-3.5 w-3.5" /> Exit Viewport
              </button>
            </div>

            {/* FULLY FUNCTIONAL INTERACTIVE REACT FLOW CANVAS */}
            <div className="flex-1 w-full h-full relative bg-[#0b0f19]">
              <ReactFlow
                defaultNodes={activeExpanded.nodes}
                defaultEdges={activeExpanded.edges}
                fitView
                fitViewOptions={{ padding: 0.25 }}
                minZoom={0.15}
                maxZoom={1.5}
                colorMode="dark"
              >
                <Background color="#141b2e" gap={16} size={1.5} />
                <Controls className="bg-slate-900 border border-slate-800 text-slate-400 rounded-lg overflow-hidden fill-slate-400 shadow-md" />
                <MiniMap
                  style={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  nodeColor={(node) =>
                    (node.style?.borderColor as string) || "#1e293b"
                  }
                  maskColor="rgba(0, 0, 0, 0.5)"
                />
              </ReactFlow>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
