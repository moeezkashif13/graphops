import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sparkles, X } from "lucide-react";

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right" | "step-2";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "ticket-queue-trigger",
    title: "Open the simulator",
    content:
      "Click 'Open simulator' in the header to fire a mock inbound webhook.",
    position: "bottom",
  },
  {
    targetId: "agent-graph-viewport",
    title: "Watch the graph intercept",
    content:
      "Select the new ticket and observe the graph pause at the human review checkpoint.",
    position: "step-2",
  },
];

export default function Tour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const currentStepRef = useRef(currentStep);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (!localStorage.getItem("recruiter_tour_completed")) {
      const t = setTimeout(() => setIsActive(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const updatePosition = useCallback(() => {
    if (!isActive) return;
    const stepData = TOUR_STEPS[currentStepRef.current];
    const el = document.getElementById(stepData.targetId);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    let top = r.top,
      left = r.left;
    if (stepData.position === "bottom") {
      top += r.height + 12;
      left += r.width / 2 - 160;
    } else if (stepData.position === "top") {
      top -= 170;
      left += r.width / 2 - 160;
    } else if (stepData.position === "left") {
      top += r.height / 2 - 60;
      left -= 320;
    } else if (stepData.position === "right") {
      top += r.height / 2 - 60;
      left += r.width + 12;
    } else if (stepData.position === "step-2") {
      top += r.height + 12;
      left += r.width - 330;
    }
    setCoords({ top, left });
  }, [isActive]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition, currentStep]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(updatePosition, 50);
    return () => clearInterval(id);
  }, [isActive, updatePosition]);

  useEffect(() => {
    if (!isActive) return;
    let attached: HTMLElement | null = null;
    const handle = () => {
      if (currentStepRef.current < TOUR_STEPS.length - 1)
        setCurrentStep((p) => p + 1);
      else handleClose();
    };
    const finder = setInterval(() => {
      const s = TOUR_STEPS[currentStepRef.current];
      const el = document.getElementById(s.targetId);
      if (el && el !== attached) {
        if (attached) attached.removeEventListener("click", handle);
        attached = el;
        attached.addEventListener("click", handle);
        updatePosition();
      }
    }, 100);
    return () => {
      clearInterval(finder);
      if (attached) attached.removeEventListener("click", handle);
    };
  }, [isActive]);

  const handleClose = () => {
    setIsActive(false);
    localStorage.setItem("recruiter_tour_completed", "true");
  };
  if (!isActive) return null;
  const step = TOUR_STEPS[currentStep];

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          background: "rgba(26,26,46,0.45)",
          backdropFilter: "blur(1px)",
        }}
      />
      <div
        className="fixed z-50 w-[320px] rounded-2xl border p-5 shadow-2xl transition-all"
        style={{
          top: coords.top,
          left: coords.left,
          background: "#faf7f2",
          borderColor: "#0d5c63",
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "#e07856" }}
          >
            <Sparkles className="h-3 w-3" /> Guide · {currentStep + 1}/
            {TOUR_STEPS.length}
          </div>
          <button onClick={handleClose} style={{ color: "#6b6b7d" }}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <h4
          className="font-serif text-xl leading-tight"
          style={{ color: "#1a1a2e" }}
        >
          {step.title}
        </h4>
        <p
          className="mt-2 text-[12.5px] leading-relaxed"
          style={{ color: "#3a3a52" }}
        >
          {step.content}
        </p>
        <div className="mt-4 border-t pt-3" style={{ borderColor: "#e6dfd1" }}>
          <span
            className="text-[10px] font-medium uppercase tracking-wider animate-pulse"
            style={{ color: "#d4a147" }}
          >
            → Perform action to advance
          </span>
        </div>
      </div>
    </>
  );
}
