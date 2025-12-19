'use client';

import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/demo/HeroSection';
import { PlaygroundSection } from '@/components/demo/PlaygroundSection';
import { CodePreview } from '@/components/demo/CodePreview';
import { Footer } from '@/components/layout/Footer';

/**
 * LazorKit Developer Playground
 *
 * An interactive demo that teaches developers how to integrate
 * LazorKit SDK for passkey authentication and gasless transactions.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Header />

      <main>
        <HeroSection />
        <PlaygroundSection />
        <CodePreview />
      </main>

      <Footer />
    </div>
  );
}
