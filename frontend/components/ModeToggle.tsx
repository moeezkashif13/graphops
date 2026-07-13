import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../src/redux/store";
import { toggleRecruiterMode } from "../src/redux/eli5Slice";
import { Sparkles, Terminal } from "lucide-react";

export function ModeToggle() {
  const dispatch = useDispatch();
  const isRecruiterMode = useSelector(
    (state: RootState) => state.eli5.isRecruiterMode,
  );

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-0.5 rounded-lg shadow-inner shrink-0">
      <button
        onClick={() => !isRecruiterMode && dispatch(toggleRecruiterMode())}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase rounded-md transition-all duration-150 ${
          !isRecruiterMode
            ? "bg-indigo-600 text-white shadow-md"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Terminal className="h-3 w-3" />
        Technical View
      </button>

      <button
        onClick={() => isRecruiterMode && dispatch(toggleRecruiterMode())}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase rounded-md transition-all duration-150 ${
          isRecruiterMode
            ? "bg-amber-500 text-slate-950 shadow-md"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Sparkles className="h-3 w-3" />
        Recruiter Mode
      </button>
    </div>
  );
}
