import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/components/Providers';
import { MainLayout } from '@/components/MainLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8b5cf6',
};

export const metadata: Metadata = {
  title: 'Sound Calendar // Sincronização de Frequências de Equipe',
  description: 'Sistema de precisão para gerenciamento de escalas técnicas e roteamento de sinais de notificação via Telegram. Estúdio de controle de pessoal Sound Team.',
  keywords: ['sound engineering', 'escala de som', 'calendário técnico', 'automação telegram', 'equipe de som', 'broadcast scheduling'],
  authors: [{ name: 'Sound Team Engineering' }],
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Sound Calendar // Studio Control Room',
    description: 'Gestão técnica de escalas com roteamento de sinal em tempo real.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Sound Calendar',
  }
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-base text-text-primary antialiased min-h-screen">
        <ThemeProvider>
          <StoreProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

