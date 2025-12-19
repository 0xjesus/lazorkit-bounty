'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  Fingerprint,
  FileSignature,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Wallet,
  Clock,
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'pending';
  message: string;
  details?: string;
}

export function PlaygroundSection() {
  const {
    connect,
    disconnect,
    signMessage,
    signAndSendTransaction,
    isConnected,
    isConnecting,
    wallet,
    smartWalletPubkey,
  } = useWallet();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);

  // Add log entry
  const addLog = useCallback((type: LogEntry['type'], message: string, details?: string) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
      details,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 20)); // Keep last 20 logs
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
    setLastSignature(null);
  }, []);

  // Step 1: Connect with Passkey
  const handleConnect = async () => {
    try {
      addLog('pending', 'Initiating passkey authentication...');
      addLog('info', 'Opening LazorKit portal for WebAuthn');

      const result = await connect();

      // Use result directly since React state may not be updated yet
      if (result && result.smartWallet) {
        addLog('success', 'Wallet connected successfully!');
        addLog('info', `Smart Wallet: ${result.smartWallet}`);
      } else {
        addLog('success', 'Wallet connected!');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      addLog('error', 'Connection failed', message);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    try {
      await disconnect();
      addLog('info', 'Wallet disconnected');
      setLastSignature(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Disconnect failed';
      addLog('error', 'Disconnect failed', message);
    }
  };

  // Step 2: Sign Message
  const handleSignMessage = async () => {
    if (!isConnected) {
      addLog('error', 'Please connect wallet first');
      return;
    }

    setIsSigning(true);
    try {
      addLog('pending', 'Requesting message signature...');
      addLog('info', 'Message: "Hello from LazorKit Playground!"');

      const result = await signMessage('Hello from LazorKit Playground!');

      addLog('success', 'Message signed successfully!');
      addLog('info', `Signature: ${result.signature.slice(0, 20)}...`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signing failed';
      addLog('error', 'Message signing failed', message);
    } finally {
      setIsSigning(false);
    }
  };

  // Step 3: Send Gasless Transaction
  const handleSendTransaction = async () => {
    if (!isConnected || !smartWalletPubkey) {
      addLog('error', 'Please connect wallet first');
      return;
    }

    setIsSending(true);
    try {
      addLog('pending', 'Building transaction...');

      // Send tiny amount to self (demo purposes)
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: smartWalletPubkey, // Send to self for demo
        lamports: 100, // 0.0000001 SOL - minimal amount
      });

      addLog('info', 'Sending 100 lamports to self (demo)');
      addLog('info', 'Gas fees sponsored by Paymaster ⛽');
      addLog('pending', 'Awaiting passkey signature...');

      const signature = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          feeToken: 'USDC',
          computeUnitLimit: 200_000,
          clusterSimulation: 'devnet',
        },
      });

      setLastSignature(signature);
      addLog('success', 'Transaction confirmed! 🎉');
      addLog('info', `Signature: ${signature.slice(0, 20)}...`, signature);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction failed';
      addLog('error', 'Transaction failed', message);
    } finally {
      setIsSending(false);
    }
  };

  // Copy address
  const copyAddress = async () => {
    if (wallet?.smartWallet) {
      await navigator.clipboard.writeText(wallet.smartWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="playground" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Interactive Playground</h2>
          <p className="text-zinc-400">
            Try each step below. Watch the log panel to see what happens.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Actions */}
          <div className="space-y-6">
            {/* Step 1: Connect */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'
                }`}>
                  {isConnected ? <CheckCircle2 className="h-5 w-5" /> : '1'}
                </div>
                <h3 className="text-lg font-semibold">Connect with Passkey</h3>
              </div>

              <p className="text-sm text-zinc-400 mb-4">
                Create or access your smart wallet using Face ID, Touch ID, or Windows Hello.
                No seed phrase needed.
              </p>

              {isConnected && wallet ? (
                <div className="space-y-3">
                  {/* Wallet Info */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-zinc-400">Connected:</span>
                    <code className="text-sm font-mono text-emerald-400 flex-1 truncate">
                      {wallet.smartWallet}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-zinc-500" />
                      )}
                    </button>
                    <a
                      href={`https://explorer.solana.com/address/${wallet.smartWallet}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-zinc-500" />
                    </a>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="w-full py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all text-sm font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isConnecting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Fingerprint className="h-5 w-5" />
                  )}
                  {isConnecting ? 'Connecting...' : 'Connect with Passkey'}
                </button>
              )}
            </div>

            {/* Step 2: Sign Message */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  !isConnected ? 'bg-zinc-700 text-zinc-500' : 'bg-cyan-500/20 text-cyan-400'
                }`}>
                  2
                </div>
                <h3 className="text-lg font-semibold">Sign a Message</h3>
              </div>

              <p className="text-sm text-zinc-400 mb-4">
                Cryptographically sign a message with your passkey.
                Useful for authentication and verification.
              </p>

              <button
                onClick={handleSignMessage}
                disabled={!isConnected || isSigning}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigning ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FileSignature className="h-5 w-5" />
                )}
                {isSigning ? 'Signing...' : 'Sign Message'}
              </button>
            </div>

            {/* Step 3: Send Transaction */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  !isConnected ? 'bg-zinc-700 text-zinc-500' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  3
                </div>
                <h3 className="text-lg font-semibold">Send Gasless Transaction</h3>
              </div>

              <p className="text-sm text-zinc-400 mb-4">
                Send a transaction without paying gas fees. The Paymaster sponsors the costs.
                This sends a tiny amount to yourself as a demo.
              </p>

              <button
                onClick={handleSendTransaction}
                disabled={!isConnected || isSending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {isSending ? 'Sending...' : 'Send Gasless Transaction'}
              </button>

              {lastSignature && (
                <a
                  href={`https://explorer.solana.com/tx/${lastSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  View on Solana Explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Right Panel - Log Output */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
            {/* Log Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-400">Activity Log</span>
              </div>
              <button
                onClick={clearLogs}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Log Content */}
            <div className="h-[500px] overflow-y-auto p-4 font-mono text-sm space-y-2">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                  <Terminal className="h-8 w-8 mb-2" />
                  <p>Waiting for actions...</p>
                  <p className="text-xs mt-1">Connect your wallet to get started</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2 p-2 rounded-lg ${
                      log.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : log.type === 'error'
                          ? 'bg-red-500/10 border border-red-500/20'
                          : log.type === 'pending'
                            ? 'bg-yellow-500/10 border border-yellow-500/20'
                            : 'bg-zinc-800/50 border border-zinc-700/50'
                    }`}
                  >
                    <span className="shrink-0 mt-0.5">
                      {log.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      {log.type === 'error' && <XCircle className="h-4 w-4 text-red-400" />}
                      {log.type === 'pending' && <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />}
                      {log.type === 'info' && <Clock className="h-4 w-4 text-zinc-500" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`${
                        log.type === 'success'
                          ? 'text-emerald-300'
                          : log.type === 'error'
                            ? 'text-red-300'
                            : log.type === 'pending'
                              ? 'text-yellow-300'
                              : 'text-zinc-400'
                      }`}>
                        {log.message}
                      </p>
                      {log.details && (
                        <p className="text-xs text-zinc-600 mt-1 truncate">{log.details}</p>
                      )}
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
