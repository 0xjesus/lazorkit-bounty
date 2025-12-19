import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LazorKitWrapper } from '@/components/wallet';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LazorKit Subscription Starter | Passkey + Gasless Payments on Solana',
  description:
    'A production-ready starter template demonstrating LazorKit SDK integration for subscription payments with passkey authentication and gasless transactions on Solana.',
  keywords: [
    'LazorKit',
    'Solana',
    'Passkey',
    'WebAuthn',
    'Gasless',
    'Subscription',
    'USDC',
    'Smart Wallet',
  ],
  authors: [{ name: 'LazorKit Bounty Submission' }],
  openGraph: {
    title: 'LazorKit Subscription Starter',
    description: 'Passkey authentication + gasless USDC payments on Solana',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <LazorKitWrapper>{children}</LazorKitWrapper>
      </body>
    </html>
  );
}
