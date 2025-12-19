'use client';

import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SubscriptionPlan } from '@/types';

interface PricingCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
  isSelected?: boolean;
  isLoading?: boolean;
  isConnected: boolean;
}

/**
 * Pricing Card Component
 *
 * Displays a subscription plan with its features and price.
 * Handles selection state and loading during payment.
 */
export function PricingCard({
  plan,
  onSelect,
  isSelected = false,
  isLoading = false,
  isConnected,
}: PricingCardProps) {
  const handleSelect = () => {
    if (!isLoading && isConnected) {
      onSelect(plan);
    }
  };

  return (
    <Card highlighted={plan.highlighted} className={isSelected ? 'ring-2 ring-violet-500' : ''}>
      <div className="flex flex-col h-full">
        {/* Plan Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">{plan.priceDisplay}</span>
            <span className="text-zinc-500">/{plan.interval}</span>
          </div>
          {plan.price > 0 && (
            <p className="text-xs text-zinc-500 mt-1">
              Paid in USDC • Gasless transaction
            </p>
          )}
        </div>

        {/* Features List */}
        <ul className="space-y-3 mb-8 flex-grow">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-zinc-300">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          variant={plan.highlighted ? 'primary' : 'secondary'}
          size="lg"
          className="w-full"
          onClick={handleSelect}
          loading={isSelected && isLoading}
          disabled={!isConnected || (isSelected && isLoading)}
        >
          {!isConnected
            ? 'Connect Wallet First'
            : plan.price === 0
              ? 'Get Started Free'
              : isSelected && isLoading
                ? 'Processing...'
                : `Subscribe for ${plan.priceDisplay}`}
        </Button>

        {!isConnected && (
          <p className="text-xs text-zinc-500 text-center mt-2">
            Connect your passkey wallet to subscribe
          </p>
        )}
      </div>
    </Card>
  );
}

export default PricingCard;
