import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";
import { translateLogToEli5 } from "../src/utils/eli5Translator";

interface TraceLogsDisplayProps {
  logs: string[];
}

export function TraceLogsDisplay({ logs }: TraceLogsDisplayProps) {
  const isRecruiterMode = useSelector(
    (state: RootState) => state.eli5.isRecruiterMode,
  );

  return (
    <div className="flex-1 border border-slate-200 bg-slate-100/50 rounded-lg shadow-lg p-4 space-y-3 font-mono text-[11px] leading-relaxed text-slate-700">
      {logs.map((log, index) => {
        const displayMessage = isRecruiterMode ? translateLogToEli5(log) : log;

        return (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              isRecruiterMode
                ? "bg-amber-500/[0.01] border-amber-500/20 text-slate-700"
                : "bg-slate-50 border-slate-200/60 text-emerald-700"
            }`}
          >
            {!isRecruiterMode && (
              <span className="text-slate-400 mr-1.5 font-sans">$</span>
            )}
            <span
              dangerouslySetInnerHTML={{
                __html: displayMessage.replace(
                  /\*\*(.*?)\*\*/g,
                  '<b class="text-slate-950 font-bold">$1</b>',
                ),
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
