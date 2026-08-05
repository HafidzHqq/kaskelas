'use client';

import { useState, useMemo } from 'react';
import { Transaction } from '@/types';
import { members, formatCurrency, formatDate } from '@/lib/constants';
import { CheckCircle2, XCircle, Search } from 'lucide-react';

interface MemberPaymentListProps {
  transactions: Transaction[];
}

export default function MemberPaymentList({ transactions }: MemberPaymentListProps) {
  const [search, setSearch] = useState('');
  
  // Get all unique dates from income transactions that have memberIds
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    transactions.forEach(tx => {
      if (tx.type === 'income' && tx.memberIds && tx.memberIds.length > 0) {
        dates.add(tx.date);
      }
    });
    return Array.from(dates).sort(); // Sort chronologically
  }, [transactions]);

  const memberStats = useMemo(() => {
    return members.map((member) => {
      let totalPaidAllTime = 0;
      
      // Calculate how much this member paid per date
      const paymentsByDate: Record<string, number> = {};

      transactions.forEach((tx) => {
        if (tx.type === 'income' && tx.memberIds?.includes(member.id)) {
          const amountPerMember = tx.amount / tx.memberIds.length;
          totalPaidAllTime += amountPerMember;

          if (!paymentsByDate[tx.date]) {
            paymentsByDate[tx.date] = 0;
          }
          paymentsByDate[tx.date] += amountPerMember;
        }
      });

      return {
        ...member,
        totalPaidAllTime,
        paymentsByDate
      };
    });
  }, [transactions]);

  const filteredMembers = memberStats.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollectedAllTime = memberStats.reduce((acc, curr) => acc + curr.totalPaidAllTime, 0);

  return (
    <div className="w-full space-y-4">
      
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-surface-card p-4 rounded-xl border border-hairline flex flex-col gap-1">
          <span className="text-sm font-medium text-muted">Total Kas Terkumpul (Dari Anggota)</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(totalCollectedAllTime)}</span>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl border border-hairline overflow-hidden flex flex-col">
        <div className="p-4 border-b border-hairline flex items-center gap-3">
          <Search className="w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Cari nama anggota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-content focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-surface-elevated scrollbar-track-transparent">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-elevated text-muted">
              <tr>
                <th className="px-4 py-3 font-medium sticky left-0 z-10 bg-surface-elevated shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">No</th>
                <th className="px-4 py-3 font-medium sticky left-[48px] sm:left-[52px] z-10 bg-surface-elevated shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Nama Anggota</th>
                <th className="px-4 py-3 font-medium border-r border-hairline">Total Kas</th>
                {availableDates.length > 0 ? (
                  availableDates.map(date => (
                    <th key={date} className="px-4 py-3 font-medium text-center">
                      {formatDate(date)}
                    </th>
                  ))
                ) : (
                  <th className="px-4 py-3 font-medium text-center">Data Iuran</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredMembers.map((member, index) => (
                <tr key={member.id} className="hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-4 py-3 text-muted sticky left-0 z-10 bg-surface-card shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] group-hover:bg-surface-elevated">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-content truncate sticky left-[48px] sm:left-[52px] z-10 bg-surface-card shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] group-hover:bg-surface-elevated">{member.name}</td>
                  <td className="px-4 py-3 text-primary font-medium border-r border-hairline">{formatCurrency(member.totalPaidAllTime)}</td>
                  
                  {availableDates.length > 0 ? (
                    availableDates.map(date => {
                      const amount = member.paymentsByDate[date];
                      const hasPaid = amount && amount > 0;
                      return (
                        <td key={date} className="px-4 py-3">
                          <div className="flex flex-col items-center justify-center gap-1">
                            {hasPaid ? (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-primary" />
                                  <span className="text-primary text-xs font-medium">Lunas</span>
                                </div>
                                <span className="text-content text-xs">{formatCurrency(amount)}</span>
                              </>
                            ) : (
                              <XCircle className="w-4 h-4 text-muted/30" />
                            )}
                          </div>
                        </td>
                      );
                    })
                  ) : (
                    <td className="px-4 py-3 text-center text-muted">-</td>
                  )}
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={availableDates.length + 3} className="px-4 py-8 text-center text-muted">
                    Anggota tidak ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
