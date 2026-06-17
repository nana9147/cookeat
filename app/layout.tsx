import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import AuthInitializer from '@/components/(auth)/AuthInitializer';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cookeat',
  description: 'A recipe sharing platform built with Next.js and Tailwind CSS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthInitializer />
        {children}
        <Toaster
          position="top-center"
          closeButton
          toastOptions={{
            style: {
              border: '1px solid var(--border)',
              fontSize: '14px',
              borderRadius: 'var(--radius-lg)',
            },
            classNames: {
              success: '!bg-white !text-primary !border-primary',
              error: '!bg-white !text-red !border-red',
            },
          }}
        />
      </body>
    </html>
  );
}
