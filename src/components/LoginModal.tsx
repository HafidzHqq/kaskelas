'use client';

import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (success: boolean) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLogin,
}: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (email === 'admin@kaskelas.com' && password === 'admin123') {
      setError('');
      setEmail('');
      setPassword('');
      onLogin(true);
      onClose();
      return;
    }

    setError('Email atau password salah.');
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-surface-card-dark border border-hairline-on-dark rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-hairline-on-dark">
            <h2 className="text-lg font-bold text-on-dark">Login Admin</h2>
            <button
              onClick={onClose}
              className="p-1 text-muted hover:text-on-dark"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kaskelas.com"
                className="w-full px-3 py-2 bg-surface-elevated-dark border border-hairline-on-dark rounded text-on-dark text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                className="w-full px-3 py-2 bg-surface-elevated-dark border border-hairline-on-dark rounded text-on-dark text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            {error && (
              <div className="text-xs text-trading-down bg-trading-down/10 border border-trading-down/20 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-semibold py-2 rounded text-sm hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
