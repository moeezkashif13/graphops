// src/components/Tour.tsx
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
    title: "Step 1: Open the Simulation Panel",
    content:
      "Click the 'Open Simulation Panel' button in the header to simulate an inbound webhook stream.",
    position: "bottom",
  },
  {
    targetId: "agent-graph-viewport",
    title: "Step 2: Watch LangGraph Intercept Execution",
    content:
      "Select your newly created ticket from the queue and observe how the backend state graph automatically halts at the human review checkpoint.",
    position: "step-2",
  },
];

export default function Tour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  // FIX 1: Changed 'right' to 'left' here to match what your calculations and inline styles use
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Use a ref for the current step to always have the latest value in polling loops
  const currentStepRef = useRef(currentStep);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    const hasTakenTour = localStorage.getItem("recruiter_tour_completed");
    if (!hasTakenTour) {
      const timer = setTimeout(() => setIsActive(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Recalculate layout positions precisely using fixed coordinates
  const updatePosition = useCallback(() => {
    if (!isActive) return;
    const stepData = TOUR_STEPS[currentStepRef.current];
    const element = document.getElementById(stepData.targetId);

    if (element) {
      const rect = element.getBoundingClientRect();

      // If the element has no width/height or is hidden mid-animation, don't update to invalid coords
      if (rect.width === 0 && rect.height === 0) return;

      let top = rect.top;
      let left = rect.left;

      // Adjust coordinate placements based on orientation safely
      if (stepData.position === "bottom") {
        top += rect.height + 12;
        left += rect.width / 2 - 160;
      } else if (stepData.position === "top") {
        top -= 170;
        left += rect.width / 2 - 160;
      } else if (stepData.position === "left") {
        top += rect.height / 2 - 60;
        left -= 320;
      } else if (stepData.position === "right") {
        top += rect.height / 2 - 60;
        left += rect.width + 12;
      } else if (stepData.position === "step-2") {
        top += rect.height + 12;
        left += rect.width - 330;
      }

      setCoords({ top, left });
    }
  }, [isActive]);

  // Handle position tracking adjustments on standard triggers
  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition, currentStep]);

  // FIX 2: Continuously poll positioning checks while active. This catches
  // elements as they move during transitions/animations without requiring a browser reload.
  useEffect(() => {
    if (!isActive) return;

    const intervalId = setInterval(() => {
      updatePosition();
    }, 50); // Checks every 50ms to ensure real-time attachment during slider animations

    return () => clearInterval(intervalId);
  }, [isActive, updatePosition]);

  // Intercept actual user target interaction actions to advance steps dynamically
  useEffect(() => {
    if (!isActive) return;

    let attachedElement: HTMLElement | null = null;

    const handleTargetClick = () => {
      if (currentStepRef.current < TOUR_STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleClose();
      }
    };

    // Keep looking for the target element until it maps onto the DOM tree
    const finderInterval = setInterval(() => {
      const currentStepData = TOUR_STEPS[currentStepRef.current];
      const targetElement = document.getElementById(currentStepData.targetId);

      if (targetElement && targetElement !== attachedElement) {
        if (attachedElement) {
          attachedElement.removeEventListener("click", handleTargetClick);
        }
        attachedElement = targetElement;
        attachedElement.addEventListener("click", handleTargetClick);
        updatePosition();
      }
    }, 100);

    return () => {
      clearInterval(finderInterval);
      if (attachedElement) {
        attachedElement.removeEventListener("click", handleTargetClick);
      }
    };
  }, [isActive]);

  const handleClose = () => {
    setIsActive(false);
    localStorage.setItem("recruiter_tour_completed", "true");
  };

  if (!isActive) return null;

  const currentStepData = TOUR_STEPS[currentStep];

  return (
    <>
      {/* Target Highlights Backdrop mask */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[0.5px] z-40 pointer-events-none" />

      {/* Floating Step Card */}
      <div
        className="fixed z-50 w-[320px] p-4 rounded-xl border border-indigo-500/40 bg-slate-900/95 text-slate-200 font-mono shadow-2xl transition-all duration-200 pointer-events-auto"
        style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] uppercase font-bold tracking-wider">
            <Sparkles className="h-3 w-3" />
            Recruiter Guide ({currentStep + 1}/{TOUR_STEPS.length})
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h4 className="text-xs font-bold text-white mb-1.5 uppercase tracking-wide">
          {currentStepData.title}
        </h4>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          {currentStepData.content}
        </p>

        <div className="flex items-center justify-between pt-2 mt-3 border-t border-slate-800">
          <span className="text-[9px] uppercase text-amber-400/80 font-semibold animate-pulse">
            ⚡ Perform action to advance
          </span>
        </div>
      </div>
    </>
  );
}
