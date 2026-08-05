'use client';

import { useMemo } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Transaction } from '@/types/index';
import { formatCurrency } from '@/lib/constants';

type CategoryPieChartProps = {
  transactions: Transaction[];
};

type CategoryData = {
  name: string;
  value: number;
};

const COLORS = ['#fcd535', '#0ecb81', '#f6465d', '#3b82f6', '#2dbdb6', '#929aa5'];

export default function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  const data = useMemo<CategoryData[]>(() => {
    const grouped = new Map<string, number>();

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const category = transaction.category ?? 'Lainnya';
        grouped.set(category, (grouped.get(category) ?? 0) + transaction.amount);
      });

    return [...grouped.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center rounded-lg bg-surface-elevated text-sm text-muted md:h-[320px]">
        Belum ada data pengeluaran
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full rounded-lg bg-surface-elevated p-2 text-content md:h-[320px] md:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--color-surface-elevated-val)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ backgroundColor: 'var(--color-surface-card-val)', border: '1px solid var(--color-hairline-val)', borderRadius: 8, color: 'var(--color-content-val)' }}
            labelStyle={{ color: 'var(--color-content-val)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: 12, color: 'var(--color-content-val)' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
