import { useState } from "react";
import { copyTextToClipboard, formatWorkoutShareText } from "@/lib/workoutShareText";
import type { CompletedWorkout, WeightUnit } from "@/types";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

type Props = {
  workout: CompletedWorkout;
  weightUnit: WeightUnit;
  /** Larger control for the post-save modal */
  size?: "md" | "lg";
  className?: string;
};

export function CopySummaryButton({
  workout,
  weightUnit,
  size = "md",
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = formatWorkoutShareText(workout, weightUnit);
    const ok = await copyTextToClipboard(text);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const padding = size === "lg" ? "px-4 py-3" : "px-3 py-2";
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 font-medium text-slate-200 hover:border-orange-800/60 hover:bg-slate-800 ${padding} ${className}`}
      aria-label={copied ? "Summary copied" : "Copy summary"}
    >
      <CopyIcon className={iconSize} />
      <span className={size === "lg" ? "text-sm" : "text-xs"}>
        {copied ? "Copied" : "Copy summary"}
      </span>
    </button>
  );
}
