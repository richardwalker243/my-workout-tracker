import { Link } from "react-router-dom";
import { useAppState } from "@/state";

export function RoutinesPage() {
  const { data } = useAppState();
  const sorted = [...data.routines].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">Templates for gym sessions</p>
        <Link
          to="/routines/new"
          className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-orange-400 active:scale-[0.98]"
        >
          New routine
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-10 text-center text-slate-500">
          No routines yet. Create one to use at the gym.
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((r) => (
            <li key={r.id}>
              <Link
                to={`/routines/${r.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4 transition-colors hover:border-slate-700 hover:bg-slate-900"
              >
                <span className="font-medium text-white">{r.name}</span>
                <span className="text-sm text-slate-500">
                  {r.exercises.length} exercise{r.exercises.length === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
