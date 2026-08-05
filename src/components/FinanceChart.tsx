'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Transaction } from '@/types/index';

type FinanceChartProps = {
  transactions: Transaction[];
};

type ChartPoint = {
  date: string;
  pemasukan: number;
  pengeluaran: number;
};

const formatDateLabel = (date: string) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(parsedDate);
};

export default function FinanceChart({ transactions }: FinanceChartProps) {
  const data = useMemo<ChartPoint[]>(() => {
    const grouped = new Map<string, ChartPoint>();

    transactions.forEach((transaction) => {
      const key = transaction.date;
      const current = grouped.get(key) ?? {
        date: formatDateLabel(transaction.date),
        pemasukan: 0,
        pengeluaran: 0,
      };

      if (transaction.type === 'income') {
        current.pemasukan += transaction.amount;
      } else {
        current.pengeluaran += transaction.amount;
      }

      grouped.set(key, current);
    });

    return [...grouped.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([, value]) => value);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center rounded-lg bg-surface-elevated text-sm text-muted md:h-[320px]">
        Belum ada data transaksi
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full rounded-lg bg-surface-elevated p-2 text-content md:h-[320px] md:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid stroke="#2b3139" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#707a8a" tick={{ fill: '#707a8a', fontSize: 11 }} />
          <YAxis stroke="#707a8a" tick={{ fill: '#707a8a', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--color-surface-card-val)', border: '1px solid var(--color-hairline-val)', borderRadius: 8, color: 'var(--color-content-val)' }}
            labelStyle={{ color: 'var(--color-content-val)' }}
            formatter={(value, name) => [Number(value).toLocaleString('id-ID'), name]}
          />
          <Line type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#0ecb81" strokeWidth={2} dot={{ fill: '#0ecb81', r: 3 }} />
          <Line type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#f6465d" strokeWidth={2} dot={{ fill: '#f6465d', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
