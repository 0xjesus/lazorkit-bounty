'use client';

import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { PricingCard } from './PricingCard';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '@/constants/plans';
import { ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import type { SubscriptionPlan } from '@/types';

/**
 * Pricing Section Component
 *
 * Displays all subscription plans and handles the payment flow.
 * Integrates with LazorKit for gasless transactions.
 */
export function PricingSection() {
  const { isConnected } = useWallet();
  const { subscribe, isProcessing, error, subscription, clearError } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id);
    setTxSignature(null);
    clearError();

    try {
      const signature = await subscribe(plan);
      setTxSignature(signature);
    } catch (err) {
      console.error('Subscription failed:', err);
    }
  };

  return (
    <section className="py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">
          Choose Your Plan
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Pay with USDC using gasless transactions. No SOL needed for fees—
          we sponsor all gas costs through LazorKit&apos;s Paymaster.
        </p>
      </div>

      {/* Success Message */}
      {txSignature && txSignature !== 'free-plan' && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="text-emerald-400 font-medium">Subscription successful!</p>
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-500/80 hover:text-emerald-400 flex items-center gap-1"
              >
                View transaction on Solana Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {txSignature === 'free-plan' && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-emerald-400 font-medium">
              Free plan activated! Welcome aboard.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/30 p-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Transaction failed</p>
              <p className="text-sm text-red-500/80">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      {subscription && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Current Plan</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {subscription.planId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-500">Status</p>
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            onSelect={handleSelectPlan}
            isSelected={selectedPlan === plan.id}
            isLoading={isProcessing && selectedPlan === plan.id}
            isConnected={isConnected}
          />
        ))}
      </div>

      {/* Info Note */}
      <div className="text-center mt-8">
        <p className="text-sm text-zinc-500">
          🔐 Secured by passkey authentication • ⛽ Gasless transactions powered by LazorKit
        </p>
      </div>
    </section>
  );
}

export default PricingSection;
