'use client';

import { useWallet } from '@lazorkit/wallet';
import { Fingerprint, LogOut, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';

/**
 * Connect Button Component
 *
 * Handles wallet connection using LazorKit's passkey authentication.
 * Shows a clean UI for connecting, viewing wallet address, and disconnecting.
 *
 * @example
 * ```tsx
 * <ConnectButton />
 * ```
 */
export function ConnectButton() {
  const { connect, disconnect, isConnected, isConnecting, wallet } = useWallet();
  const [copied, setCopied] = useState(false);

  // Copy wallet address to clipboard
  const copyAddress = async () => {
    if (wallet?.smartWallet) {
      await navigator.clipboard.writeText(wallet.smartWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format address for display (e.g., "Abc1...xyz9")
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Handle connection
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  // Handle disconnection
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  // Loading state
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

  // Connected state
  if (isConnected && wallet) {
    return (
      <div className="flex items-center gap-2">
        {/* Wallet Address Badge */}
        <div className="flex items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-mono text-zinc-300">
            {formatAddress(wallet.smartWallet)}
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
            href={`https://explorer.solana.com/address/${wallet.smartWallet}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-zinc-700 rounded-md transition-colors"
            title="View on Explorer"
          >
            <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
          </a>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={handleDisconnect}
          className="flex items-center gap-2 rounded-xl bg-zinc-800 px-3 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-zinc-700 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Disconnected state
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
