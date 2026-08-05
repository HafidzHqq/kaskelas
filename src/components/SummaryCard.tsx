'use client';

import { formatCurrency } from '@/lib/constants';

interface SummaryCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  className?: string;
  isCurrency?: boolean;
  valueClassName?: string;
}

export default function SummaryCard({
  title,
  value,
  icon,
  trend,
  className = '',
  isCurrency = true,
  valueClassName = '',
}: SummaryCardProps) {
  return (
    <div className={`bg-surface-card border border-hairline rounded-xl p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wider truncate">
          {title}
        </p>
        {icon && (
          <div className="flex-shrink-0 text-muted opacity-40 scale-90 sm:scale-100">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 min-w-0">
        <p className={`text-lg sm:text-2xl lg:text-3xl font-bold tabular-nums truncate tracking-tight ${valueClassName || 'text-content'}`}>
          {isCurrency ? formatCurrency(value) : value.toLocaleString('id-ID')}
        </p>
        {trend && (
          <div className="mt-1.5 flex items-center gap-1 flex-wrap">
            <span
              className={`text-xs font-medium ${
                trend.positive ? 'text-trading-up' : 'text-trading-down'
              }`}
            >
              {trend.positive ? '+' : ''}{isCurrency ? formatCurrency(trend.value) : trend.value.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-muted">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
