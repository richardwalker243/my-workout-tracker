import { Link } from "react-router-dom";
import { useAppState } from "@/state";
import type { WeightUnit } from "@/types";

export function SettingsPage() {
  const { data, setWeightUnit } = useAppState();

  function setUnit(unit: WeightUnit) {
    setWeightUnit(unit);
  }

  return (
    <div className="space-y-6">
      <Link
        to="/routines"
        className="inline-block rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      >
        Back
      </Link>

      <div>
        <h2 className="text-base font-semibold text-white">Weight unit</h2>
        <p className="mt-1 text-sm text-slate-500">Shown next to weights and charts.</p>
        <div className="mt-3 flex gap-2">
          {(["kg", "lb"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={[
                "rounded-xl px-5 py-2.5 text-sm font-semibold capitalize transition-colors",
                data.weightUnit === u
                  ? "bg-emerald-500 text-slate-950"
                  : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600",
              ].join(" ")}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-500">
        Data is stored only in this browser on this device. Clearing site data will remove
        routines and history.
      </div>
    </div>
  );
}
