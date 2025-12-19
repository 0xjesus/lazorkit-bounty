/**
 * Type definitions for the LazorKit Subscription Starter
 */

// Subscription plan tiers
export type PlanTier = 'free' | 'pro' | 'enterprise';

// Subscription plan structure
export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  price: number; // Price in USDC
  priceDisplay: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  highlighted?: boolean;
}

// User subscription status
export interface UserSubscription {
  planId: PlanTier;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startedAt: Date;
  expiresAt: Date;
  autoRenew: boolean;
}

// Transaction record
export interface TransactionRecord {
  signature: string;
  type: 'subscription' | 'renewal' | 'cancellation';
  amount: number;
  token: string;
  timestamp: Date;
  status: 'confirmed' | 'pending' | 'failed';
}

// Wallet state from LazorKit
export interface WalletInfo {
  credentialId: string;
  passkeyPubkey: number[];
  smartWallet: string;
  walletDevice: string;
  platform: string;
  accountName?: string;
}

// App state
export interface AppState {
  isLoading: boolean;
  error: string | null;
  subscription: UserSubscription | null;
  transactions: TransactionRecord[];
}
