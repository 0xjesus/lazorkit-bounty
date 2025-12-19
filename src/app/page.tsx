"use client";

import { LazorkitProvider, useWallet } from "@lazorkit/wallet";
import { Connection, SystemProgram, LAMPORTS_PER_SOL, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { useEffect, useState, useCallback } from "react";
import * as anchor from '@coral-xyz/anchor';
import {
  Fingerprint,
  Send,
  LogOut,
  Loader2,
  CheckCircle2,
  ExternalLink,
  FileSignature,
  Copy,
  Check,
  Terminal,
  Clock,
  XCircle,
  Zap,
  Shield,
  Wallet
} from 'lucide-react';

const connection = new Connection("https://api.devnet.solana.com");

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'pending';
  message: string;
  details?: string;
}

function WalletDemo() {
  const [balance, setBalance] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);

  const {
    smartWalletPubkey,
    isConnected,
    isConnecting,
    isSigning: walletSigning,
    error: walletError,
    connect,
    disconnect,
    signTransaction,
    signAndSendTransaction
  } = useWallet();

  // Add log entry
  const addLog = useCallback((type: LogEntry['type'], message: string, details?: string) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
      details,
    };
    setLogs((prev) => [entry, ...prev].slice(0, 20));
  }, []);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
    setLastSignature(null);
  }, []);

  // Copy address
  const copyAddress = async () => {
    if (smartWalletPubkey) {
      await navigator.clipboard.writeText(smartWalletPubkey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Connect handler
  const handleConnect = async () => {
    addLog('pending', 'Initiating passkey authentication...');
    addLog('info', 'Opening LazorKit portal for WebAuthn');

    try {
      await connect();
      addLog('success', 'Wallet connected successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      addLog('error', 'Connection failed', message);
    }
  };

  // Disconnect handler
  const handleDisconnect = async () => {
    try {
      await disconnect();
      addLog('info', 'Wallet disconnected');
      setLastSignature(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Disconnect failed';
      addLog('error', 'Disconnect failed', message);
    }
  };

  // Get balance
  useEffect(() => {
    if (smartWalletPubkey) {
      const getBalance = async () => {
        try {
          const bal = await connection.getBalance(smartWalletPubkey);
          setBalance(bal);
        } catch (err) {
          console.error('Failed to get balance:', err);
        }
      };
      getBalance();
    }
  }, [smartWalletPubkey]);

  // Sign message handler
  const handleSignMessage = async () => {
    if (!smartWalletPubkey || !signTransaction) {
      addLog('error', 'Please connect wallet first');
      return;
    }

    setIsSigning(true);
    try {
      addLog('pending', 'Requesting message signature...');
      addLog('info', 'Message: "Hello from LazorKit Playground!"');

      // Create a memo instruction with the message
      const instruction = new anchor.web3.TransactionInstruction({
        keys: [],
        programId: new anchor.web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        data: Buffer.from('Hello from LazorKit Playground!', 'utf-8'),
      });

      const signedTx = await signTransaction(instruction);

      addLog('success', 'Message signed successfully!');
      addLog('info', 'Transaction signed and ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signing failed';
      addLog('error', 'Message signing failed', message);
    } finally {
      setIsSigning(false);
    }
  };

  // Send transaction handler
  const handleSendTransaction = async () => {
    if (!smartWalletPubkey || !signAndSendTransaction) {
      addLog('error', 'Please connect wallet first');
      return;
    }

    setIsSending(true);
    try {
      addLog('pending', 'Building transaction...');
      addLog('info', 'Sending 100 lamports to self (demo)');
      addLog('info', 'Gas fees sponsored by Paymaster');
      addLog('pending', 'Awaiting passkey signature...');

      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: smartWalletPubkey,
        lamports: 100,
      });

      const txSignature = await signAndSendTransaction(instruction);

      setLastSignature(txSignature);
      addLog('success', 'Transaction confirmed!');
      addLog('info', `Signature: ${txSignature.slice(0, 20)}...`, txSignature);

      // Refresh balance
      const newBalance = await connection.getBalance(smartWalletPubkey);
      setBalance(newBalance);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      addLog('error', 'Transaction failed', message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">LazorKit</span>
            <span className="text-xs text-zinc-500 ml-2">Developer Playground</span>
          </div>

          {isConnected && smartWalletPubkey && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-mono text-zinc-300">
                  {smartWalletPubkey.toString().slice(0, 4)}...{smartWalletPubkey.toString().slice(-4)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-zinc-700 rounded-md transition-colors"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                  )}
                </button>
              </div>
              <button
                onClick={handleDisconnect}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 text-zinc-400" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            LazorKit Developer Playground
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Experience passkey authentication and gasless transactions on Solana.
            No seed phrases. No gas fees. Just seamless Web3.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
              <Fingerprint className="h-6 w-6 text-violet-400" />
            </div>
            <h3 className="font-semibold mb-2">Passkey Authentication</h3>
            <p className="text-sm text-zinc-400">
              Use Face ID, Touch ID, or Windows Hello. No seed phrases to remember.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold mb-2">Gasless Transactions</h3>
            <p className="text-sm text-zinc-400">
              Paymaster sponsors all gas fees. Users never need SOL for transactions.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold mb-2">Smart Wallets</h3>
            <p className="text-sm text-zinc-400">
              PDA-based smart wallets with programmable rules and recovery options.
            </p>
          </div>
        </div>

        {/* Interactive Playground */}
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
              </p>

              {isConnected && smartWalletPubkey ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-zinc-400">Connected:</span>
                    <code className="text-sm font-mono text-emerald-400 flex-1 truncate">
                      {smartWalletPubkey.toString()}
                    </code>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                    <span className="text-sm text-zinc-400">Balance: </span>
                    <span className="font-bold">{(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL</span>
                  </div>
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
                Cryptographically sign a message with your passkey. Useful for authentication.
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

        {/* Footer Info */}
        <div className="text-center mt-12 text-sm text-zinc-500">
          <p>Powered by LazorKit SDK v1.4.3-beta | Solana Devnet</p>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      ipfsUrl="https://gateway.pinata.cloud"
      paymasterUrl="https://kora.devnet.lazorkit.com"
    >
      <WalletDemo />
    </LazorkitProvider>
  );
}
