import { PriceTrend } from '@/types';

interface TrendIndicatorProps {
  trend: PriceTrend;
}

const TREND_CONFIG = {
  rising: {
    label: 'Rising',
    description: 'Prices are trending up recently.',
    icon: '↑',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  falling: {
    label: 'Falling',
    description: 'Prices are trending down recently.',
    icon: '↓',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  stable: {
    label: 'Stable',
    description: 'Prices are relatively stable.',
    icon: '→',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
} as const;

export default function TrendIndicator({ trend }: TrendIndicatorProps) {
  const cfg = TREND_CONFIG[trend.direction];

  return (
    <div
      className={`rounded-xl border ${cfg.border} ${cfg.bg} p-5 flex items-center gap-4`}
      aria-label={`Price trend: ${trend.direction}`}
    >
      <span
        className={`text-3xl font-bold ${cfg.color} leading-none`}
        aria-hidden="true"
      >
        {cfg.icon}
      </span>
      <div>
        <h3 className="text-sm font-semibold text-gray-700">Price Trend</h3>
        <p className={`text-base font-bold ${cfg.color}`}>
          {cfg.label}
          {trend.percentage > 0 && ` (${trend.percentage}%)`}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{cfg.description}</p>
      </div>
    </div>
  );
}
