'use client';

import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/constants';
import { Pencil, Trash2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  onEdit?: (tx: Transaction) => void;
  isAdmin: boolean;
}

export function TransactionList({ transactions, onDelete, onEdit, isAdmin }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex min-h-32 items-center justify-center p-6 text-center text-sm text-muted">
        <p>Belum ada transaksi.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-start gap-3 p-3 sm:p-4 border-b border-hairline bg-background hover:bg-surface-card transition-colors last:border-b-0 min-w-0"
        >
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`flex-shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-medium ${tx.type === 'income' ? 'bg-trading-up/10 text-trading-up' : 'bg-trading-down/10 text-trading-down'}`}>
                {tx.type === 'income' ? 'Masuk' : 'Keluar'}
              </span>
              <span className="text-[11px] sm:text-xs text-muted truncate">{formatDate(tx.date)}</span>
            </div>
            <p className="text-sm font-medium text-content truncate">{tx.description}</p>
            {(tx.category || tx.source) && (
              <p className="text-[11px] sm:text-xs text-muted truncate">
                {tx.type === 'income' ? `Sumber: ${tx.source}` : `Kategori: ${tx.category}`}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${tx.type === 'income' ? 'text-trading-up' : 'text-trading-down'}`}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
            </span>
            {isAdmin && (
              <div className="flex items-center gap-0.5">
                {onEdit && (
                  <button onClick={() => onEdit(tx)} className="p-1.5 text-muted hover:text-primary transition-colors" aria-label="Edit transaksi">
                    <Pencil size={14} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(tx.id)} className="p-1.5 text-muted hover:text-trading-down transition-colors" aria-label="Hapus transaksi">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
