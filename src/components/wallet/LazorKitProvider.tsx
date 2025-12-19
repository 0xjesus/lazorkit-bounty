'use client';

import { ReactNode, useEffect, useState } from 'react';
import { LazorkitProvider, useWallet } from '@lazorkit/wallet';
import { Buffer } from 'buffer';

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

interface LazorKitWrapperProps {
  children: ReactNode;
}

// Configuration from environment variables
const CONFIG = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.lazorkit.xyz/',
  ipfsUrl: process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal.lazor.sh',
  paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || 'https://kora.devnet.lazorkit.com',
};

export function LazorKitWrapper({ children }: LazorKitWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('=== LAZORKIT PROVIDER INIT (v1.4.3-beta) ===');
    console.log('RPC:', CONFIG.rpcUrl);
    console.log('IPFS/Portal:', CONFIG.ipfsUrl);
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

  return (
    <LazorkitProvider
      rpcUrl={CONFIG.rpcUrl}
      ipfsUrl={CONFIG.ipfsUrl}
      paymasterUrl={CONFIG.paymasterUrl}
    >
      {children}
    </LazorkitProvider>
  );
}

// Re-export useWallet for components to use
export { useWallet };

// Custom hook that wraps useWallet with additional logging
export function useLazorKit() {
  const wallet = useWallet();

  return {
    connect: async () => {
      console.log('=== CONNECT CALLED ===');
      console.log('Calling wallet.connect()...');
      try {
        const result = await wallet.connect();
        console.log('wallet.connect() completed:', result);
        return result;
      } catch (err) {
        console.error('Connect error:', err);
        throw err;
      }
    },
    disconnect: wallet.disconnect,
    signTransaction: wallet.signTransaction,
    signAndSendTransaction: wallet.signAndSendTransaction,
    isConnected: wallet.isConnected,
    isConnecting: wallet.isConnecting,
    publicKey: wallet.account?.smartWallet || null,
    account: wallet.account,
    smartWalletPubkey: wallet.smartWalletPubkey,
    error: wallet.error,
    isSigning: wallet.isSigning,
  };
}

export default LazorKitWrapper;
