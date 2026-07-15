import { useSelector } from "react-redux";
import { RootState } from "../src/redux/store";
import { translateLogToEli5 } from "../src/utils/eli5Translator";

interface TraceLogsDisplayProps {
  logs: string[];
}

export function TraceLogsDisplay({ logs }: TraceLogsDisplayProps) {
  const isRecruiterMode = useSelector((s: RootState) => s.eli5.isRecruiterMode);

  return (
    <div
      className="space-y-2 rounded-2xl border p-4"
      style={{ background: "#fff", borderColor: "#e6dfd1" }}
    >
      {logs.map((log, i) => {
        const msg = isRecruiterMode ? translateLogToEli5(log) : log;
        const isEli5 = isRecruiterMode;
        return (
          <div
            key={i}
            className="rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed font-sans"
            style={{
              background: isEli5 ? "#fbf1dc" : "#faf7f2",
              borderColor: isEli5 ? "#e8d49a" : "#e6dfd1",
              color: isEli5 ? "#5c4a1e" : "#3a3a52",
            }}
          >
            {!isEli5 && (
              <span style={{ color: "#0d5c63" }} className="mr-2">
                ›
              </span>
            )}
            <span
              dangerouslySetInnerHTML={{
                __html: msg.replace(
                  /\*\*(.*?)\*\*/g,
                  '<b style="color:#1a1a2e">$1</b>',
                ),
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
