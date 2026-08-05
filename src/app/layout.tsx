import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'BAYAR-WOY',
  description: 'Sistem manajemen keuangan kelas yang transparan dan mudah digunakan',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect x=%2215%22 y=%2225%22 width=%2270%22 height=%2250%22 rx=%228%22 fill=%22%23d97706%22/><path d=%22M 60 38 L 85 38 L 85 62 L 60 62 Z%22 fill=%22%23b45309%22/><circle cx=%2272%22 cy=%2250%22 r=%225%22 fill=%22%23fcd34d%22/></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased selection:bg-primary/30 selection:text-primary min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
