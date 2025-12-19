import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-[#0A0A0F]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>Built for the</span>
            <a
              href="https://docs.lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300"
            >
              LazorKit Bounty
            </a>
          </div>

          {/* Center */}
          <div className="flex items-center gap-1 text-sm text-zinc-600">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <span>for Solana developers</span>
          </div>

          {/* Right */}
          <div className="text-sm text-zinc-500">
            <span>Network: </span>
            <span className="text-emerald-400">Devnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
