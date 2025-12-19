# Tutorial 2: Gasless Subscription Transactions

This tutorial shows you how to send gasless transactions using LazorKit's Paymaster. We'll build a subscription payment system where users pay in USDC without needing SOL for gas fees.

## What You'll Learn

- Creating Solana transfer instructions
- Using the `signAndSendTransaction` method
- Configuring gasless transaction options
- Handling transaction success and errors
- Building a subscription payment flow

## Prerequisites

- Completed [Tutorial 1: Creating a Passkey-Based Wallet](./01-passkey-wallet.md)
- LazorKit SDK installed and configured
- Understanding of Solana transactions

---

## How Gasless Transactions Work

Traditional Solana transactions require the user to pay gas fees in SOL. With LazorKit's Paymaster:

1. User creates and signs a transaction
2. The Paymaster (bundler) receives the signed transaction
3. Paymaster wraps it with gas payment instructions
4. Paymaster submits to Solana and pays the gas
5. User's transaction executes without them paying SOL

This creates a "Web2-like" payment experience where users only think about the amount they're paying, not gas fees.

---

## Step 1: Understand Transaction Options

The `signAndSendTransaction` method accepts these options:

```typescript
interface TransactionOptions {
  // Token address to use for fees (e.g., USDC address)
  feeToken?: string;

  // Maximum compute units for the transaction
  computeUnitLimit?: number;

  // Address lookup tables for versioned transactions
  addressLookupTableAccounts?: AddressLookupTableAccount[];

  // Network for simulation ('devnet' | 'mainnet')
  clusterSimulation?: 'devnet' | 'mainnet';
}
```

---

## Step 2: Create a Payment Hook

Create a reusable hook for handling subscription payments.

Create `src/hooks/useSubscription.ts`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Your treasury wallet address
const TREASURY_ADDRESS = new PublicKey('YOUR_TREASURY_ADDRESS_HERE');

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number; // Price in USDC/SOL
}

interface UseSubscriptionReturn {
  subscribe: (plan: SubscriptionPlan) => Promise<string>;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const { signAndSendTransaction, smartWalletPubkey, isConnected } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const subscribe = useCallback(
    async (plan: SubscriptionPlan): Promise<string> => {
      // Validation
      if (!isConnected || !smartWalletPubkey) {
        throw new Error('Wallet not connected');
      }

      if (plan.price <= 0) {
        throw new Error('Invalid plan price');
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Step 1: Create the transfer instruction
        // For demo, we transfer a small amount of SOL
        // In production, use SPL token transfer for USDC
        const lamports = Math.floor(plan.price * LAMPORTS_PER_SOL);

        const transferInstruction = SystemProgram.transfer({
          fromPubkey: smartWalletPubkey,
          toPubkey: TREASURY_ADDRESS,
          lamports: lamports,
        });

        // Step 2: Sign and send with gasless options
        const signature = await signAndSendTransaction({
          instructions: [transferInstruction],
          transactionOptions: {
            // Use USDC for gas fees (Paymaster sponsors this)
            feeToken: 'USDC',
            // Set compute limit for the transaction
            computeUnitLimit: 200_000,
            // Specify network for simulation
            clusterSimulation: 'devnet',
          },
        });

        console.log('Transaction successful:', signature);
        return signature;

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setError(message);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [isConnected, smartWalletPubkey, signAndSendTransaction]
  );

  return {
    subscribe,
    isProcessing,
    error,
    clearError,
  };
}
```

---

## Step 3: Build the Payment UI

Create a subscription component that uses the hook.

Create `src/components/subscription/SubscribeButton.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useWallet } from '@lazorkit/wallet';
import { useSubscription } from '@/hooks/useSubscription';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
}

interface SubscribeButtonProps {
  plan: Plan;
}

export function SubscribeButton({ plan }: SubscribeButtonProps) {
  const { isConnected } = useWallet();
  const { subscribe, isProcessing, error, clearError } = useSubscription();
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      clearError();
      setTxSignature(null);

      const signature = await subscribe(plan);
      setTxSignature(signature);

    } catch (err) {
      console.error('Subscription failed:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Subscribe Button */}
      <button
        onClick={handleSubscribe}
        disabled={!isConnected || isProcessing}
        className={`
          w-full px-6 py-3 rounded-xl font-semibold transition-all
          ${isConnected
            ? 'bg-violet-600 hover:bg-violet-500 text-white'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }
          ${isProcessing ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        {!isConnected
          ? 'Connect Wallet First'
          : isProcessing
            ? 'Processing...'
            : `Subscribe for ${plan.priceDisplay}`
        }
      </button>

      {/* Success Message */}
      {txSignature && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 font-medium">Payment successful!</p>
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-500/80 hover:text-green-400"
          >
            View transaction on Solana Explorer →
          </a>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 font-medium">Transaction failed</p>
          <p className="text-sm text-red-500/80">{error}</p>
          <button
            onClick={clearError}
            className="mt-2 text-sm text-red-400 hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Step 4: Complete Pricing Section

Create a full pricing section with multiple plans.

Create `src/components/subscription/PricingSection.tsx`:

```typescript
'use client';

import { SubscribeButton } from './SubscribeButton';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0.001, // Small amount for devnet testing
    priceDisplay: '$0.001',
    features: ['100 API calls', 'Basic support', '1 project'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 0.01,
    priceDisplay: '$0.01',
    features: ['10,000 API calls', 'Priority support', 'Unlimited projects'],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0.05,
    priceDisplay: '$0.05',
    features: ['Unlimited calls', 'Dedicated support', 'Custom SLA'],
  },
];

export function PricingSection() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center mb-4">
        Choose Your Plan
      </h2>
      <p className="text-gray-400 text-center mb-12">
        Pay with USDC. Gas fees are covered by us.
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`
              p-6 rounded-2xl border
              ${plan.highlighted
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-gray-700 bg-gray-800/50'
              }
            `}
          >
            {/* Plan Header */}
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold mb-4">
              {plan.priceDisplay}
              <span className="text-sm text-gray-400 font-normal">/month</span>
            </div>

            {/* Features List */}
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {/* Subscribe Button */}
            <SubscribeButton plan={plan} />
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

## Step 5: Transaction Flow Breakdown

Here's what happens when a user clicks "Subscribe":

### 1. Create Instructions

```typescript
const transferInstruction = SystemProgram.transfer({
  fromPubkey: smartWalletPubkey,  // User's smart wallet (PDA)
  toPubkey: TREASURY_ADDRESS,     // Your treasury
  lamports: amount,               // Payment amount
});
```

### 2. Sign Transaction

The user's passkey signs the transaction via the LazorKit portal popup. This happens automatically when you call `signAndSendTransaction`.

### 3. Paymaster Wrapping

The Paymaster receives the signed transaction and:
- Adds compute budget instructions
- Adds fee payment from the sponsor wallet
- Wraps everything in a single atomic transaction

### 4. Submit to Solana

The wrapped transaction is submitted to the Solana network. If successful, you receive the transaction signature.

---

## Step 6: Advanced - SPL Token Transfers

For production USDC payments, use SPL token transfers:

```typescript
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

async function createUsdcTransferInstruction(
  from: PublicKey,
  to: PublicKey,
  amount: number, // Amount in USDC (will multiply by 10^6)
) {
  // Get associated token accounts
  const fromAta = await getAssociatedTokenAddress(USDC_MINT, from);
  const toAta = await getAssociatedTokenAddress(USDC_MINT, to);

  // USDC has 6 decimals
  const usdcAmount = Math.floor(amount * 1_000_000);

  return createTransferInstruction(
    fromAta,        // Source token account
    toAta,          // Destination token account
    from,           // Owner of source account
    usdcAmount,     // Amount in smallest unit
  );
}
```

---

## Error Handling Best Practices

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Wallet not connected` | User hasn't connected | Show connect button |
| `Insufficient balance` | Not enough funds | Show balance warning |
| `Transaction timeout` | Network congestion | Retry with higher fees |
| `User rejected` | User cancelled signing | Show cancellation message |

### Implement Retry Logic

```typescript
async function subscribeWithRetry(plan: Plan, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await subscribe(plan);
    } catch (err) {
      if (attempt === maxRetries) throw err;

      // Wait before retrying (exponential backoff)
      await new Promise(r => setTimeout(r, attempt * 1000));
    }
  }
}
```

---

## Testing on Devnet

### Get Devnet SOL

Fund your smart wallet with devnet SOL for testing:

```bash
solana airdrop 2 YOUR_SMART_WALLET_ADDRESS --url devnet
```

### Verify Transaction

After a successful transaction, verify on Solana Explorer:

```
https://explorer.solana.com/tx/YOUR_SIGNATURE?cluster=devnet
```

---

## Summary

You've learned how to:

1. ✅ Create Solana transfer instructions
2. ✅ Configure gasless transaction options
3. ✅ Sign and send transactions with passkeys
4. ✅ Handle success and error states
5. ✅ Build a complete subscription payment flow

## Key Takeaways

- **Users pay zero gas fees** - Paymaster covers all costs
- **Transactions are real** - Everything settles on Solana
- **Passkey signing is secure** - Private keys never leave the device
- **Simple integration** - Just wrap your instructions and call one method

---

## Next Steps

- Implement subscription tracking in your backend
- Add webhook notifications for payment events
- Set up mainnet deployment with production USDC
- Implement automated recurring billing

---

## Resources

- [LazorKit Documentation](https://docs.lazorkit.com/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Program](https://spl.solana.com/token)
