import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KasKelas - Transparansi Keuangan Kelas',
  description: 'Aplikasi web untuk mencatat pemasukan dan pengeluaran keuangan kelas secara transparan',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
