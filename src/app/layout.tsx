import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/components/Providers';
import { MainLayout } from '@/components/MainLayout';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/hooks/useToast';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3e5e82',
};

export const metadata: Metadata = {
  title: 'Sound Calendar // Studio Rhythm Control',
  description: 'An organic, minimalist tool for technical scheduling. Designed for creative studios and sound engineering teams.',
  keywords: ['studio planning', 'sound engineering', 'minimalist calendar', 'technical schedule', 'creative automation'],
  authors: [{ name: 'Sound Calendar Design System' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Sound Calendar // Studio Rhythm Control',
    description: 'An organic, minimalist tool for technical scheduling.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Sound Calendar',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className="bg-bg-base text-text-primary antialiased min-h-screen selection:bg-accent-primary/10 selection:text-accent-primary">
        <ThemeProvider>
          <ToastProvider>
            <StoreProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </StoreProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

