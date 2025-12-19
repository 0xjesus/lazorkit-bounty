'use client';

import { Github, BookOpen, MessageCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#0A0A0F]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <span className="text-white font-bold text-sm">LK</span>
            </div>
            <span className="font-bold text-white">
              LazorKit <span className="text-zinc-500 font-normal">Playground</span>
            </span>
          </a>

          {/* Links */}
          <div className="flex items-center gap-1">
            <a
              href="https://docs.lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Docs</span>
            </a>
            <a
              href="https://github.com/lazor-kit/lazor-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://t.me/lazorkit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Telegram</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
