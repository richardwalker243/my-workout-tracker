import type { SessionWeightGroup, WeightUnit } from "@/types";

type Props = {
  groups: SessionWeightGroup[];
  weightUnit: WeightUnit;
  onChange: (groups: SessionWeightGroup[]) => void;
};

function emptyGroup(): SessionWeightGroup {
  return { weight: 0, sets: 1, rpe: null };
}

export function WeightGroupsEditor({ groups, weightUnit, onChange }: Props) {
  function updateGroup(index: number, patch: Partial<SessionWeightGroup>) {
    onChange(groups.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }

  function removeGroup(index: number) {
    onChange(groups.filter((_, i) => i !== index));
  }

  function addGroup() {
    onChange([...groups, emptyGroup()]);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">Weight groups ({weightUnit})</p>
        <button
          type="button"
          onClick={addGroup}
          className="text-xs font-medium text-orange-400 hover:text-orange-300"
        >
          + Add
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-3 py-3 text-sm text-slate-600">
          No weights logged yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {groups.map((group, index) => (
            <li
              key={index}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] items-end gap-2 rounded-xl bg-slate-950/80 px-2.5 py-2"
            >
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">
                  Sets
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={group.sets}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    updateGroup(index, {
                      sets: Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1,
                    });
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">
                  Weight
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  inputMode="decimal"
                  value={group.weight || ""}
                  placeholder="0"
                  onChange={(e) => {
                    const v = e.target.value;
                    updateGroup(index, {
                      weight: v === "" ? 0 : Number(v),
                    });
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wide text-slate-500">
                  RPE
                </label>
                <select
                  value={group.rpe ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateGroup(index, {
                      rpe: v === "" ? null : Number(v),
                    });
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="">—</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeGroup(index)}
                className="mb-0.5 rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                aria-label="Remove weight group"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
