'use client';

import { ReactNode, useEffect, useState, createContext, useContext, useCallback } from 'react';
import { Connection, TransactionInstruction } from '@solana/web3.js';
import { useWallet } from '@lazorkit/wallet';
import { Buffer } from 'buffer';

const RPC_URL = 'https://rpc.lazorkit.xyz/';

interface LazorKitContextType {
  connection: Connection | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: ((instruction: TransactionInstruction) => Promise<string>) | null;
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  error: string | null;
}

const LazorKitContext = createContext<LazorKitContextType | undefined>(undefined);

interface LazorKitWrapperProps {
  children: ReactNode;
}

export function LazorKitWrapper({ children }: LazorKitWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [connection, setConnection] = useState<Connection | null>(null);

  // Polyfills
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.Buffer) {
        window.Buffer = Buffer;
      }
    }
    setMounted(true);
  }, []);

  // Initialize connection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const conn = new Connection(RPC_URL, 'confirmed');
      setConnection(conn);
      console.log('=== LAZORKIT PROVIDER INIT ===');
      console.log('RPC:', RPC_URL);
    } catch (error) {
      console.error('Failed to create connection:', error);
    }
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
    <LazorKitProviderInner connection={connection}>
      {children}
    </LazorKitProviderInner>
  );
}

function LazorKitProviderInner({
  children,
  connection
}: {
  children: ReactNode;
  connection: Connection | null;
}) {
  // Use the wallet hook (no arguments in 0.9.6)
  const wallet = useWallet();

  const connect = useCallback(async () => {
    console.log('=== CONNECT CALLED ===');
    console.log('wallet.connect:', typeof wallet?.connect);

    if (!wallet?.connect) {
      console.error('Connect function not available');
      return;
    }
    try {
      console.log('Calling wallet.connect()...');
      await wallet.connect();
      console.log('wallet.connect() completed');
    } catch (err) {
      console.error('Connect error:', err);
    }
  }, [wallet]);

  const disconnect = useCallback(() => {
    if (wallet?.disconnect) {
      wallet.disconnect();
    }
  }, [wallet]);

  const contextValue: LazorKitContextType = {
    connection,
    connect,
    disconnect,
    signMessage: wallet?.signMessage || null,
    isConnected: wallet?.isConnected || false,
    isConnecting: wallet?.isLoading || false,
    publicKey: wallet?.publicKey || null,
    error: wallet?.error || null,
  };

  return (
    <LazorKitContext.Provider value={contextValue}>
      {children}
    </LazorKitContext.Provider>
  );
}

export function useLazorKit() {
  const context = useContext(LazorKitContext);
  if (!context) {
    throw new Error('useLazorKit must be used within LazorKitWrapper');
  }
  return context;
}

export default LazorKitWrapper;
