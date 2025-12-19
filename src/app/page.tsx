"use client";

import { LazorkitProvider, useWallet } from "@lazorkit/wallet";
import { Connection, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { Fingerprint, Send, LogOut, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

// Use their exact same RPC
const connection = new Connection("https://api.devnet.solana.com");

function WalletDemo() {
  const [balance, setBalance] = useState(0);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    smartWalletPubkey,
    isConnected,
    isConnecting,
    isSigning,
    error: walletError,
    connect,
    disconnect,
    signAndSendTransaction
  } = useWallet();

  const handleConnect = async () => {
    console.log('=== CONNECT START ===');
    console.log('connect function:', connect);
    console.log('isConnecting before:', isConnecting);
    setError(null);

    // Add timeout to detect if it hangs
    const timeoutId = setTimeout(() => {
      console.error('!!! CONNECT TIMEOUT - hung for 10 seconds !!!');
    }, 10000);

    try {
      console.log('Calling connect()...');
      const result = await connect();
      clearTimeout(timeoutId);
      console.log('Connect result:', result);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

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

  const sendSOL = async () => {
    if (!smartWalletPubkey) return;
    setError(null);
    setTxSignature(null);

    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: smartWalletPubkey, // Send to self for demo
      lamports: 100, // Tiny amount
    });

    try {
      const signature = await signAndSendTransaction(instruction);
      console.log('Transfer successful:', signature);
      setTxSignature(signature);
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            LazorKit Demo
          </h1>
          <p className="text-zinc-400">
            Passkey authentication + Gasless transactions on Solana
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          {!isConnected ? (
            <div className="text-center">
              <p className="text-zinc-400 mb-6">
                Connect with Face ID, Touch ID, or Windows Hello. No seed phrase needed.
              </p>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center justify-center gap-2 mx-auto px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isConnecting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Fingerprint className="h-5 w-5" />
                )}
                {isConnecting ? 'Connecting...' : 'Connect with Passkey'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connected Status */}
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Connected</span>
              </div>

              {/* Wallet Info */}
              <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-sm text-zinc-500 mb-1">Smart Wallet</p>
                <code className="text-sm font-mono text-violet-400 break-all">
                  {smartWalletPubkey?.toString()}
                </code>
              </div>

              <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <p className="text-sm text-zinc-500 mb-1">Balance</p>
                <p className="text-xl font-bold">{(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL</p>
              </div>

              {/* Send Transaction */}
              <button
                onClick={sendSOL}
                disabled={isSigning}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all disabled:opacity-50"
              >
                {isSigning ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {isSigning ? 'Sending...' : 'Send Gasless Transaction'}
              </button>

              {/* Transaction Success */}
              {txSignature && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-emerald-400 font-medium mb-2">Transaction successful!</p>
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-400"
                  >
                    View on Solana Explorer
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Disconnect */}
              <button
                onClick={() => disconnect()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
              >
                <LogOut className="h-5 w-5" />
                Disconnect
              </button>
            </div>
          )}

          {/* Error Display */}
          {(error || walletError) && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-red-400">{error || walletError?.message}</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-zinc-500">
          <p>Powered by LazorKit SDK v1.4.3-beta</p>
        </div>
      </div>
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
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 flex items-center justify-center">
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
