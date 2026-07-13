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
    <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] leading-relaxed custom-scrollbar max-h-[220px]">
      {logs.map((log, index) => {
        const displayMessage = isRecruiterMode ? translateLogToEli5(log) : log;

        return (
          <div
            key={index}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              isRecruiterMode
                ? "bg-amber-500/[0.02] border-amber-500/10 text-slate-300"
                : "bg-slate-950 border-slate-800/60 text-emerald-400"
            }`}
          >
            {!isRecruiterMode && (
              <span className="text-slate-600 mr-1.5 font-sans">$</span>
            )}
            <span
              dangerouslySetInnerHTML={{
                __html: displayMessage.replace(
                  /\*\*(.*?)\*\*/g,
                  '<b class="text-white">$1</b>',
                ),
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
