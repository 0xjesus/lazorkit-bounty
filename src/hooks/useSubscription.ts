'use client';

import { useState, useCallback } from 'react';
import { useLazorKit } from '@/components/wallet/LazorKitProvider';
import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import type { SubscriptionPlan, UserSubscription, TransactionRecord } from '@/types';
import { LAZORKIT_CONFIG } from '@/config/lazorkit';

// Treasury address - replace with your actual treasury in production
const TREASURY_ADDRESS = new PublicKey('DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy');

// USDC decimals (6 for USDC)
const USDC_DECIMALS = 6;

interface UseSubscriptionReturn {
  subscribe: (plan: SubscriptionPlan) => Promise<string>;
  isProcessing: boolean;
  error: string | null;
  subscription: UserSubscription | null;
  transactions: TransactionRecord[];
  clearError: () => void;
}

/**
 * useSubscription Hook
 *
 * Handles subscription payments using LazorKit's gasless transactions.
 * Supports USDC payments with automatic gas sponsorship.
 *
 * @example
 * ```tsx
 * const { subscribe, isProcessing, error } = useSubscription();
 *
 * const handleSubscribe = async (plan) => {
 *   const signature = await subscribe(plan);
 *   console.log('Subscribed!', signature);
 * };
 * ```
 */
export function useSubscription(): UseSubscriptionReturn {
  const { signMessage, publicKey, isConnected } = useLazorKit();
  const smartWalletPubkey = publicKey ? new PublicKey(publicKey) : null;
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Subscribe to a plan by sending USDC payment
   *
   * For this demo, we're using SOL transfer as USDC requires token program integration.
   * In production, you would use SPL token transfer instructions.
   */
  const subscribe = useCallback(
    async (plan: SubscriptionPlan): Promise<string> => {
      if (!isConnected || !smartWalletPubkey) {
        throw new Error('Wallet not connected');
      }

      if (plan.price === 0) {
        // Free plan - no payment needed
        const newSubscription: UserSubscription = {
          planId: plan.id,
          status: 'active',
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          autoRenew: false,
        };
        setSubscription(newSubscription);
        return 'free-plan';
      }

      setIsProcessing(true);
      setError(null);

      try {
        if (!signMessage) {
          throw new Error('Wallet not fully initialized');
        }

        // For demo purposes, we send a small amount of SOL as payment
        const lamportsToSend = Math.floor(plan.price * LAMPORTS_PER_SOL * 0.001);

        // Create transfer instruction
        const transferInstruction: TransactionInstruction = SystemProgram.transfer({
          fromPubkey: smartWalletPubkey,
          toPubkey: TREASURY_ADDRESS,
          lamports: lamportsToSend > 0 ? lamportsToSend : 1000,
        });

        // Sign and send with passkey (SDK 0.9.6 API)
        const signature = await signMessage(transferInstruction);

        // Record the transaction
        const txRecord: TransactionRecord = {
          signature,
          type: 'subscription',
          amount: plan.price,
          token: 'USDC',
          timestamp: new Date(),
          status: 'confirmed',
        };
        setTransactions((prev) => [txRecord, ...prev]);

        // Update subscription status
        const newSubscription: UserSubscription = {
          planId: plan.id,
          status: 'active',
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          autoRenew: true,
        };
        setSubscription(newSubscription);

        return signature;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [isConnected, smartWalletPubkey, signMessage]
  );

  return {
    subscribe,
    isProcessing,
    error,
    subscription,
    transactions,
    clearError,
  };
}

export default useSubscription;
