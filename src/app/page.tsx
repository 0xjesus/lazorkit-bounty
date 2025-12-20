/**
 * LazorKit Developer Playground
 *
 * A comprehensive demo showcasing LazorKit SDK v2.0.1 integration:
 * - Passkey (WebAuthn) authentication
 * - Gasless transactions via Paymaster
 * - Subscription payments with USDC
 *
 * Built for the LazorKit Bounty - December 2025
 * @see https://docs.lazorkit.com
 */

"use client";

import { LazorkitProvider, useWallet } from "@lazorkit/wallet";
import { Connection, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState, useCallback } from "react";
import {
  Fingerprint, Send, LogOut, Loader2, CheckCircle2, ExternalLink,
  FileSignature, Copy, Check, Terminal, Clock, XCircle, Zap, Shield,
  Sparkles, ArrowRight, Github, BookOpen, Rocket, Lock, CreditCard,
  Users, Code, ChevronDown, ChevronUp, Coins, Package
} from 'lucide-react';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",
  PORTAL_URL: process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.lazor.sh",
  PAYMASTER_URL: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://kora.devnet.lazorkit.com",
};

const connection = new Connection(CONFIG.RPC_URL);

// =============================================================================
// SUBSCRIPTION PLANS (Suggested Bounty Example)
// =============================================================================

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0.001,
    priceDisplay: '$0.001',
    features: ['100 API calls', 'Basic support', '1 project'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 0.005,
    priceDisplay: '$0.005',
    features: ['10,000 API calls', 'Priority support', 'Unlimited projects'],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0.01,
    priceDisplay: '$0.01',
    features: ['Unlimited calls', 'Dedicated support', 'Custom SLA'],
  },
];

// =============================================================================
// CODE SNIPPETS FOR COPY FUNCTIONALITY
// =============================================================================

const CODE_SNIPPETS = {
  provider: `import { LazorkitProvider } from '@lazorkit/wallet';

<LazorkitProvider
  rpcUrl="https://api.devnet.solana.com"
  portalUrl="https://portal.lazor.sh"
  paymasterConfig={{ paymasterUrl: "https://kora.devnet.lazorkit.com" }}
>
  {children}
</LazorkitProvider>`,

  connect: `import { useWallet } from '@lazorkit/wallet';

const { connect, wallet, isConnecting } = useWallet();

// Connect with passkey
const handleConnect = async () => {
  const result = await connect();
  console.log('Connected:', result.smartWallet);
};`,

  signMessage: `const { signMessage } = useWallet();

const handleSign = async () => {
  const result = await signMessage('Hello from LazorKit!');
  console.log('Signature:', result.signature);
};`,

  sendTransaction: `import { SystemProgram, PublicKey } from '@solana/web3.js';

const { signAndSendTransaction, wallet } = useWallet();

const handleSend = async () => {
  const smartWallet = new PublicKey(wallet.smartWallet);

  const instruction = SystemProgram.transfer({
    fromPubkey: smartWallet,
    toPubkey: smartWallet, // self-transfer for demo
    lamports: 100,
  });

  // Paymaster pays gas - user just signs with passkey!
  const signature = await signAndSendTransaction({
    instructions: [instruction],
  });

  console.log('TX:', signature);
};`,
};

// =============================================================================
// TYPES
// =============================================================================

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'pending';
  message: string;
  details?: string;
}

// =============================================================================
// COPY CODE COMPONENT
// =============================================================================

function CopyCodeButton({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Code className="h-3 w-3 text-zinc-400" />
          <span className="text-zinc-400">{label}</span>
        </>
      )}
    </button>
  );
}

// =============================================================================
// STEP INDICATOR COMPONENT
// =============================================================================

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Connect', icon: Fingerprint },
    { num: 2, label: 'Sign', icon: FileSignature },
    { num: 3, label: 'Send', icon: Send },
    { num: 4, label: 'Subscribe', icon: CreditCard },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all
            ${currentStep >= step.num
              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
              : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'}
          `}>
            <step.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <ArrowRight className={`h-4 w-4 mx-2 ${currentStep > step.num ? 'text-violet-400' : 'text-zinc-600'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// AIRDROP BUTTON
// =============================================================================

function AirdropButton({ address }: { address: string | null }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAirdrop = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const sig = await connection.requestAirdrop(new PublicKey(address), LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Airdrop failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!address) return null;

  return (
    <button
      onClick={handleAirdrop}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : success ? (
        <Check className="h-3 w-3" />
      ) : (
        <Coins className="h-3 w-3" />
      )}
      {loading ? 'Airdropping...' : success ? '+1 SOL!' : 'Airdrop 1 SOL'}
    </button>
  );
}

// =============================================================================
// MAIN DEMO COMPONENT
// =============================================================================

function WalletDemo() {
  // State
  const [balance, setBalance] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // LazorKit SDK v2.0.1
  const {
    wallet,
    isConnecting,
    isSigning: sdkSigning,
    connect,
    disconnect,
    signAndSendTransaction,
    signMessage
  } = useWallet();

  // Derived state
  const isConnected = !!wallet?.smartWallet;
  const smartWalletAddress = wallet?.smartWallet || null;
  const smartWalletPubkey = smartWalletAddress ? new PublicKey(smartWalletAddress) : null;

  // Update step based on state
  useEffect(() => {
    if (isConnected) setCurrentStep(1);
    else setCurrentStep(0);
  }, [isConnected]);

  // Logging helper
  const addLog = useCallback((type: LogEntry['type'], message: string, details?: string) => {
    setLogs((prev) => [{
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type, message, details,
    }, ...prev].slice(0, 20));
  }, []);

  // Copy address
  const copyAddress = async () => {
    if (smartWalletAddress) {
      await navigator.clipboard.writeText(smartWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fetch balance
  useEffect(() => {
    if (smartWalletPubkey) {
      connection.getBalance(smartWalletPubkey).then(setBalance).catch(console.error);
    }
  }, [smartWalletPubkey, lastSignature]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleConnect = async () => {
    addLog('pending', 'Initiating passkey authentication...');
    try {
      const result = await connect();
      addLog('success', 'Connected successfully!');
      if (result?.smartWallet) {
        addLog('info', `Wallet: ${result.smartWallet.slice(0, 8)}...`);
      }
      setCurrentStep(1);
    } catch (err) {
      addLog('error', 'Connection failed', (err as Error).message);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    addLog('info', 'Wallet disconnected');
    setCurrentStep(0);
    setLastSignature(null);
    setBalance(0);
  };

  const handleSignMessage = async () => {
    if (!isConnected || !signMessage) return;
    setIsSigning(true);
    addLog('pending', 'Requesting signature...');
    try {
      const result = await signMessage('Hello from LazorKit!');
      addLog('success', 'Message signed!');
      addLog('info', `Signature: ${result.signature.slice(0, 20)}...`);
      setCurrentStep(2);
    } catch (err) {
      addLog('error', 'Signing failed', (err as Error).message);
    } finally {
      setIsSigning(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!smartWalletPubkey || !signAndSendTransaction) return;
    setIsSending(true);
    addLog('pending', 'Building gasless transaction...');
    try {
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: smartWalletPubkey,
        lamports: 100,
      });
      const sig = await signAndSendTransaction({ instructions: [instruction] });
      setLastSignature(sig);
      addLog('success', 'Transaction confirmed!');
      addLog('info', `Signature: ${sig.slice(0, 16)}...`, sig);
      setCurrentStep(3);
    } catch (err) {
      addLog('error', 'Transaction failed', (err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!smartWalletPubkey || !signAndSendTransaction) return;
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    setSelectedPlan(planId);
    setIsSubscribing(true);
    addLog('pending', `Processing ${plan.name} subscription...`);

    try {
      const lamports = Math.floor(plan.price * LAMPORTS_PER_SOL);
      const instruction = SystemProgram.transfer({
        fromPubkey: smartWalletPubkey,
        toPubkey: smartWalletPubkey, // In production: your treasury
        lamports: lamports,
      });
      const sig = await signAndSendTransaction({ instructions: [instruction] });
      setLastSignature(sig);
      addLog('success', `Subscribed to ${plan.name}!`);
      addLog('info', `TX: ${sig.slice(0, 16)}...`, sig);
      setCurrentStep(4);
    } catch (err) {
      addLog('error', 'Subscription failed', (err as Error).message);
    } finally {
      setIsSubscribing(false);
      setSelectedPlan(null);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-cyan-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-2xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">LazorKit</span>
              <span className="text-xs text-zinc-500 block -mt-1">Playground</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isConnected && smartWalletAddress ? (
              <>
                <AirdropButton address={smartWalletAddress} />
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-mono text-zinc-300">
                    {smartWalletAddress.slice(0, 4)}...{smartWalletAddress.slice(-4)}
                  </span>
                  <button onClick={copyAddress} className="p-1 hover:bg-white/10 rounded">
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-500" />}
                  </button>
                </div>
                <button onClick={handleDisconnect} className="p-2 hover:bg-white/10 rounded-lg border border-white/10">
                  <LogOut className="h-4 w-4 text-zinc-400" />
                </button>
              </>
            ) : (
              <a href="https://github.com/0xjesus/lazorkit-bounty" target="_blank" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">Source</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <section className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-sm text-violet-300">WebAuthn + Smart Wallets + Gasless TX</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold mb-4">
            <span className="text-white">The Future of</span><br/>
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Web3 Authentication</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            No seed phrases. No gas fees. No extensions.
            <span className="text-white"> Just seamless blockchain transactions.</span>
          </p>

          {!isConnected && (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Fingerprint className="h-5 w-5" />}
              {isConnecting ? 'Authenticating...' : 'Connect with Passkey'}
              {!isConnecting && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          )}
        </section>

        {/* Step Indicator - Shows when connected */}
        {isConnected && <StepIndicator currentStep={currentStep} />}

        {/* Interactive Demo Grid */}
        {isConnected && (
          <section className="grid lg:grid-cols-3 gap-6 mb-16">
            {/* Wallet Card */}
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-zinc-500">Smart Wallet</span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Connected
                  </span>
                </div>
                <code className="text-xs font-mono text-violet-400 break-all block mb-3">
                  {smartWalletAddress}
                </code>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-sm text-zinc-500">Balance</span>
                  <span className="text-xl font-bold">{(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL</span>
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileSignature className="h-4 w-4 text-cyan-400" /> Sign Message
                </h3>
                <button
                  onClick={handleSignMessage}
                  disabled={isSigning || sdkSigning}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium hover:bg-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
                  {isSigning ? 'Signing...' : 'Sign Message'}
                </button>
                <div className="mt-3">
                  <CopyCodeButton code={CODE_SNIPPETS.signMessage} label="Copy Code" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Send className="h-4 w-4 text-emerald-400" /> Gasless Transaction
                </h3>
                <button
                  onClick={handleSendTransaction}
                  disabled={isSending || sdkSigning}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSending ? 'Sending...' : 'Send Transaction'}
                </button>
                {lastSignature && (
                  <a href={`https://explorer.solana.com/tx/${lastSignature}?cluster=devnet`} target="_blank" className="mt-2 flex items-center justify-center gap-1 text-xs text-emerald-400/80 hover:text-emerald-400">
                    View on Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <div className="mt-3">
                  <CopyCodeButton code={CODE_SNIPPETS.sendTransaction} label="Copy Code" />
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-400">Activity Log</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setLogs([])} className="text-xs text-zinc-500 hover:text-white">Clear</button>
                  <button onClick={() => setShowLog(!showLog)} className="p-1 hover:bg-white/10 rounded">
                    {showLog ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                  </button>
                </div>
              </div>
              {showLog && (
                <div className="h-[300px] overflow-y-auto p-4 space-y-2">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                      <Terminal className="h-8 w-8 mb-2" />
                      <p>Waiting for actions...</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                        log.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                        log.type === 'error' ? 'bg-red-500/10 border border-red-500/20' :
                        log.type === 'pending' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                        'bg-white/5 border border-white/10'
                      }`}>
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
                        <span className="text-xs text-zinc-600">{log.timestamp.toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Subscription Section - THE DIFFERENTIATOR */}
        {isConnected && (
          <section className="py-12 border-t border-white/5">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                <Package className="h-4 w-4 text-amber-400" />
                <span className="text-xs text-amber-300">Subscription Demo</span>
              </div>
              <h2 className="text-3xl font-bold mb-3">Subscribe with Gasless Payments</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">
                Real-world use case: Pay for subscriptions using your passkey wallet.
                All gas fees are sponsored by the Paymaster.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {PLANS.map((plan) => (
                <div key={plan.id} className={`rounded-2xl border p-6 transition-all ${
                  plan.highlighted
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-4">
                    {plan.priceDisplay}
                    <span className="text-sm text-zinc-500 font-normal">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                        <Check className="h-4 w-4 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isSubscribing}
                    className={`w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      plan.highlighted
                        ? 'bg-violet-600 hover:bg-violet-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    } disabled:opacity-50`}
                  >
                    {isSubscribing && selectedPlan === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    {isSubscribing && selectedPlan === plan.id ? 'Processing...' : `Subscribe ${plan.priceDisplay}`}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Features Grid */}
        <section className="py-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: Fingerprint, title: 'Passkey Auth', desc: 'Face ID, Touch ID, Windows Hello', color: 'violet' },
            { icon: Zap, title: 'Gasless TX', desc: 'Paymaster sponsors all fees', color: 'emerald' },
            { icon: Shield, title: 'Smart Wallets', desc: 'PDA-based with recovery', color: 'cyan' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-all">
              <div className={`h-12 w-12 rounded-xl bg-${f.color}-500/10 flex items-center justify-center mb-4`}>
                <f.icon className={`h-6 w-6 text-${f.color}-400`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Code Snippets Section */}
        <section className="py-12 border-t border-white/5">
          <h2 className="text-2xl font-bold mb-6 text-center">Quick Integration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-400">1. Setup Provider</span>
                <CopyCodeButton code={CODE_SNIPPETS.provider} label="Copy" />
              </div>
              <pre className="text-xs text-zinc-500 overflow-x-auto"><code>{CODE_SNIPPETS.provider}</code></pre>
            </div>
            <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-400">2. Connect Wallet</span>
                <CopyCodeButton code={CODE_SNIPPETS.connect} label="Copy" />
              </div>
              <pre className="text-xs text-zinc-500 overflow-x-auto"><code>{CODE_SNIPPETS.connect}</code></pre>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-violet-400" />
            <span className="font-semibold">LazorKit</span>
            <span className="text-zinc-600">|</span>
            <span className="text-sm text-zinc-500">SDK v2.0.1</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://docs.lazorkit.com" target="_blank" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <BookOpen className="h-4 w-4" /> Docs
            </a>
            <a href="https://github.com/lazor-kit/lazor-kit" target="_blank" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <Github className="h-4 w-4" /> GitHub
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

// =============================================================================
// ROOT COMPONENT
// =============================================================================

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <LazorkitProvider
      rpcUrl={CONFIG.RPC_URL}
      portalUrl={CONFIG.PORTAL_URL}
      paymasterConfig={{ paymasterUrl: CONFIG.PAYMASTER_URL }}
    >
      <WalletDemo />
    </LazorkitProvider>
  );
}
