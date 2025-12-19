import type { SubscriptionPlan } from '@/types';

/**
 * Subscription Plans
 *
 * Define your subscription tiers here. Prices are in USDC.
 * For demo purposes, we use small amounts on Devnet.
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: '$0',
    interval: 'monthly',
    features: [
      '100 API calls/month',
      'Basic analytics',
      'Community support',
      'Single project',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 0.01, // 0.01 USDC for Devnet demo (use real prices in production)
    priceDisplay: '$0.01',
    interval: 'monthly',
    features: [
      '10,000 API calls/month',
      'Advanced analytics',
      'Priority support',
      'Unlimited projects',
      'Custom integrations',
      'Team collaboration',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0.05, // 0.05 USDC for Devnet demo
    priceDisplay: '$0.05',
    interval: 'monthly',
    features: [
      'Unlimited API calls',
      'Real-time analytics',
      'Dedicated support',
      'Unlimited everything',
      'Custom SLA',
      'On-premise option',
      'SSO & SAML',
    ],
  },
];

// Get plan by ID
export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
};
