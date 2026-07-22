import type { CalculatorResults } from "@/hooks/useCalculator";
import { formatCurrency } from "@/lib/utils";

interface CostChartProps {
  results: CalculatorResults;
}

const colors = ["#FF5252", "#FFDE59", "#5E17EB", "#00C9A7"] as const;

export default function CostChart({ results }: CostChartProps) {
  const entries = [
    { label: "Transcription", value: results.transcriptionTotal, color: colors[0] },
    { label: "LLM", value: results.llmTotal, color: colors[1] },
    { label: "Voice", value: results.voiceTotal, color: colors[2] },
    { label: "Hosting", value: results.hostingTotal, color: colors[3] },
  ];
  const total = results.totalCost;
  let offset = 0;

  return (
    <div
      className="grid h-full grid-cols-[minmax(7rem,1fr)_minmax(9rem,1fr)] items-center gap-3"
      role="img"
      aria-label={`Cost breakdown: ${entries.map((entry) => `${entry.label} ${formatCurrency(entry.value)}`).join(", ")}`}
    >
      <svg viewBox="0 0 100 100" className="mx-auto h-full max-h-40 w-full max-w-40 -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" strokeWidth="22" />
        {total > 0 && entries.map((entry) => {
          const percentage = entry.value / total * 100;
          const start = offset;
          offset += percentage;
          return percentage > 0 ? (
            <circle
              key={entry.label}
              cx="50"
              cy="50"
              r="38"
              pathLength="100"
              fill="none"
              stroke={entry.color}
              strokeWidth="22"
              strokeDasharray={`${percentage} ${100 - percentage}`}
              strokeDashoffset={-start}
            />
          ) : null;
        })}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>

      <ul className="space-y-1.5 text-[11px] font-mono" aria-hidden="true">
        {entries.map((entry) => {
          const percentage = total > 0 ? Math.round(entry.value / total * 100) : 0;
          return (
            <li key={entry.label} className="grid grid-cols-[0.75rem_1fr_auto] items-center gap-1.5">
              <span className="h-3 w-3 border border-black" style={{ backgroundColor: entry.color }} />
              <span className="font-bold">{entry.label}</span>
              <span>{percentage}%</span>
            </li>
          );
        })}
        <li className="border-t border-black pt-1.5 font-bold">Total {formatCurrency(total)}</li>
      </ul>
    </div>
  );
}
