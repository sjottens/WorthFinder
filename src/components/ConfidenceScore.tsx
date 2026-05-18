import { ConfidenceData } from '@/types';

interface ConfidenceScoreProps {
  confidence: ConfidenceData;
}

const LEVEL_CONFIG = {
  high: {
    label: 'High Confidence',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    bar: 'bg-emerald-500',
  },
  medium: {
    label: 'Medium Confidence',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    bar: 'bg-amber-400',
  },
  low: {
    label: 'Low Confidence',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    bar: 'bg-red-400',
  },
} as const;

export default function ConfidenceScore({ confidence }: ConfidenceScoreProps) {
  const cfg = LEVEL_CONFIG[confidence.level];

  return (
    <div
      className={`rounded-xl border ${cfg.border} ${cfg.bg} p-5`}
      aria-label={`Data confidence: ${confidence.score} out of 100`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Data Confidence</h3>
        <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
      </div>

      {/* Score bar */}
      <div
        className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden"
        role="progressbar"
        aria-valuenow={confidence.score}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full ${cfg.bar} transition-all duration-500`}
          style={{ width: `${confidence.score}%` }}
        />
      </div>
      <p className="mt-1.5 text-right text-xs text-gray-500">
        {confidence.score}/100
      </p>

      {/* Factor breakdown */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <FactorCell label="Sample Size" value={confidence.factors.resultCount} max={40} />
        <FactorCell label="Price Spread" value={confidence.factors.priceConsistency} max={40} />
        <FactorCell label="Recency" value={confidence.factors.recency} max={20} />
      </div>
    </div>
  );
}

function FactorCell({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  return (
    <div className="bg-white rounded-lg p-2 border border-gray-100">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">
        {value}
        <span className="text-gray-400 font-normal">/{max}</span>
      </p>
    </div>
  );
}
