'use client';

import { useWallet } from '@lazorkit/wallet';
import { Fingerprint, Zap, Shield, ArrowRight } from 'lucide-react';

/**
 * Hero Section Component
 *
 * Landing page hero with feature highlights.
 */
export function Hero() {
  const { isConnected, wallet } = useWallet();

  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/30 px-4 py-1.5 mb-8">
          <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-sm text-violet-300">Powered by LazorKit SDK</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Subscription Payments
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Without the Friction
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Accept recurring USDC payments on Solana with passkey authentication.
          No seed phrases, no wallet extensions, no gas fees for users.
        </p>

        {/* Connection Status */}
        {isConnected && wallet && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-2 mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-zinc-300">
              Connected: <span className="font-mono">{wallet.smartWallet.slice(0, 8)}...{wallet.smartWallet.slice(-8)}</span>
            </span>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mt-12">
          <div className="rounded-xl bg-zinc-800/30 border border-zinc-800 p-5 text-left">
            <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center mb-3">
              <Fingerprint className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Passkey Auth</h3>
            <p className="text-sm text-zinc-500">
              Sign in with Face ID, Touch ID, or Windows Hello. No seed phrases.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-800/30 border border-zinc-800 p-5 text-left">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Gasless Transactions</h3>
            <p className="text-sm text-zinc-500">
              Users pay in USDC. Gas fees are sponsored by the Paymaster.
            </p>
          </div>

          <div className="rounded-xl bg-zinc-800/30 border border-zinc-800 p-5 text-left">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-3">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-white mb-1">Smart Wallets</h3>
            <p className="text-sm text-zinc-500">
              Programmable accounts with built-in recovery and policies.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2 text-zinc-500">
          <span className="text-sm">Scroll to view pricing</span>
          <ArrowRight className="h-4 w-4 rotate-90 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
