'use client';

import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transactions', label: 'Riwayat' },
  { id: 'add', label: 'Tambah' },
  { id: 'reports', label: 'Laporan' },
];

export default function Header({
  isAdmin,
  onToggleAdmin,
  activePage,
  onNavigate,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-canvas-dark border-b border-hairline-on-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="text-primary font-bold text-xl tracking-tight">
              KasKelas
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
                    : 'text-muted hover:text-on-dark'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAdmin && (
              <span className="text-xs font-medium text-canvas-dark bg-primary px-2 py-1 rounded-sm">
                ADMIN
              </span>
            )}
            <button
              onClick={onToggleAdmin}
              className="text-sm font-medium text-muted hover:text-on-dark transition-colors"
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
            className="md:hidden p-2 text-on-dark"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-card-dark border-t border-hairline-on-dark">
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
                    : 'text-on-dark hover:bg-surface-elevated-dark'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-hairline-on-dark pt-3 mt-3">
              {isAdmin && (
                <span className="block text-xs font-medium text-canvas-dark bg-primary px-2 py-1 rounded-sm mb-2 text-center">
                  MODE ADMIN AKTIF
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
