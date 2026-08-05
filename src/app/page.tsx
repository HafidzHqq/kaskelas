'use client';

import { useState, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import Header from '@/components/Header';
import SummaryCard from '@/components/SummaryCard';
import FinanceChart from '@/components/FinanceChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import { TransactionList } from '@/components/TransactionList';
import { TransactionHistory } from '@/components/TransactionHistory';
import { TransactionForm } from '@/components/TransactionForm';
import ReportExport from '@/components/ReportExport';
import LoginModal from '@/components/LoginModal';
import MemberPaymentList from '@/components/MemberPaymentList';
import { formatCurrency } from '@/lib/constants';
import { PiggyBank, TrendingUp, TrendingDown, Hash, Plus } from 'lucide-react';
import { Transaction } from '@/types';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const {
    transactions,
    stats,
    loading,
    error,
    source,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem('kas-kelas-admin');
      if (stored === 'true') {
        setIsAdmin(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const handleToggleAdmin = () => {
    if (isAdmin) {
      try {
        localStorage.removeItem('kas-kelas-admin');
      } catch {
        // ignore
      }
      setIsAdmin(false);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (success: boolean) => {
    if (success) {
      try {
        localStorage.setItem('kas-kelas-admin', 'true');
      } catch {
        // ignore
      }
      setIsAdmin(true);
      setShowLoginModal(false);
    }
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setActivePage('add');
  };

  const handleFormSubmit = async (
    tx: Omit<Transaction, 'id' | 'createdAt'>
  ) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, tx);
      setEditingTransaction(null);
    } else {
      await addTransaction(tx);
    }
    setActivePage('dashboard');
  };

  const handleFormCancel = () => {
    setEditingTransaction(null);
    setActivePage('dashboard');
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-surface-elevated border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-content">
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        {error && (
          <div className="mb-4 bg-trading-down/10 border border-trading-down/30 text-trading-down px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-surface-elevated border-t-primary" />
          </div>
        ) : (
          <>
            {activePage === 'dashboard' && (
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-content">
                      Dashboard Keuangan
                    </h1>
                    <p className="text-sm text-muted mt-1">
                      Transparansi keuangan kelas secara real-time
                    </p>
                  </div>
                  {source === 'firebase' && (
                    <span className="text-xs bg-trading-up/10 text-trading-up px-2 py-1 rounded border border-trading-up/20 font-medium">
                      Firebase
                    </span>
                  )}
                  {source === 'local' && (
                    <span className="text-xs bg-muted/10 text-muted px-2 py-1 rounded border border-muted/20 font-medium">
                      Lokal
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <SummaryCard
                    title="Saldo Kas"
                    value={stats.totalSaldo}
                    icon={<PiggyBank className="w-7 h-7" />}
                    className="col-span-2 lg:col-span-1"
                    valueClassName="text-primary"
                  />
                  <SummaryCard
                    title="Pemasukan"
                    value={stats.totalPemasukan}
                    icon={<TrendingUp className="w-7 h-7" />}
                    valueClassName="text-trading-up"
                    trend={
                      stats.bulanIni.pemasukan > 0
                        ? {
                            value: stats.bulanIni.pemasukan,
                            label: 'bln ini',
                            positive: true,
                          }
                        : undefined
                    }
                  />
                  <SummaryCard
                    title="Pengeluaran"
                    value={stats.totalPengeluaran}
                    icon={<TrendingDown className="w-7 h-7" />}
                    valueClassName="text-trading-down"
                    trend={
                      stats.bulanIni.pengeluaran > 0
                        ? {
                            value: stats.bulanIni.pengeluaran,
                            label: 'bln ini',
                            positive: false,
                          }
                        : undefined
                    }
                  />
                  <SummaryCard
                    title="Transaksi"
                    value={stats.jumlahTransaksi}
                    icon={<Hash className="w-7 h-7" />}
                    isCurrency={false}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-surface-card rounded-xl border border-hairline p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-4 text-content">
                      Grafik Keseluruhan
                    </h2>
                    <FinanceChart transactions={transactions} />
                  </div>

                  <div className="bg-surface-card rounded-xl border border-hairline p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base sm:text-lg font-semibold">
                        Aktivitas Terbaru
                      </h2>
                      {transactions.length > 10 && (
                        <button
                          onClick={() => setActivePage('transactions')}
                          className="text-xs text-primary hover:underline"
                        >
                          Lihat semua
                        </button>
                      )}
                    </div>
                    <TransactionList
                      transactions={transactions.slice(0, 10)}
                      isAdmin={isAdmin}
                      onDelete={deleteTransaction}
                      onEdit={handleEditTransaction}
                    />
                  </div>
                </div>
              </div>
            )}

            {activePage === 'transactions' && (
              <div className="space-y-4">
                <h1 className="text-xl sm:text-2xl font-bold">
                  Riwayat Transaksi
                </h1>
                <TransactionHistory
                  transactions={transactions}
                  isAdmin={isAdmin}
                  onDelete={deleteTransaction}
                  onEdit={handleEditTransaction}
                />
              </div>
            )}

            {activePage === 'add' && (
              <div className="w-full max-w-2xl mx-auto space-y-4">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
                </h1>
                {!isAdmin ? (
                  <div className="w-full bg-surface-card border border-hairline rounded-xl p-5 sm:p-8 space-y-4">
                    <div className="text-center space-y-3">
                      <p className="text-muted text-sm sm:text-base leading-relaxed">
                        Hanya admin yang dapat menambah atau mengedit transaksi.
                      </p>
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="w-full sm:w-auto bg-primary text-on-primary font-semibold px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity text-sm"
                      >
                        Login Admin
                      </button>
                    </div>
                  </div>
                ) : (
                  <TransactionForm
                    onSubmit={handleFormSubmit}
                    initialData={editingTransaction}
                    onCancel={handleFormCancel}
                  />
                )}
              </div>
            )}

            {activePage === 'members' && (
              <div className="space-y-4">
                <h1 className="text-xl sm:text-2xl font-bold">
                  Transaksi Anggota
                </h1>
                <MemberPaymentList transactions={transactions} />
              </div>
            )}

            {activePage === 'reports' && (
              <div className="space-y-6">
                <h1 className="text-xl sm:text-2xl font-bold">
                  Laporan Keuangan
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-surface-card border border-hairline rounded-xl p-4 sm:p-5">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">
                      Total Pemasukan
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-trading-up tabular-nums">
                      {formatCurrency(stats.totalPemasukan)}
                    </p>
                  </div>
                  <div className="bg-surface-card border border-hairline rounded-xl p-4 sm:p-5">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">
                      Total Pengeluaran
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-trading-down tabular-nums">
                      {formatCurrency(stats.totalPengeluaran)}
                    </p>
                  </div>
                  <div className="bg-surface-card border border-hairline rounded-xl p-4 sm:p-5">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">
                      Saldo Bersih
                    </p>
                    <p
                      className={`text-xl sm:text-2xl font-bold tabular-nums ${
                        stats.totalSaldo >= 0 ? 'text-primary' : 'text-trading-down'
                      }`}
                    >
                      {formatCurrency(stats.totalSaldo)}
                    </p>
                  </div>
                </div>

                <ReportExport transactions={transactions} stats={stats} />

                <div className="bg-surface-card border border-hairline rounded-xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold mb-4">
                    Distribusi Pengeluaran
                  </h2>
                  <CategoryPieChart
                    transactions={transactions.filter((tx) => tx.type === 'expense')}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {isAdmin && activePage !== 'add' && (
        <div className="fixed bottom-6 right-4 md:hidden z-40">
          <button
            onClick={() => setActivePage('add')}
            className="flex items-center justify-center w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg hover:opacity-90 transition-opacity"
            aria-label="Tambah Transaksi"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginSuccess}
      />
    </div>
  );
}
