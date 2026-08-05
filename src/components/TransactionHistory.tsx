'use client';

import { useState, useMemo } from 'react';
import { Transaction } from '@/types';
import { TransactionList } from './TransactionList';
import { Search } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit: (tx: Transaction) => void;
}

type FilterType = 'all' | 'income' | 'expense';
type SortType = 'newest' | 'oldest' | 'largest';

export function TransactionHistory({ transactions, isAdmin, onDelete, onEdit }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortType>('newest');

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (filter !== 'all') {
      result = result.filter((tx) => tx.type === filter);
    }

    if (search.trim() !== '') {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.description.toLowerCase().includes(lowerSearch) ||
          (tx.category && tx.category.toLowerCase().includes(lowerSearch)) ||
          (tx.source && tx.source.toLowerCase().includes(lowerSearch))
      );
    }

    result.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'largest':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

    return result;
  }, [transactions, filter, search, sort]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
        <div className="flex w-full sm:w-auto overflow-x-auto bg-surface-elevated p-1 rounded-lg scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-colors ${filter === 'all' ? 'bg-surface-card text-primary font-medium' : 'text-muted hover:text-content'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-colors ${filter === 'income' ? 'bg-surface-card text-primary font-medium' : 'text-muted hover:text-content'}`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-colors ${filter === 'expense' ? 'bg-surface-card text-primary font-medium' : 'text-muted hover:text-content'}`}
          >
            Pengeluaran
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:ml-auto w-full sm:w-auto">
          <div className="relative flex-1 sm:w-52 lg:w-64 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted flex-shrink-0" size={16} />
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-elevated border border-hairline rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-content focus:outline-none focus:border-primary truncate"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="w-full sm:w-auto bg-surface-elevated border border-hairline rounded-lg px-3 py-2 text-xs sm:text-sm text-content focus:outline-none focus:border-primary"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="largest">Nominal Terbesar</option>
          </select>
        </div>
      </div>

      <div className="bg-surface-card rounded-lg border border-hairline overflow-hidden">
        <TransactionList
          transactions={filteredAndSortedTransactions}
          isAdmin={isAdmin}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}
