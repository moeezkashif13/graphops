import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../src/redux/store";
import { toggleRecruiterMode } from "../src/redux/eli5Slice";
import { Sparkles, Terminal } from "lucide-react";

export function ModeToggle() {
  const dispatch = useDispatch();
  const isRecruiterMode = useSelector((s: RootState) => s.eli5.isRecruiterMode);

  const base =
    "flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider transition-all cursor-pointer";

  return (
    <div
      className="flex items-center gap-1 rounded-full border p-1"
      style={{ borderColor: "#e6dfd1", background: "#faf7f2" }}
    >
      <button
        onClick={() => isRecruiterMode && dispatch(toggleRecruiterMode())}
        className={base}
        style={
          !isRecruiterMode
            ? { background: "#0d5c63", color: "#fff" }
            : { color: "#6b6b7d", background: "transparent" }
        }
      >
        <Terminal className="h-3 w-3" /> Technical
      </button>
      <button
        onClick={() => !isRecruiterMode && dispatch(toggleRecruiterMode())}
        className={base}
        style={
          isRecruiterMode
            ? { background: "#e07856", color: "#fff" }
            : { color: "#6b6b7d", background: "transparent" }
        }
      >
        <Sparkles className="h-3 w-3" /> Plain english
      </button>
    </div>
  );
}
