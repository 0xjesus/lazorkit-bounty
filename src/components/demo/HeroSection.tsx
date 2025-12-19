'use client';

import { Fingerprint, Zap, Code2, ArrowDown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
          <span className="text-sm text-violet-300 font-medium">Developer Playground</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Learn{' '}
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            LazorKit
          </span>
          <br />
          in 5 Minutes
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
          Interactive demo for developers. Connect with passkey, sign messages,
          and send gasless transactions. See exactly what happens under the hood.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50">
            <Fingerprint className="h-4 w-4 text-violet-400" />
            <span className="text-sm text-zinc-300">Passkey Auth</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-zinc-300">Gasless Transactions</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50">
            <Code2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-zinc-300">Copy-Paste Code</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center gap-2 text-zinc-500 animate-bounce">
          <span className="text-sm">Try it below</span>
          <ArrowDown className="h-4 w-4" />
        </div>
      </div>
    </section>
  );
}
