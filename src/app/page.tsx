"use client";

import { LazorkitProvider, useWallet } from "@lazorkit/wallet";
import { Connection, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState, useCallback } from "react";
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
  Sparkles,
  ArrowRight,
  Github,
  BookOpen,
  Rocket,
  Lock,
  CreditCard,
  Users
} from 'lucide-react';

// Configuration
const CONFIG = {
  RPC_URL: "https://api.devnet.solana.com",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER_URL: "https://kora.devnet.lazorkit.com",
};

const connection = new Connection(CONFIG.RPC_URL);

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

  // SDK 2.0.1 API
  const {
    wallet,
    isConnecting,
    isSigning: sdkSigning,
    error: walletError,
    connect,
    disconnect,
    signAndSendTransaction,
    signMessage
  } = useWallet();

  // Derived state
  const isConnected = !!wallet?.smartWallet;
  const smartWalletAddress = wallet?.smartWallet || null;
  const smartWalletPubkey = smartWalletAddress ? new PublicKey(smartWalletAddress) : null;

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
    if (smartWalletAddress) {
      await navigator.clipboard.writeText(smartWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Connect handler - SDK 2.0.1 API
  const handleConnect = async () => {
    addLog('pending', 'Initiating passkey authentication...');
    addLog('info', 'Opening LazorKit portal for WebAuthn');

    try {
      // connect() returns WalletInfo with smartWallet address
      const result = await connect();
      console.log('Connected:', result);
      addLog('success', 'Wallet connected successfully!');
      if (result?.smartWallet) {
        addLog('info', `Smart Wallet: ${result.smartWallet.slice(0, 8)}...`);
      }
    } catch (err) {
      console.error('Connect failed:', err);
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
      setBalance(0);
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
    if (!isConnected || !signMessage) {
      addLog('error', 'Please connect wallet first');
      return;
    }

    setIsSigning(true);
    try {
      addLog('pending', 'Requesting message signature...');
      addLog('info', 'Message: "Hello from LazorKit!"');

      const result = await signMessage('Hello from LazorKit!');

      addLog('success', 'Message signed successfully!');
      addLog('info', `Signature: ${result.signature.slice(0, 20)}...`);
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
      addLog('pending', 'Building gasless transaction...');
      addLog('info', 'Paymaster sponsoring gas fees');
      addLog('pending', 'Awaiting passkey signature...');

      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: smartWalletPubkey,
        lamports: 100,
      });

      // SDK 2.0.1 API - signAndSendTransaction returns signature directly
      const txSignature = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          computeUnitLimit: 200_000,
        },
      });
      console.log('Transaction successful:', txSignature);

      setLastSignature(txSignature);
      addLog('success', 'Transaction confirmed on Solana!');
      addLog('info', `Signature: ${txSignature.slice(0, 16)}...`, txSignature);

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
    <div className="min-h-screen bg-[#030014] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-cyan-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl blur-lg opacity-50" />
              <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <span className="font-bold text-xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">LazorKit</span>
              <span className="text-xs text-zinc-500 block -mt-1">Developer Playground</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isConnected && smartWalletAddress ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 backdrop-blur-xl">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
                  <span className="text-sm font-mono text-zinc-300">
                    {smartWalletAddress.slice(0, 4)}...{smartWalletAddress.slice(-4)}
                  </span>
                  <button onClick={copyAddress} className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-500" />}
                  </button>
                  <a
                    href={`https://explorer.solana.com/address/${smartWalletAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
                  </a>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="p-2.5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                >
                  <LogOut className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            ) : (
              <a href="https://github.com/0xjesus/lazorkit-bounty" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">View Source</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 mb-8">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-violet-300">Powered by WebAuthn & Smart Wallets</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">The Future of</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Web3 Authentication</span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              No seed phrases. No gas fees. No extensions.
              <span className="text-white"> Just seamless blockchain transactions</span> with the security of your device&apos;s biometrics.
            </p>

            {!isConnected && (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative flex items-center gap-3">
                  {isConnecting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Fingerprint className="h-5 w-5" />
                  )}
                  {isConnecting ? 'Authenticating...' : 'Connect with Passkey'}
                  {!isConnecting && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                </div>
              </button>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 h-full hover:border-white/20 transition-all duration-300">
                  <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Fingerprint className="h-7 w-7 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Passkey Auth</h3>
                  <p className="text-zinc-400 leading-relaxed">Face ID, Touch ID, Windows Hello. Your device is your wallet.</p>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 h-full hover:border-white/20 transition-all duration-300">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-7 w-7 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Gasless Transactions</h3>
                  <p className="text-zinc-400 leading-relaxed">Paymaster sponsors all fees. Users never touch SOL for gas.</p>
                </div>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 h-full hover:border-white/20 transition-all duration-300">
                  <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-7 w-7 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Smart Wallets</h3>
                  <p className="text-zinc-400 leading-relaxed">PDA-based wallets with programmable rules and social recovery.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Playground */}
        {isConnected && (
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Interactive Playground</h2>
                <p className="text-zinc-400">Test LazorKit&apos;s capabilities in real-time</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Actions Panel */}
                <div className="space-y-4">
                  {/* Wallet Info Card */}
                  <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-zinc-500">Smart Wallet</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-emerald-400">Connected</span>
                      </div>
                    </div>
                    <code className="text-sm font-mono text-violet-400 break-all block mb-4">
                      {smartWalletAddress}
                    </code>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-sm text-zinc-500">Balance</span>
                      <span className="text-2xl font-bold">{(balance / LAMPORTS_PER_SOL).toFixed(4)} <span className="text-sm text-zinc-500">SOL</span></span>
                    </div>
                  </div>

                  {/* Sign Message */}
                  <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <FileSignature className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Sign Message</h3>
                        <p className="text-xs text-zinc-500">Cryptographic proof of ownership</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignMessage}
                      disabled={isSigning || sdkSigning}
                      className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium hover:bg-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSigning || sdkSigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
                      {isSigning || sdkSigning ? 'Signing...' : 'Sign Message'}
                    </button>
                  </div>

                  {/* Send Transaction */}
                  <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Send className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Gasless Transaction</h3>
                        <p className="text-xs text-zinc-500">Zero gas fees - Paymaster sponsored</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSendTransaction}
                      disabled={isSending || sdkSigning}
                      className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSending || sdkSigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {isSending || sdkSigning ? 'Sending...' : 'Send Transaction'}
                    </button>
                    {lastSignature && (
                      <a
                        href={`https://explorer.solana.com/tx/${lastSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-400/80 hover:text-emerald-400"
                      >
                        View on Explorer <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Activity Log */}
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm font-medium text-zinc-400">Activity Log</span>
                    </div>
                    <button onClick={clearLogs} className="text-xs text-zinc-500 hover:text-white transition-colors">
                      Clear
                    </button>
                  </div>
                  <div className="h-[400px] overflow-y-auto p-4 space-y-2">
                    {logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                        <Terminal className="h-8 w-8 mb-2" />
                        <p>Waiting for actions...</p>
                      </div>
                    ) : (
                      logs.map((log) => (
                        <div
                          key={log.id}
                          className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                            log.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                            log.type === 'error' ? 'bg-red-500/10 border border-red-500/20' :
                            log.type === 'pending' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                            'bg-white/5 border border-white/10'
                          }`}
                        >
                          <span className="shrink-0 mt-0.5">
                            {log.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                            {log.type === 'error' && <XCircle className="h-4 w-4 text-red-400" />}
                            {log.type === 'pending' && <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />}
                            {log.type === 'info' && <Clock className="h-4 w-4 text-zinc-500" />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={
                              log.type === 'success' ? 'text-emerald-300' :
                              log.type === 'error' ? 'text-red-300' :
                              log.type === 'pending' ? 'text-yellow-300' : 'text-zinc-400'
                            }>{log.message}</p>
                            {log.details && <p className="text-xs text-zinc-600 mt-1 truncate">{log.details}</p>}
                          </div>
                          <span className="text-xs text-zinc-600 shrink-0">{log.timestamp.toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Use Cases */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Built for Modern dApps</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">LazorKit enables seamless Web3 experiences across industries</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all cursor-default">
                <CreditCard className="h-6 w-6 text-violet-400 mb-3" />
                <h4 className="font-semibold mb-1">Payments</h4>
                <p className="text-sm text-zinc-500">One-click checkout</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all cursor-default">
                <Users className="h-6 w-6 text-violet-400 mb-3" />
                <h4 className="font-semibold mb-1">Social</h4>
                <p className="text-sm text-zinc-500">Passwordless auth</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all cursor-default">
                <Rocket className="h-6 w-6 text-violet-400 mb-3" />
                <h4 className="font-semibold mb-1">Gaming</h4>
                <p className="text-sm text-zinc-500">Instant onboarding</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all cursor-default">
                <Lock className="h-6 w-6 text-violet-400 mb-3" />
                <h4 className="font-semibold mb-1">DeFi</h4>
                <p className="text-sm text-zinc-500">Secure transactions</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-violet-400" />
              <span className="font-semibold">LazorKit</span>
              <span className="text-zinc-600">|</span>
              <span className="text-sm text-zinc-500">SDK v2.0.1</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://docs.lazorkit.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <BookOpen className="h-4 w-4" /> Docs
              </a>
              <a href="https://github.com/lazor-kit/lazor-kit" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <Github className="h-4 w-4" /> GitHub
              </a>
            </div>
          </div>
        </footer>
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
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
          <span className="text-zinc-400">Loading LazorKit...</span>
        </div>
      </div>
    );
  }

  // SDK 2.0.1 Provider configuration
  return (
    <LazorkitProvider
      rpcUrl={CONFIG.RPC_URL}
      portalUrl={CONFIG.PORTAL_URL}
      paymasterConfig={{
        paymasterUrl: CONFIG.PAYMASTER_URL,
      }}
    >
      <WalletDemo />
    </LazorkitProvider>
  );
}
