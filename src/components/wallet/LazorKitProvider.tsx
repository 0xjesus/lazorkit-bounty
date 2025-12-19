'use client';

import { ReactNode, useEffect, useState } from 'react';
import { LazorkitProvider } from '@lazorkit/wallet';
import { LAZORKIT_CONFIG } from '@/config/lazorkit';

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  const { Buffer } = require('buffer');
  window.Buffer = window.Buffer || Buffer;
}

interface LazorKitWrapperProps {
  children: ReactNode;
}

/**
 * LazorKit Provider Wrapper
 *
 * This component wraps your application with the LazorKit context,
 * enabling passkey authentication and gasless transactions throughout your app.
 *
 * @example
 * ```tsx
 * <LazorKitWrapper>
 *   <App />
 * </LazorKitWrapper>
 * ```
 */
export function LazorKitWrapper({ children }: LazorKitWrapperProps) {
  // Ensure we only render on client side (required for WebAuthn)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <LazorkitProvider
      rpcUrl={LAZORKIT_CONFIG.rpcUrl}
      portalUrl={LAZORKIT_CONFIG.portalUrl}
      paymasterConfig={LAZORKIT_CONFIG.paymasterConfig}
    >
      {children}
    </LazorkitProvider>
  );
}

export default LazorKitWrapper;
