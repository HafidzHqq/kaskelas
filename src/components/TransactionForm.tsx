'use client';

import { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '@/types';
import { members } from '@/lib/constants';
import { Search } from 'lucide-react';

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
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDate(initialData.date);
      setDescription(initialData.description);
      if (initialData.category) setCategory(initialData.category);
      if (initialData.source) setSource(initialData.source);
      if (initialData.memberIds) {
        setSelectedMembers(initialData.memberIds);
        // Show amount per person if it's an income transaction with members
        if (initialData.type === 'income' && initialData.memberIds.length > 0) {
          setAmount((initialData.amount / initialData.memberIds.length).toString());
        } else {
          setAmount(initialData.amount.toString());
        }
      } else {
        setAmount(initialData.amount.toString());
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If it's income with selected members, the total amount is (amount per person * number of members)
    const finalAmount = (type === 'income' && selectedMembers.length > 0) 
      ? Number(amount) * selectedMembers.length 
      : Number(amount);

    onSubmit({
      type,
      date,
      amount: finalAmount,
      description,
      ...(type === 'expense' ? { category } : { source, memberIds: selectedMembers }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 sm:gap-4 w-full bg-surface-card p-4 sm:p-6 rounded-xl border border-hairline">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs sm:text-sm font-medium text-muted">Jenis Transaksi</label>
        <div className="flex gap-4 sm:gap-6">
          <label className="flex items-center gap-2 text-xs sm:text-sm text-content cursor-pointer">
            <input type="radio" checked={type === 'income'} onChange={() => setType('income')} className="accent-primary" />
            Pemasukan
          </label>
          <label className="flex items-center gap-2 text-xs sm:text-sm text-content cursor-pointer">
            <input type="radio" checked={type === 'expense'} onChange={() => setType('expense')} className="accent-primary" />
            Pengeluaran
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs sm:text-sm font-medium text-muted" htmlFor="date">Tanggal</label>
        <input id="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-surface-elevated border border-hairline rounded-md p-2.5 text-content text-xs sm:text-sm focus:outline-none focus:border-primary" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs sm:text-sm font-medium text-muted" htmlFor="amount">Nominal {type === 'income' ? '(Per Orang)' : ''}</label>
        <input 
          id="amount" 
          type="text" 
          inputMode="numeric"
          required 
          value={amount ? Number(amount).toLocaleString('id-ID') : ''} 
          onChange={(e) => {
            const rawValue = e.target.value.replace(/\D/g, '');
            setAmount(rawValue);
          }} 
          placeholder="0" 
          className="w-full bg-surface-elevated border border-hairline rounded-md p-2.5 text-content text-xs sm:text-sm focus:outline-none focus:border-primary" 
        />
      </div>

      {type === 'expense' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-sm font-medium text-muted" htmlFor="category">Kategori</label>
          <select id="category" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-surface-elevated border border-hairline rounded-md p-2.5 text-content text-xs sm:text-sm focus:outline-none focus:border-primary">
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {type === 'income' && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-muted" htmlFor="source">Sumber Keterangan</label>
            <input id="source" type="text" required value={source} onChange={(e) => setSource(e.target.value)} placeholder="Contoh: Uang Kas Bulan Agustus" className="w-full bg-surface-elevated border border-hairline rounded-md p-2.5 text-content text-xs sm:text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end gap-2">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-medium text-muted">Daftar Anggota yang Bayar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari nama..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full bg-surface-elevated border border-hairline rounded-md pl-8 p-2 text-content text-xs sm:text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedMembers(selectedMembers.length === members.length ? [] : members.map(m => m.id))}
                className="text-xs text-primary hover:underline focus:outline-none pb-2.5 whitespace-nowrap"
              >
                {selectedMembers.length === members.length ? 'Batal Semua' : 'Pilih Semua'}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto bg-surface-elevated border border-hairline rounded-md p-2 grid grid-cols-1 sm:grid-cols-2 gap-2 scrollbar-thin scrollbar-thumb-surface-card scrollbar-track-transparent">
              {filteredMembers.map(member => (
                <label key={member.id} className="flex items-center gap-2 p-1.5 hover:bg-surface-card rounded cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="accent-primary w-4 h-4 rounded border-hairline"
                    checked={selectedMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, member.id]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                      }
                    }}
                  />
                  <span className="text-xs sm:text-sm text-content truncate">{member.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted mt-0.5">{selectedMembers.length} anggota dipilih</p>
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs sm:text-sm font-medium text-muted" htmlFor="description">Catatan Tambahan</label>
        <textarea id="description" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detail transaksi..." rows={3} className="w-full bg-surface-elevated border border-hairline rounded-md p-2.5 text-content text-xs sm:text-sm focus:outline-none focus:border-primary resize-none"></textarea>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3 mt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="w-full sm:flex-1 py-2.5 rounded-md bg-surface-elevated text-content font-medium text-xs sm:text-sm hover:bg-hairline transition-colors">
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
