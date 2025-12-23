/**
 * LazorKit Developer Playground
 *
 * Complete demo showing ALL features upfront:
 * - Passkey authentication with Face ID / Touch ID
 * - Gasless transactions via Paymaster
 * - Subscription payments
 * - Copy-paste code snippets
 *
 * Built for the LazorKit Bounty - December 2025
 */

"use client";

// =============================================================================
// VERSION CHECK - This should appear FIRST in console
// =============================================================================
const BUILD_VERSION = "v1.5.0-" + Date.now();
console.log('%c╔══════════════════════════════════════════════════════════════╗', 'color: #22c55e; font-weight: bold; font-size: 14px');
console.log('%c║  🚀 LAZORKIT PLAYGROUND LOADED                               ║', 'color: #22c55e; font-weight: bold; font-size: 14px');
console.log('%c║  Build: ' + BUILD_VERSION.padEnd(52) + '║', 'color: #22c55e; font-weight: bold; font-size: 14px');
console.log('%c║  Time: ' + new Date().toISOString().padEnd(53) + '║', 'color: #22c55e; font-weight: bold; font-size: 14px');
console.log('%c╚══════════════════════════════════════════════════════════════╝', 'color: #22c55e; font-weight: bold; font-size: 14px');

import { LazorkitProvider, useWallet } from "@lazorkit/wallet";
import { Connection, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Fingerprint, Send, LogOut, Loader2, CheckCircle2, ExternalLink,
  FileSignature, Copy, Check, Terminal, Clock, XCircle, Zap, Shield,
  Sparkles, ArrowRight, Github, BookOpen, CreditCard, Coins,
  ChevronDown, ChevronUp, Wallet, Play, Trash2
} from 'lucide-react';

// =============================================================================
// CONFIGURATION
// =============================================================================

// HARDCODED - ignoring env variables to avoid misconfiguration
const CONFIG = {
  RPC_URL: "https://api.devnet.solana.com",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER_URL: "https://kora.devnet.lazorkit.com",
};

// =============================================================================
// DEBUG LOGGING
// =============================================================================
console.log('========================================');
console.log('🚀 LAZORKIT CONFIG (HARDCODED)');
console.log('========================================');
console.log('RPC_URL:', CONFIG.RPC_URL);
console.log('PORTAL_URL:', CONFIG.PORTAL_URL);
console.log('PAYMASTER_URL:', CONFIG.PAYMASTER_URL);
console.log('========================================');

const connection = new Connection(CONFIG.RPC_URL);
console.log('✅ Solana Connection created with RPC:', CONFIG.RPC_URL);

// =============================================================================
// SUBSCRIPTION PLANS
// =============================================================================

const PLANS = [
  { id: 'starter', name: 'Starter', price: 0.001, priceDisplay: '$0.001', features: ['100 API calls', 'Basic support', '1 project'] },
  { id: 'pro', name: 'Pro', price: 0.005, priceDisplay: '$0.005', features: ['10K API calls', 'Priority support', 'Unlimited projects'], highlighted: true },
  { id: 'enterprise', name: 'Enterprise', price: 0.01, priceDisplay: '$0.01', features: ['Unlimited calls', 'Dedicated support', 'Custom SLA'] },
];

// =============================================================================
// CODE SNIPPETS
// =============================================================================

const CODE_SNIPPETS = {
  provider: `// 1. Wrap your app with LazorkitProvider
import { LazorkitProvider } from '@lazorkit/wallet';

<LazorkitProvider
  rpcUrl="https://api.devnet.solana.com"
  portalUrl="https://portal.lazor.sh"
  paymasterConfig={{
    paymasterUrl: "https://kora.devnet.lazorkit.com"
  }}
>
  <App />
</LazorkitProvider>`,

  connect: `// 2. Connect with passkey
import { useWallet } from '@lazorkit/wallet';

const { connect, wallet, isConnecting } = useWallet();

const handleConnect = async () => {
  const result = await connect();
  console.log('Smart Wallet:', result.smartWallet);
};`,

  transaction: `// 3. Send gasless transaction
const { signAndSendTransaction, wallet } = useWallet();

const instruction = SystemProgram.transfer({
  fromPubkey: new PublicKey(wallet.smartWallet),
  toPubkey: recipientAddress,
  lamports: 1000000, // 0.001 SOL
});

// Paymaster pays gas - user just signs!
const sig = await signAndSendTransaction({
  instructions: [instruction],
});`,
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
// COPY BUTTON COMPONENT
// =============================================================================

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-400" />}
      <span className={copied ? "text-emerald-400" : "text-zinc-400"}>{copied ? "Copied!" : label}</span>
    </button>
  );
}

// =============================================================================
// MAIN DEMO COMPONENT
// =============================================================================

// =============================================================================
// LOCALSTORAGE HELPERS
// =============================================================================
const STORAGE_KEYS = {
  LOGS: 'lazorkit_logs',
  TRANSACTIONS: 'lazorkit_transactions',
  LAST_WALLET: 'lazorkit_last_wallet',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

interface StoredTransaction {
  signature: string;
  type: 'transfer' | 'subscription' | 'airdrop';
  timestamp: string;
  status: 'success' | 'failed';
  details?: string;
}

function WalletDemo() {
  const [balance, setBalance] = useState(0);
  // Filter out any pending logs on load - they should never persist
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const loaded = loadFromStorage<LogEntry[]>(STORAGE_KEYS.LOGS, []);
    const filtered = loaded.filter(log => log.type !== 'pending');
    console.log('%c📂 LOADED LOGS FROM STORAGE:', 'color: #f59e0b; font-weight: bold');
    console.log('   Raw count:', loaded.length);
    console.log('   After filtering pending:', filtered.length);
    console.log('   Types:', filtered.map(l => l.type));
    return filtered;
  });
  const [transactions, setTransactions] = useState<StoredTransaction[]>(() => loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []));
  const [isSigning, setIsSigning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Refs to prevent double-clicks and race conditions
  const isSigningRef = useRef(false);
  const isSendingRef = useRef(false);
  const isSubscribingRef = useRef(false);
  const isAirdropRef = useRef(false);

  const { wallet, isConnecting, isSigning: sdkSigning, connect, disconnect, signAndSendTransaction, signMessage } = useWallet();

  const isConnected = !!wallet?.smartWallet;
  const smartWalletAddress = wallet?.smartWallet || null;
  const smartWalletPubkey = smartWalletAddress ? new PublicKey(smartWalletAddress) : null;

  // =============================================================================
  // COMPREHENSIVE UI STATE LOGGING
  // =============================================================================
  useEffect(() => {
    console.log('%c═══════════════════════════════════════════════════════════════', 'color: #8b5cf6; font-weight: bold');
    console.log('%c🎨 UI STATE UPDATE', 'color: #8b5cf6; font-size: 16px; font-weight: bold');
    console.log('%c═══════════════════════════════════════════════════════════════', 'color: #8b5cf6; font-weight: bold');

    console.log('%c📊 WALLET STATE:', 'color: #22c55e; font-weight: bold');
    console.log('   isConnected:', isConnected);
    console.log('   smartWalletAddress:', smartWalletAddress || '(not connected)');
    console.log('   balance:', balance, 'lamports (', (balance / LAMPORTS_PER_SOL).toFixed(4), 'SOL)');

    console.log('%c🔄 SDK STATE:', 'color: #3b82f6; font-weight: bold');
    console.log('   isConnecting:', isConnecting);
    console.log('   sdkSigning:', sdkSigning);

    console.log('%c🖱️ BUTTON STATES:', 'color: #f59e0b; font-weight: bold');
    console.log('   isSigning:', isSigning, '| ref:', isSigningRef.current);
    console.log('   isSending:', isSending, '| ref:', isSendingRef.current);
    console.log('   isAirdropping:', isAirdropping, '| ref:', isAirdropRef.current);
    console.log('   isSubscribing:', isSubscribing, '| ref:', isSubscribingRef.current);
    console.log('   selectedPlan:', selectedPlan);

    console.log('%c🔘 BUTTON ENABLED/DISABLED:', 'color: #ec4899; font-weight: bold');
    console.log('   Connect btn disabled:', isConnecting);
    console.log('   Airdrop btn disabled:', !isConnected || isAirdropping);
    console.log('   Sign btn disabled:', !isConnected || isSigning || sdkSigning);
    console.log('   Send btn disabled:', !isConnected || isSending || sdkSigning);
    console.log('   Subscribe btns disabled:', !isConnected || isSubscribing);

    console.log('%c═══════════════════════════════════════════════════════════════', 'color: #8b5cf6; font-weight: bold');
  }, [isConnected, smartWalletAddress, balance, isConnecting, sdkSigning, isSigning, isSending, isAirdropping, isSubscribing, selectedPlan]);

  // Debug: Log when logs array changes
  useEffect(() => {
    console.log('%c🖼️ LOGS STATE CHANGED:', 'color: #ec4899; font-weight: bold; font-size: 14px');
    console.log('   Total logs:', logs.length);
    if (logs.length > 0) {
      console.log('   Latest log:', logs[0].type, '-', logs[0].message);
      console.log('   All messages:', logs.map(l => `[${l.type}] ${l.message}`));
    }
  }, [logs]);

  // Clear all pending logs - call this when an operation completes
  const clearPendingLogs = useCallback(() => {
    console.log('%c🧹 CLEARING ALL PENDING LOGS', 'color: #f59e0b; font-weight: bold; font-size: 14px');
    setLogs((prev) => {
      const pendingCount = prev.filter(log => log.type === 'pending').length;
      if (pendingCount === 0) {
        console.log('%c   No pending logs to remove', 'color: #f59e0b');
        return prev;
      }
      const filtered = prev.filter(log => log.type !== 'pending');
      console.log('%c   ✅ REMOVED', 'color: #22c55e; font-weight: bold', pendingCount, 'pending logs');
      saveToStorage(STORAGE_KEYS.LOGS, filtered);
      return filtered;
    });
  }, []);

  const addLog = useCallback((type: LogEntry['type'], message: string, details?: string) => {
    const logId = crypto.randomUUID();
    const logEntry: LogEntry = {
      id: logId,
      timestamp: new Date(),
      type,
      message,
      details
    };

    console.log('%c📝 ADD LOG:', 'color: #8b5cf6; font-weight: bold; font-size: 14px', type, '-', message);

    setLogs((prev) => {
      // ALWAYS filter out pending logs when adding success, error, or info
      // The info logs come right after success, so we need to keep filtering
      const shouldFilter = type === 'success' || type === 'error' || type === 'info';

      let baseLogs = prev;
      if (shouldFilter) {
        const pendingCount = prev.filter(log => log.type === 'pending').length;
        if (pendingCount > 0) {
          baseLogs = prev.filter(log => log.type !== 'pending');
          console.log('%c   🗑️ Filtered out', 'color: #ef4444; font-weight: bold', pendingCount, 'pending logs');
        }
      }

      const newLogs = [logEntry, ...baseLogs].slice(0, 30);
      console.log('%c   📋 Logs now:', 'color: #22c55e', newLogs.map(l => l.type).join(', '));

      // NEVER save pending logs to localStorage
      const logsToSave = newLogs.filter(l => l.type !== 'pending');
      saveToStorage(STORAGE_KEYS.LOGS, logsToSave);

      return newLogs;
    });
  }, []);

  const addTransaction = useCallback((tx: Omit<StoredTransaction, 'timestamp'>) => {
    setTransactions((prev) => {
      const newTx = [{ ...tx, timestamp: new Date().toISOString() }, ...prev].slice(0, 50);
      saveToStorage(STORAGE_KEYS.TRANSACTIONS, newTx);
      return newTx;
    });
  }, []);

  // DEBUG: Clear all LazorKit data and force fresh wallet
  const handleForceReset = useCallback(async () => {
    console.log('%c🔥 FORCE RESET - Clearing ALL LazorKit data...', 'color: #ef4444; font-size: 18px; font-weight: bold');

    // Disconnect first
    try {
      await disconnect();
    } catch (e) {
      console.log('Disconnect error (ignored):', e);
    }

    // Clear all localStorage keys that LazorKit might use
    const lazorkitKeys = [
      'lazorkit-wallet',
      'lazorkit-credentials',
      'lazorkit-wallet-store',
      'CREDENTIAL_ID',
      'PUBLIC_KEY',
      'SMART_WALLET_ADDRESS',
      'CREDENTIALS_TIMESTAMP',
      STORAGE_KEYS.LOGS,
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.LAST_WALLET,
    ];

    lazorkitKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        console.log(`  Removing ${key}:`, value.slice(0, 50) + '...');
        localStorage.removeItem(key);
      }
    });

    // Also check for any other lazorkit-related keys
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.toLowerCase().includes('lazor') || key.toLowerCase().includes('passkey')) {
        console.log(`  Found and removing: ${key}`);
        localStorage.removeItem(key);
      }
    });

    // Reset state
    setLogs([]);
    setTransactions([]);
    setBalance(0);
    setLastSignature(null);

    console.log('%c✅ FORCE RESET COMPLETE - Reload the page and reconnect', 'color: #22c55e; font-size: 16px; font-weight: bold');
    addLog('info', 'Reset complete! Reload page and reconnect.');

    // Reload page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }, [disconnect, addLog]);

  // Persist wallet address
  useEffect(() => {
    if (smartWalletAddress) {
      saveToStorage(STORAGE_KEYS.LAST_WALLET, smartWalletAddress);
    }
  }, [smartWalletAddress]);

  const copyAddress = async () => {
    if (smartWalletAddress) {
      await navigator.clipboard.writeText(smartWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (smartWalletPubkey) {
      connection.getBalance(smartWalletPubkey).then(setBalance).catch(console.error);
    }
  }, [smartWalletPubkey, lastSignature]);

  // Handlers
  const handleConnect = async () => {
    console.log('========================================');
    console.log('🚀 handleConnect() STARTED');
    console.log('========================================');
    console.log('Step 1: Checking connect function exists:', typeof connect);

    // Clear old logs to start fresh
    console.log('%c🧹 Clearing old logs before connect...', 'color: #f59e0b');
    setLogs([]);

    addLog('pending', 'Opening passkey authentication...');
    console.log('%c🔍 Current logs state after addLog:', 'color: #06b6d4', logs);

    try {
      console.log('Step 2: About to call connect()...');
      console.log('Connect function:', connect);
      console.log('Connect function toString:', connect?.toString?.().slice(0, 100));

      const startTime = Date.now();
      console.log('Step 3: Calling connect() NOW at', new Date().toISOString());

      const result = await connect();

      const endTime = Date.now();
      console.log('Step 4: connect() returned after', endTime - startTime, 'ms');
      console.log('Result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', result ? Object.keys(result) : 'null');

      if (result) {
        console.log('Step 5: Result details:');
        console.log('  - smartWallet:', result.smartWallet);
        console.log('  - credentialId:', result.credentialId);
        console.log('  - passkeyPubkey:', result.passkeyPubkey);
        console.log('  - platform:', result.platform);
      }

      addLog('success', 'Connected successfully!');
      if (result?.smartWallet) {
        console.log('Step 6: Smart wallet obtained:', result.smartWallet);
        addLog('info', `Wallet: ${result.smartWallet.slice(0, 8)}...${result.smartWallet.slice(-4)}`);
      }

      console.log('========================================');
      console.log('✅ handleConnect() COMPLETED SUCCESSFULLY');
      console.log('========================================');
    } catch (err) {
      console.log('========================================');
      console.log('❌ handleConnect() FAILED');
      console.log('========================================');
      console.error('Error object:', err);
      console.error('Error type:', typeof err);
      console.error('Error name:', (err as Error).name);
      console.error('Error message:', (err as Error).message);
      console.error('Error stack:', (err as Error).stack);

      if (err instanceof Error) {
        console.error('Full error details:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          cause: (err as any).cause,
        });
      }

      // Check if it's a network error
      if ((err as Error).message?.includes('fetch')) {
        console.error('🌐 This appears to be a NETWORK ERROR');
        console.error('Check that these URLs are accessible:');
        console.error('  - RPC:', CONFIG.RPC_URL);
        console.error('  - Portal:', CONFIG.PORTAL_URL);
        console.error('  - Paymaster:', CONFIG.PAYMASTER_URL);
      }

      addLog('error', 'Connection failed', (err as Error).message);
      console.log('========================================');
    } finally {
      // ALWAYS clear pending logs after connect attempt
      console.log('%c🏁 handleConnect FINALLY block - clearing pending logs', 'color: #f59e0b; font-weight: bold');
      clearPendingLogs();
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    addLog('info', 'Disconnected');
    setLastSignature(null);
    setBalance(0);
  };

  const handleAirdrop = async () => {
    console.log('%c🪂 AIRDROP CLICKED', 'color: #f59e0b; font-size: 14px; font-weight: bold');
    console.log('   smartWalletPubkey:', smartWalletPubkey?.toBase58() || 'null');
    console.log('   isAirdropRef.current:', isAirdropRef.current);
    console.log('   isAirdropping state:', isAirdropping);

    // Prevent double-clicks
    if (!smartWalletPubkey || isAirdropRef.current) {
      console.log('%c🚫 AIRDROP BLOCKED', 'color: #ef4444; font-weight: bold');
      console.log('   Reason:', !smartWalletPubkey ? 'No wallet connected' : 'Already airdropping (ref locked)');
      return;
    }

    // Lock immediately
    isAirdropRef.current = true;
    setIsAirdropping(true);
    console.log('%c🔒 AIRDROP LOCKED - Starting...', 'color: #22c55e; font-weight: bold');

    addLog('pending', 'Requesting 1 SOL airdrop from devnet...');

    try {
      console.log('🪂 Step 1: Calling requestAirdrop...');
      console.log('   Address:', smartWalletPubkey.toBase58());
      console.log('   Amount:', LAMPORTS_PER_SOL, 'lamports (1 SOL)');

      const sig = await connection.requestAirdrop(smartWalletPubkey, LAMPORTS_PER_SOL);

      console.log('🪂 Step 2: Got signature:', sig);
      addLog('info', `Airdrop TX: ${sig.slice(0, 12)}...`);

      console.log('🪂 Step 3: Confirming transaction...');
      await connection.confirmTransaction(sig, 'confirmed');

      console.log('%c🪂 Step 4: AIRDROP SUCCESS!', 'color: #22c55e; font-size: 14px; font-weight: bold');
      addLog('success', '+1 SOL airdropped!');
      addTransaction({ signature: sig, type: 'airdrop', status: 'success', details: '1 SOL from devnet faucet' });

      console.log('🪂 Step 5: Fetching new balance...');
      const newBal = await connection.getBalance(smartWalletPubkey);
      console.log('   New balance:', newBal, 'lamports (', (newBal / LAMPORTS_PER_SOL).toFixed(4), 'SOL)');

      setBalance(newBal);
      setLastSignature(sig);
    } catch (err) {
      console.log('%c🪂 AIRDROP FAILED', 'color: #ef4444; font-size: 14px; font-weight: bold');
      console.error('   Error:', err);
      const errorMsg = (err as Error).message;

      // Check for rate limit error
      if (errorMsg.includes('429') || errorMsg.includes('limit')) {
        console.log('   Reason: Rate limited by devnet faucet');
        addLog('error', 'Rate limited! Use faucet.solana.com instead');
      } else {
        addLog('error', 'Airdrop failed', errorMsg);
      }
      addTransaction({ signature: '', type: 'airdrop', status: 'failed', details: errorMsg });
    } finally {
      console.log('%c🔓 AIRDROP UNLOCKED', 'color: #8b5cf6; font-weight: bold');
      clearPendingLogs();
      setTimeout(() => {
        isAirdropRef.current = false;
        setIsAirdropping(false);
      }, 500);
    }
  };

  const handleSignMessage = async () => {
    // Prevent double-clicks with ref check
    if (!isConnected || !signMessage || isSigningRef.current) {
      console.log('handleSignMessage blocked:', { isConnected, hasSignMessage: !!signMessage, isSigningRef: isSigningRef.current });
      return;
    }

    // Lock immediately with ref (sync, before any async)
    isSigningRef.current = true;
    setIsSigning(true);
    addLog('pending', 'Requesting signature...');

    try {
      console.log('=== SIGN MESSAGE START ===');
      const result = await signMessage('Hello from LazorKit Playground!');
      console.log('=== SIGN MESSAGE RESULT ===', result);
      addLog('success', 'Message signed!');
      if (result?.signature) {
        addLog('info', `Sig: ${result.signature.slice(0, 16)}...`);
      }
    } catch (err) {
      console.error('=== SIGN MESSAGE ERROR ===', err);
      addLog('error', 'Signing failed', (err as Error).message);
    } finally {
      clearPendingLogs();
      // Unlock after a small delay to prevent immediate re-trigger
      setTimeout(() => {
        isSigningRef.current = false;
        setIsSigning(false);
      }, 500);
    }
  };

  const handleSendTransaction = async () => {
    // Prevent double-clicks with ref check
    if (!smartWalletPubkey || !signAndSendTransaction || isSendingRef.current) {
      console.log('handleSendTransaction blocked:', { hasWallet: !!smartWalletPubkey, hasSignAndSend: !!signAndSendTransaction, isSendingRef: isSendingRef.current });
      return;
    }

    // Lock immediately with ref (sync, before any async)
    isSendingRef.current = true;
    setIsSending(true);
    addLog('pending', 'Sending gasless transaction...');

    try {
      console.log('%c════════════════════════════════════════════════════════════', 'color: #f59e0b; font-weight: bold');
      console.log('%c💸 SEND TRANSACTION START', 'color: #f59e0b; font-size: 16px; font-weight: bold');
      console.log('%c════════════════════════════════════════════════════════════', 'color: #f59e0b; font-weight: bold');

      // Wallet debug info
      console.log('%c🔑 WALLET DEBUG INFO:', 'color: #ec4899; font-weight: bold');
      console.log('   Full wallet object:', wallet);
      console.log('   credentialId:', wallet?.credentialId);
      console.log('   passkeyPubkey:', wallet?.passkeyPubkey);
      console.log('   passkeyPubkey length:', wallet?.passkeyPubkey?.length);
      console.log('   passkeyPubkey type:', typeof wallet?.passkeyPubkey);
      if (wallet?.passkeyPubkey) {
        console.log('   passkeyPubkey first 5 bytes:', wallet.passkeyPubkey.slice(0, 5));
        console.log('   passkeyPubkey is array:', Array.isArray(wallet.passkeyPubkey));
      }

      console.log('%c📋 Transaction Details:', 'color: #3b82f6; font-weight: bold');
      console.log('   From (smartWallet):', smartWalletPubkey.toBase58());
      console.log('   To (self-transfer):', smartWalletPubkey.toBase58());
      console.log('   Amount:', 100, 'lamports');

      console.log('%c🔧 Creating instruction...', 'color: #8b5cf6');
      const instruction = SystemProgram.transfer({ fromPubkey: smartWalletPubkey, toPubkey: smartWalletPubkey, lamports: 100 });
      console.log('   Instruction created:', instruction);
      console.log('   Program ID:', instruction.programId.toBase58());
      console.log('   Keys:', instruction.keys.map(k => ({ pubkey: k.pubkey.toBase58(), isSigner: k.isSigner, isWritable: k.isWritable })));

      console.log('%c📤 Calling signAndSendTransaction...', 'color: #22c55e; font-weight: bold');
      console.log('   With clusterSimulation: devnet (REQUIRED per docs)');

      const sig = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          clusterSimulation: 'devnet',
        }
      });

      console.log('%c✅ TRANSACTION SUCCESS!', 'color: #22c55e; font-size: 16px; font-weight: bold');
      console.log('   Signature:', sig);
      setLastSignature(sig);
      addLog('success', 'Transaction confirmed!');
      addLog('info', `TX: ${sig.slice(0, 12)}...`, sig);
      addTransaction({ signature: sig, type: 'transfer', status: 'success', details: 'Self-transfer 100 lamports' });

      // Refresh balance
      const newBal = await connection.getBalance(smartWalletPubkey);
      setBalance(newBal);
    } catch (err) {
      console.log('%c════════════════════════════════════════════════════════════', 'color: #ef4444; font-weight: bold');
      console.log('%c❌ TRANSACTION FAILED', 'color: #ef4444; font-size: 16px; font-weight: bold');
      console.log('%c════════════════════════════════════════════════════════════', 'color: #ef4444; font-weight: bold');
      console.error('Error object:', err);
      console.error('Error type:', typeof err);
      console.error('Error name:', (err as Error)?.name);
      console.error('Error message:', (err as Error)?.message);
      console.error('Error stack:', (err as Error)?.stack);

      // Try to extract more info from the error
      const errorObj = err as any;
      if (errorObj?.logs) {
        console.error('%c📜 Transaction Logs:', 'color: #ef4444; font-weight: bold');
        errorObj.logs.forEach((log: string, i: number) => console.error(`   ${i}: ${log}`));
      }
      if (errorObj?.error) {
        console.error('Inner error:', errorObj.error);
      }
      if (errorObj?.code) {
        console.error('Error code:', errorObj.code);
      }

      addLog('error', 'Transaction failed', (err as Error).message);
      addTransaction({ signature: '', type: 'transfer', status: 'failed', details: (err as Error).message });
    } finally {
      clearPendingLogs();
      // Unlock after a small delay to prevent immediate re-trigger
      setTimeout(() => {
        isSendingRef.current = false;
        setIsSending(false);
      }, 500);
    }
  };

  const handleSubscribe = async (planId: string) => {
    // Prevent double-clicks with ref check
    if (!smartWalletPubkey || !signAndSendTransaction || isSubscribingRef.current) {
      console.log('handleSubscribe blocked:', { hasWallet: !!smartWalletPubkey, hasSignAndSend: !!signAndSendTransaction, isSubscribingRef: isSubscribingRef.current });
      return;
    }

    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    // Lock immediately with ref (sync, before any async)
    isSubscribingRef.current = true;
    setSelectedPlan(planId);
    setIsSubscribing(true);
    addLog('pending', `Subscribing to ${plan.name}...`);

    try {
      console.log('=== SUBSCRIBE START ===', planId);
      const lamports = Math.floor(plan.price * LAMPORTS_PER_SOL);
      const instruction = SystemProgram.transfer({ fromPubkey: smartWalletPubkey, toPubkey: smartWalletPubkey, lamports });
      const sig = await signAndSendTransaction({
        instructions: [instruction],
        transactionOptions: {
          computeUnitLimit: 200_000,
          clusterSimulation: 'devnet',
        }
      });
      console.log('=== SUBSCRIBE RESULT ===', sig);
      setLastSignature(sig);
      addLog('success', `Subscribed to ${plan.name}!`);
      addTransaction({ signature: sig, type: 'subscription', status: 'success', details: `${plan.name} - ${plan.priceDisplay}` });

      // Refresh balance
      const newBal = await connection.getBalance(smartWalletPubkey);
      setBalance(newBal);
    } catch (err) {
      console.error('=== SUBSCRIBE ERROR ===', err);
      addLog('error', 'Subscription failed', (err as Error).message);
      addTransaction({ signature: '', type: 'subscription', status: 'failed', details: (err as Error).message });
    } finally {
      clearPendingLogs();
      // Unlock after a small delay to prevent immediate re-trigger
      setTimeout(() => {
        isSubscribingRef.current = false;
        setIsSubscribing(false);
        setSelectedPlan(null);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-transparent to-cyan-950/30" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-bold">LazorKit</span>
            <span className="text-xs text-zinc-500 hidden sm:inline">Developer Playground</span>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <button onClick={handleAirdrop} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20">
                  <Coins className="h-3 w-3" /> Airdrop
                </button>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono">{smartWalletAddress?.slice(0, 4)}...{smartWalletAddress?.slice(-4)}</span>
                  <button onClick={copyAddress} className="p-0.5 hover:bg-white/10 rounded">
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-500" />}
                  </button>
                </div>
                <button onClick={handleDisconnect} className="p-2 hover:bg-white/10 rounded-lg border border-white/10" title="Disconnect">
                  <LogOut className="h-4 w-4 text-zinc-400" />
                </button>
                <button onClick={handleForceReset} className="p-2 hover:bg-red-500/20 rounded-lg border border-red-500/20 text-red-400" title="Reset Wallet (Debug)">
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <a href="https://github.com/0xjesus/lazorkit-bounty" target="_blank" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white">
                <Github className="h-4 w-4" /> <span className="hidden sm:inline">Source Code</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <section className="text-center py-8 sm:py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 mb-6">
            <Sparkles className="h-3 w-3" /> Passkeys + Smart Wallets + Gasless TX
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">
            Web3 Auth, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Reimagined</span>
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto mb-8">
            No seed phrases. No gas fees. No browser extensions. Just your fingerprint.
          </p>

          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Fingerprint className="h-5 w-5" />}
              {isConnecting ? 'Authenticating...' : 'Connect with Passkey'}
              {!isConnecting && <ArrowRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Connected!</span>
              <span className="text-emerald-300/70">Try the actions below</span>
            </div>
          )}
        </section>

        {/* Main Grid - Always Visible */}
        <section className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Left Column - Actions */}
          <div className="space-y-4">
            {/* Wallet Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-medium">Smart Wallet</span>
                </div>
                {isConnected && <span className="text-xs text-emerald-400 flex items-center gap-1"><span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live</span>}
              </div>
              {isConnected ? (
                <>
                  <code className="text-xs font-mono text-violet-400 break-all block mb-3">{smartWalletAddress}</code>
                  <div className="flex justify-between items-center pt-3 border-t border-white/10 mb-3">
                    <span className="text-xs text-zinc-500">Balance</span>
                    <span className={`font-bold ${balance === 0 ? 'text-red-400' : 'text-emerald-400'}`}>{(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL</span>
                  </div>
                  {/* AIRDROP BUTTON - Big and visible! */}
                  <button
                    onClick={() => {
                      console.log('%c🖱️ AIRDROP BUTTON CLICKED!', 'color: #f59e0b; font-size: 16px; font-weight: bold');
                      console.log('   Button disabled?', isAirdropping || isAirdropRef.current);
                      handleAirdrop();
                    }}
                    disabled={isAirdropping}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-black text-base font-bold hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 transition-all animate-pulse"
                  >
                    {isAirdropping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Coins className="h-5 w-5" />}
                    {isAirdropping ? 'Requesting Airdrop...' : '🚀 Get FREE 1 SOL (Devnet)'}
                  </button>
                  {/* Alternative faucet link */}
                  <a
                    href={`https://faucet.solana.com/?address=${smartWalletAddress}`}
                    target="_blank"
                    className="block text-center text-xs text-zinc-500 hover:text-violet-400 mt-2"
                  >
                    Or use Solana Faucet website <ExternalLink className="h-3 w-3 inline" />
                  </a>
                  {balance === 0 && (
                    <p className="text-xs text-amber-400 text-center mt-2">⚠️ You need SOL to send transactions!</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-zinc-500">Connect to see your wallet address and balance</p>
              )}
            </div>

            {/* Sign Message */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileSignature className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium">Sign Message</span>
              </div>
              <p className="text-xs text-zinc-500 mb-3">Prove wallet ownership without a transaction</p>
              <button
                onClick={() => {
                  console.log('%c🖱️ SIGN MESSAGE BUTTON CLICKED!', 'color: #06b6d4; font-size: 16px; font-weight: bold');
                  console.log('   isConnected:', isConnected);
                  console.log('   isSigning:', isSigning);
                  console.log('   sdkSigning:', sdkSigning);
                  console.log('   Button disabled?', !isConnected || isSigning || sdkSigning);
                  handleSignMessage();
                }}
                disabled={!isConnected || isSigning || sdkSigning}
                className="w-full py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />}
                {!isConnected ? 'Connect First' : isSigning ? 'Signing...' : 'Sign Message'}
              </button>
            </div>

            {/* Send Transaction */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
              <div className="flex items-center gap-2 mb-3">
                <Send className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium">Gasless Transaction</span>
              </div>
              <p className="text-xs text-zinc-500 mb-3">Send a transaction - Paymaster pays all fees!</p>
              <button
                onClick={() => {
                  console.log('%c🖱️ SEND TRANSACTION BUTTON CLICKED!', 'color: #22c55e; font-size: 16px; font-weight: bold');
                  console.log('   isConnected:', isConnected);
                  console.log('   isSending:', isSending);
                  console.log('   sdkSigning:', sdkSigning);
                  console.log('   balance:', balance, '(need > 0 for tx)');
                  console.log('   Button disabled?', !isConnected || isSending || sdkSigning);
                  handleSendTransaction();
                }}
                disabled={!isConnected || isSending || sdkSigning}
                className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {!isConnected ? 'Connect First' : isSending ? 'Sending...' : 'Send Transaction'}
              </button>
              {lastSignature && (
                <a href={`https://explorer.solana.com/tx/${lastSignature}?cluster=devnet`} target="_blank" className="mt-2 flex items-center justify-center gap-1 text-xs text-emerald-400/70 hover:text-emerald-400">
                  View on Explorer <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Right Column - Activity Log */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium">Activity Log</span>
                {logs.length > 0 && <span className="text-xs text-zinc-600">({logs.length})</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLogs([])} className="text-xs text-zinc-500 hover:text-white">Clear</button>
                <button onClick={() => setShowLog(!showLog)} className="p-1 hover:bg-white/10 rounded">
                  {showLog ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                </button>
              </div>
            </div>
            {showLog && (
              <div className="h-[320px] overflow-y-auto p-4 space-y-2">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                    <Play className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Try an action to see the logs</p>
                    <p className="text-xs text-zinc-700 mt-1">Connect → Sign → Send → Subscribe</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                      log.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                      log.type === 'error' ? 'bg-red-500/10 border border-red-500/20' :
                      log.type === 'pending' ? 'bg-amber-500/10 border border-amber-500/20' :
                      'bg-white/5 border border-white/5'
                    }`}>
                      <span className="shrink-0 mt-0.5">
                        {log.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                        {log.type === 'error' && <XCircle className="h-4 w-4 text-red-400" />}
                        {log.type === 'pending' && <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />}
                        {log.type === 'info' && <Clock className="h-4 w-4 text-zinc-500" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={log.type === 'success' ? 'text-emerald-300' : log.type === 'error' ? 'text-red-300' : log.type === 'pending' ? 'text-amber-300' : 'text-zinc-400'}>{log.message}</p>
                        {log.details && <p className="text-xs text-zinc-600 mt-0.5 truncate">{log.details}</p>}
                      </div>
                      <span className="text-xs text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* Transaction History - Persisted in LocalStorage */}
        {transactions.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Transaction History</h2>
              <button
                onClick={() => {
                  setTransactions([]);
                  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
                }}
                className="text-xs text-zinc-500 hover:text-white"
              >
                Clear History
              </button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="divide-y divide-white/5">
                {transactions.slice(0, 10).map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'airdrop' ? 'bg-amber-500/20' :
                        tx.type === 'subscription' ? 'bg-violet-500/20' :
                        'bg-emerald-500/20'
                      }`}>
                        {tx.type === 'airdrop' && <Coins className="h-4 w-4 text-amber-400" />}
                        {tx.type === 'subscription' && <CreditCard className="h-4 w-4 text-violet-400" />}
                        {tx.type === 'transfer' && <Send className="h-4 w-4 text-emerald-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{tx.type}</p>
                        <p className="text-xs text-zinc-500">{tx.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${tx.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {tx.status}
                      </span>
                      {tx.signature && (
                        <a
                          href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                          target="_blank"
                          className="block text-xs text-zinc-500 hover:text-violet-400 mt-1"
                        >
                          {tx.signature.slice(0, 8)}... <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Subscription Plans - Always Visible */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Subscription Payments</h2>
            <p className="text-sm text-zinc-500">Real-world use case: gasless subscription billing</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`rounded-2xl border p-5 transition-all ${plan.highlighted ? 'border-violet-500/50 bg-violet-500/5' : 'border-white/10 bg-white/5'}`}>
                <h3 className="font-bold mb-1">{plan.name}</h3>
                <div className="text-2xl font-bold mb-3">{plan.priceDisplay}<span className="text-sm text-zinc-500 font-normal">/mo</span></div>
                <ul className="text-xs text-zinc-400 space-y-1.5 mb-4">
                  {plan.features.map((f, i) => <li key={i} className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" />{f}</li>)}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!isConnected || isSubscribing}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    plan.highlighted ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {isSubscribing && selectedPlan === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  {!isConnected ? 'Connect First' : isSubscribing && selectedPlan === plan.id ? 'Processing...' : `Subscribe`}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Fingerprint, title: 'Passkey Auth', desc: 'Face ID, Touch ID, Windows Hello', color: 'violet' },
            { icon: Zap, title: 'Zero Gas Fees', desc: 'Paymaster sponsors everything', color: 'amber' },
            { icon: Shield, title: 'Smart Wallets', desc: 'PDA-based with recovery options', color: 'cyan' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <f.icon className={`h-8 w-8 mb-3 text-${f.color}-400`} />
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Code Snippets */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 text-center">Quick Integration</h2>
          <div className="grid lg:grid-cols-3 gap-4">
            {Object.entries(CODE_SNIPPETS).map(([key, code]) => (
              <div key={key} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-400 capitalize">{key}</span>
                  <CopyButton text={code} />
                </div>
                <pre className="text-[10px] text-zinc-500 overflow-x-auto leading-relaxed"><code>{code}</code></pre>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-400" />
            <span className="font-medium text-white">LazorKit</span>
            <span>SDK v2.0.1</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://docs.lazorkit.com" target="_blank" className="hover:text-white flex items-center gap-1"><BookOpen className="h-3 w-3" /> Docs</a>
            <a href="https://github.com/lazor-kit/lazor-kit" target="_blank" className="hover:text-white flex items-center gap-1"><Github className="h-3 w-3" /> GitHub</a>
            <a href="https://t.me/lazorkit" target="_blank" className="hover:text-white">Telegram</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

// =============================================================================
// ROOT
// =============================================================================

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('========================================');
    console.log('🏠 Home component MOUNTED');
    console.log('========================================');
    console.log('LazorkitProvider will receive:');
    console.log('  - rpcUrl:', CONFIG.RPC_URL);
    console.log('  - portalUrl:', CONFIG.PORTAL_URL);
    console.log('  - paymasterConfig:', { paymasterUrl: CONFIG.PAYMASTER_URL });
    console.log('========================================');

    // Test RPC connectivity
    console.log('🔌 Testing RPC connection...');
    fetch(CONFIG.RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
    })
      .then((res) => res.json())
      .then((data) => console.log('✅ RPC Health check:', data))
      .catch((err) => console.error('❌ RPC Health check FAILED:', err));

    // Test Portal connectivity
    console.log('🔌 Testing Portal connection...');
    fetch(CONFIG.PORTAL_URL, { method: 'HEAD', mode: 'no-cors' })
      .then(() => console.log('✅ Portal reachable (no-cors)'))
      .catch((err) => console.error('❌ Portal check FAILED:', err));

    // Test Paymaster connectivity
    console.log('🔌 Testing Paymaster connection...');
    fetch(CONFIG.PAYMASTER_URL, { method: 'HEAD', mode: 'no-cors' })
      .then(() => console.log('✅ Paymaster reachable (no-cors)'))
      .catch((err) => console.error('❌ Paymaster check FAILED:', err));

    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  console.log('🎨 Rendering LazorkitProvider with config:', {
    rpcUrl: CONFIG.RPC_URL,
    portalUrl: CONFIG.PORTAL_URL,
    paymasterConfig: { paymasterUrl: CONFIG.PAYMASTER_URL },
  });

  return (
    <LazorkitProvider rpcUrl={CONFIG.RPC_URL} portalUrl={CONFIG.PORTAL_URL} paymasterConfig={{ paymasterUrl: CONFIG.PAYMASTER_URL }}>
      <WalletDemo />
    </LazorkitProvider>
  );
}
