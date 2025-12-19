'use client';

import { ReactNode, useEffect, useState } from 'react';
import { LazorkitProvider, useWallet } from '@lazorkit/wallet';
import { Buffer } from 'buffer';
import { PublicKey } from '@solana/web3.js';

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

interface LazorKitWrapperProps {
  children: ReactNode;
}

// Configuration from environment variables - SDK 2.0.1 compatible
const CONFIG = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal.lazor.sh',
  paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || 'https://kora.devnet.lazorkit.com',
};

export function LazorKitWrapper({ children }: LazorKitWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('=== LAZORKIT PROVIDER INIT (v2.0.1) ===');
    console.log('RPC:', CONFIG.rpcUrl);
    console.log('Portal:', CONFIG.portalUrl);
    console.log('Paymaster:', CONFIG.paymasterUrl);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-pulse text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  // SDK 2.0.1 Provider configuration
  return (
    <LazorkitProvider
      rpcUrl={CONFIG.rpcUrl}
      portalUrl={CONFIG.portalUrl}
      paymasterConfig={{
        paymasterUrl: CONFIG.paymasterUrl,
      }}
    >
      {children}
    </LazorkitProvider>
  );
}

// Re-export useWallet for components to use
export { useWallet };

// Custom hook that wraps useWallet with SDK 2.0.1 compatible interface
export function useLazorKit() {
  const walletHook = useWallet();

  // Derive smartWalletPubkey from wallet.smartWallet string
  const smartWalletAddress = walletHook.wallet?.smartWallet || null;
  const smartWalletPubkey = smartWalletAddress ? new PublicKey(smartWalletAddress) : null;

  return {
    connect: async () => {
      console.log('=== CONNECT CALLED ===');
      console.log('Calling wallet.connect()...');
      try {
        const result = await walletHook.connect();
        console.log('wallet.connect() completed:', result);
        return result;
      } catch (err) {
        console.error('Connect error:', err);
        throw err;
      }
    },
    disconnect: walletHook.disconnect,
    signMessage: walletHook.signMessage,
    signAndSendTransaction: walletHook.signAndSendTransaction,
    isConnected: !!walletHook.wallet?.smartWallet,
    isConnecting: walletHook.isConnecting,
    publicKey: smartWalletAddress,
    wallet: walletHook.wallet,
    smartWalletPubkey,
    error: walletHook.error,
    isSigning: walletHook.isSigning,
  };
}

export default LazorKitWrapper;
