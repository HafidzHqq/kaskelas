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
      <div className="flex h-[250px] items-center justify-center rounded-lg bg-[#0b0e11] text-sm text-[#707a8a] md:h-[320px]">
        Belum ada data pengeluaran
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full rounded-lg bg-[#0b0e11] p-2 text-[#ffffff] md:h-[320px] md:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1e2329', border: '1px solid #2b3139', borderRadius: 8, color: '#ffffff' }}
            formatter={(value) => Number(value).toLocaleString('id-ID')}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#ffffff' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
