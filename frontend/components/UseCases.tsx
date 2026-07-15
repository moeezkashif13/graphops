import { useEffect, useState } from "react";
import {
  X,
  Workflow,
  Ticket,
  ShieldAlert,
  MessagesSquare,
  FileText,
  Users2,
  ArrowRight,
  Search,
  PenLine,
  UserCheck,
} from "lucide-react";

interface UseCaseStep {
  label: string;
  detail: string;
}

interface UseCase {
  id: string;
  icon: React.ReactNode;
  badge: "Implemented in this repo" | "Same pattern, different domain";
  title: string;
  oneLiner: string;
  steps: UseCaseStep[];
  gateTrigger: string;
  accent: string;
}

const stepIcons = [
  <Search className="h-3 w-3" />,
  <Search className="h-3 w-3" />,
  <PenLine className="h-3 w-3" />,
  <UserCheck className="h-3 w-3" />,
];

const useCases: UseCase[] = [
  {
    id: "support",
    icon: <Ticket className="h-5 w-5" />,
    badge: "Implemented in this repo",
    title: "Customer support triage",
    oneLiner:
      "Reads inbound tickets, drafts a reply, and pulls in a human the moment a customer looks ready to churn.",
    steps: [
      {
        label: "Classify",
        detail: "Intent + sentiment (Technical, Billing, urgency)",
      },
      {
        label: "Research",
        detail: "Vector search across support docs + live billing status",
      },
      {
        label: "Draft",
        detail: "Composes an empathetic, policy-compliant reply",
      },
      { label: "Gate", detail: "Pauses on ANGRY or URGENT_CHURN sentiment" },
    ],
    gateTrigger: "High churn risk or emotional escalation",
    accent: "#0d5c63",
  },

  {
    id: "moderation",
    icon: <MessagesSquare className="h-5 w-5" />,
    badge: "Same pattern, different domain",
    title: "Content moderation queue",
    oneLiner:
      "Triages flagged posts automatically, only interrupting a moderator for genuinely borderline calls.",
    steps: [
      { label: "Classify", detail: "Policy category + confidence score" },
      {
        label: "Research",
        detail: "Pulls the exact guideline clause that applies",
      },
      {
        label: "Draft",
        detail: "Drafts the moderation action + user-facing explanation",
      },
      {
        label: "Gate",
        detail: "Pauses on low-confidence or high-impact removals",
      },
    ],
    gateTrigger: "Low model confidence or high-impact action",
    accent: "#a63d40",
  },
  {
    id: "legal",
    icon: <FileText className="h-5 w-5" />,
    badge: "Same pattern, different domain",
    title: "Legal contract first-pass review",
    oneLiner:
      "Flags risky clauses in incoming contracts and drafts suggested redlines for a lawyer to approve.",
    steps: [
      { label: "Classify", detail: "Clause type + risk tier" },
      {
        label: "Research",
        detail: "Matches against approved clause library + precedent",
      },
      { label: "Draft", detail: "Drafts a redline suggestion with rationale" },
      { label: "Gate", detail: "Pauses on high-risk or non-standard clauses" },
    ],
    gateTrigger: "Non-standard or high-risk clause detected",
    accent: "#7a9b76",
  },
  {
    id: "hr",
    icon: <Users2 className="h-5 w-5" />,
    badge: "Same pattern, different domain",
    title: "HR policy inbox",
    oneLiner:
      "Answers routine HR questions instantly and routes anything sensitive straight to a human rep.",
    steps: [
      {
        label: "Classify",
        detail: "Topic (benefits, leave, payroll) + sensitivity",
      },
      { label: "Research", detail: "Retrieves the relevant policy section" },
      { label: "Draft", detail: "Drafts a plain-language answer" },
      {
        label: "Gate",
        detail: "Pauses on sensitive topics like disputes or terminations",
      },
    ],
    gateTrigger: "Sensitive or legally-charged topic",
    accent: "#e07856",
  },
];

interface UseCasesProps {
  toggleUseCases: (isOpen: boolean) => void;
}

export function UseCases({ toggleUseCases }: UseCasesProps) {
  const [activeId, setActiveId] = useState<string>(useCases[0].id);
  const [allowScroll, setAllowScroll] = useState(false);
  const active = useCases.find((u) => u.id === activeId)!;

  useEffect(() => {
    if (allowScroll) {
      document.querySelector("#detail-panel")?.scrollIntoView();
    }
  }, [activeId]);

  return (
    <div
      className="h-full w-full overflow-y-auto p-8"
      style={{ background: "#1a1a2e" }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero */}
        <div
          className="relative overflow-hidden rounded-2xl border p-6"
          style={{ borderColor: "#3a3a52", background: "#232340" }}
        >
          <button
            onClick={() => toggleUseCases(false)}
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full transition-colors"
            style={{ color: "#c9c0ad", background: "#1a1a2e" }}
          >
            <X className="h-4 w-4" />
          </button>

          <div
            className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "#d4a147" }}
          >
            <Workflow className="h-3.5 w-3.5" /> Design pattern
          </div>
          <h2
            className="mt-2 max-w-2xl font-serif text-4xl"
            style={{ color: "#faf7f2" }}
          >
            One workflow. Many jobs.
          </h2>
          <p
            className="mt-2 max-w-4xl text-sm leading-relaxed"
            style={{ color: "#c9c0ad" }}
          >
            GraphOps isn't a support desk — it's a single reusable primitive:
            classify, retrieve, draft, and pause for a human when it matters.
            This repo wires that primitive up to customer support tickets. The
            same four nodes and the same Postgres-backed interrupt apply
            anywhere an AI needs to act autonomously, but not recklessly.
          </p>
        </div>

        {/* Use case selector cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {useCases.map((uc) => {
            const isActive = uc.id === activeId;
            return (
              <button
                key={uc.id}
                onClick={() => {
                  if (!allowScroll) {
                    setAllowScroll(true);
                  }
                  setActiveId(uc.id);
                }}
                className="group flex flex-col cursor-pointer items-start gap-3 rounded-2xl border p-5 text-left transition-all"
                style={{
                  borderColor: isActive ? uc.accent : "#3a3a52",
                  background: isActive ? "#faf7f2" : "#232340",
                }}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{
                      background: isActive ? uc.accent : "#1a1a2e",
                      color: "#fff",
                    }}
                  >
                    {uc.icon}
                  </div>
                  <span
                    className="rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider"
                    style={{
                      borderColor: isActive ? uc.accent : "#3a3a52",
                      color: isActive ? uc.accent : "#8a8aa0",
                    }}
                  >
                    {uc.badge}
                  </span>
                </div>
                <div>
                  <h5
                    className="font-serif text-lg leading-tight"
                    style={{ color: isActive ? "#1a1a2e" : "#faf7f2" }}
                  >
                    {uc.title}
                  </h5>
                  <p
                    className="mt-1.5 text-[12px] leading-relaxed"
                    style={{ color: isActive ? "#6b6b7d" : "#a8a2b8" }}
                  >
                    {uc.oneLiner}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail panel for active use case */}
        <div
          id="detail-panel"
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: "#3a3a52", background: "#faf7f2" }}
        >
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
            style={{ borderColor: "#e6dfd1", background: "#fff" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="grid h-9 w-9 place-items-center rounded-xl text-white"
                style={{ background: active.accent }}
              >
                {active.icon}
              </div>
              <div>
                <h3
                  className="font-serif text-xl leading-none"
                  style={{ color: "#1a1a2e" }}
                >
                  {active.title}
                </h3>
                <p className="mt-1 text-[11px]" style={{ color: "#6b6b7d" }}>
                  Same graph. Different classification schema, corpus, and
                  prompt.
                </p>
              </div>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white"
              style={{ background: active.accent }}
            >
              Human gate: {active.gateTrigger}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-4">
            {active.steps.map((step, i) => (
              <div
                key={step.label}
                className="flex flex-col gap-2 border-b p-5 md:border-b-0 md:border-r last:border-r-0"
                style={{ borderColor: "#e6dfd1" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-medium"
                    style={{
                      background: "#faf7f2",
                      color: active.accent,
                      border: `1px solid ${active.accent}`,
                    }}
                  >
                    {stepIcons[i]}
                  </span>
                  <span
                    className="text-[11px] font-medium uppercase tracking-[0.14em]"
                    style={{ color: "#1a1a2e" }}
                  >
                    {step.label}
                  </span>
                  {i < active.steps.length - 1 && (
                    <ArrowRight
                      className="ml-auto hidden h-3.5 w-3.5 md:block"
                      style={{ color: "#c9c0ad" }}
                    />
                  )}
                </div>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "#3a3a52" }}
                >
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p
          className="text-center text-[11px] leading-relaxed"
          style={{ color: "#6b6b7d" }}
        >
          Every scenario above runs on the exact same LangGraph state machine,
          the same PostgreSQL checkpointing, and the same resume/reject mechanic
          — only the domain changes.
        </p>
      </div>
    </div>
  );
}
