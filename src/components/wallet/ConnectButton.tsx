'use client';

import { useLazorKit } from '@/components/wallet/LazorKitProvider';
import { Fingerprint, LogOut, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

/**
 * Connect Button Component
 */
export function ConnectButton() {
  const { connect, disconnect, isConnected, isConnecting, publicKey } = useLazorKit();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  if (isConnecting) {
    return (
      <button
        disabled
        className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-mono text-zinc-300">
            {formatAddress(publicKey)}
          </span>
          <button
            onClick={copyAddress}
            className="p-1 hover:bg-zinc-700 rounded-md transition-colors"
            title="Copy address"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-zinc-500" />
            )}
          </button>
          <a
            href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-zinc-700 rounded-md transition-colors"
            title="View on Explorer"
          >
            <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
          </a>
        </div>
        <button
          onClick={handleDisconnect}
          className="flex items-center gap-2 rounded-xl bg-zinc-800 px-3 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-700 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]"
    >
      <Fingerprint className="h-4 w-4 transition-transform group-hover:scale-110" />
      Connect with Passkey
    </button>
  );
}

export default ConnectButton;
