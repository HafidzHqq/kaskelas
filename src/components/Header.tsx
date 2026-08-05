'use client';

import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Wallet, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transactions', label: 'Riwayat' },
  { id: 'add', label: 'Transaksi' },
  { id: 'members', label: 'Transaksi Anggota' },
  { id: 'reports', label: 'Laporan' },
];

export default function Header({
  isAdmin,
  onToggleAdmin,
  activePage,
  onNavigate,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-primary" />
            <div className="text-content font-bold text-xl tracking-tight">
              BAYAR-WOY
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'text-primary'
                    : 'text-muted hover:text-content'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-surface-elevated transition-colors text-muted hover:text-content"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            {isAdmin && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-sm border border-primary/20">
                ADMIN
              </span>
            )}
            <button
              onClick={onToggleAdmin}
              className="text-sm font-medium text-muted hover:text-content transition-colors"
            >
              {isAdmin ? (
                <span className="flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> Keluar
                </span>
              ) : (
                'Login'
              )}
            </button>
          </div>

          <button
            className="md:hidden p-2 text-content"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-card border-t border-hairline">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'bg-primary text-on-primary'
                    : 'text-content hover:bg-surface-elevated'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-hairline pt-3 mt-3">
              {isAdmin && (
                <span className="block text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-sm mb-2 text-center">
                  ADMIN
                </span>
              )}
              <button
                onClick={() => {
                  onToggleAdmin();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-center px-4 py-3 rounded-md text-sm font-medium text-primary border border-primary hover:bg-primary hover:text-on-primary transition-colors"
              >
                {isAdmin ? 'Keluar dari Admin' : 'Login Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
