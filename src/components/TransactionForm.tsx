'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '@/types';

interface TransactionFormProps {
  onSubmit: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialData?: Transaction | null;
  onCancel?: () => void;
}

const CATEGORIES = ['Konsumsi', 'Kegiatan', 'Transportasi', 'ATK', 'Donasi', 'Lainnya'];

export function TransactionForm({ onSubmit, initialData, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('income');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [source, setSource] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDate(initialData.date);
      setAmount(initialData.amount.toString());
      setDescription(initialData.description);
      if (initialData.category) setCategory(initialData.category);
      if (initialData.source) setSource(initialData.source);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      date,
      amount: Number(amount),
      description,
      ...(type === 'expense' ? { category } : { source }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4 w-full bg-surface-card-dark p-4 sm:p-6 rounded-xl border border-hairline-on-dark">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs sm:text-sm font-medium text-muted">Jenis Transaksi</label>
        <div className="flex gap-4 sm:gap-6">
          <label className="flex items-center gap-2 text-xs sm:text-sm text-on-dark cursor-pointer">
            <input type="radio" checked={type === 'income'} onChange={() => setType('income')} className="accent-primary" />
            Pemasukan
          </label>
          <label className="flex items-center gap-2 text-xs sm:text-sm text-on-dark cursor-pointer">
            <input type="radio" checked={type === 'expense'} onChange={() => setType('expense')} className="accent-primary" />
            Pengeluaran
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs sm:text-sm font-medium text-muted" htmlFor="date">Tanggal</label>
        <input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-surface-elevated-dark border border-hairline-on-dark rounded-md p-2.5 text-on-dark text-xs sm:text-sm focus:outline-none focus:border-primary" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs sm:text-sm font-medium text-muted" htmlFor="amount">Nominal</label>
        <input id="amount" type="number" required min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-surface-elevated-dark border border-hairline-on-dark rounded-md p-2.5 text-on-dark text-xs sm:text-sm focus:outline-none focus:border-primary" />
      </div>

      {type === 'expense' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-muted" htmlFor="category">Kategori</label>
          <select id="category" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-surface-elevated-dark border border-hairline-on-dark rounded-md p-2.5 text-on-dark text-xs sm:text-sm focus:outline-none focus:border-primary">
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {type === 'income' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-muted" htmlFor="source">Sumber</label>
          <input id="source" type="text" required value={source} onChange={(e) => setSource(e.target.value)} placeholder="Contoh: Iuran Wajib" className="w-full bg-surface-elevated-dark border border-hairline-on-dark rounded-md p-2.5 text-on-dark text-xs sm:text-sm focus:outline-none focus:border-primary" />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs sm:text-sm font-medium text-muted" htmlFor="description">Keterangan</label>
        <textarea id="description" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detail transaksi..." rows={3} className="w-full bg-surface-elevated-dark border border-hairline-on-dark rounded-md p-2.5 text-on-dark text-xs sm:text-sm focus:outline-none focus:border-primary resize-none"></textarea>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3 mt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="w-full sm:flex-1 py-2.5 rounded-md bg-surface-elevated-dark text-on-dark font-medium text-xs sm:text-sm hover:bg-hairline-on-dark transition-colors">
            Batal
          </button>
        )}
        <button type="submit" className="w-full sm:flex-1 py-2.5 rounded-md bg-primary text-on-primary font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity">
          Simpan
        </button>
      </div>
    </form>
  );
}
