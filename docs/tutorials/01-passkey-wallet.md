# Tutorial 1: Creating a Passkey-Based Wallet

This tutorial walks you through integrating LazorKit's passkey authentication into a Next.js application. By the end, you'll have a working "Connect with Passkey" button that creates a smart wallet using the user's biometrics.

## What You'll Learn

- Setting up the LazorKit provider
- Creating a connect button component
- Handling wallet connection states
- Displaying wallet information
- Error handling best practices

## Prerequisites

- A Next.js 14+ project with TypeScript
- Basic understanding of React hooks
- Node.js 18+

---

## Step 1: Install Dependencies

First, install the LazorKit SDK and its peer dependencies:

```bash
npm install @lazorkit/wallet @solana/web3.js @coral-xyz/anchor
```

---

## Step 2: Set Up the LazorKit Provider

The LazorKit SDK requires a provider that wraps your application. This provider handles SDK initialization and provides wallet context to all child components.

### Create the Configuration File

Create `src/config/lazorkit.ts`:

```typescript
/**
 * LazorKit SDK Configuration
 *
 * These values connect your app to the LazorKit infrastructure.
 * For production, use environment variables.
 */
export const LAZORKIT_CONFIG = {
  // Solana RPC endpoint
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',

  // LazorKit authentication portal
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal.lazor.sh',

  // Paymaster for gasless transactions
  paymasterConfig: {
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || 'https://kora.devnet.lazorkit.com',
  },

  // Network for simulation
  clusterSimulation: 'devnet' as const,
} as const;
```

### Create the Provider Wrapper

Create `src/components/wallet/LazorKitProvider.tsx`:

```typescript
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { LazorkitProvider } from '@lazorkit/wallet';
import { LAZORKIT_CONFIG } from '@/config/lazorkit';

// Polyfill Buffer for browser environment
// This is required because @solana/web3.js uses Node.js Buffer
if (typeof window !== 'undefined') {
  const { Buffer } = require('buffer');
  window.Buffer = window.Buffer || Buffer;
}

interface LazorKitWrapperProps {
  children: ReactNode;
}

export function LazorKitWrapper({ children }: LazorKitWrapperProps) {
  // Prevent SSR hydration issues with WebAuthn
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <LazorkitProvider
      rpcUrl={LAZORKIT_CONFIG.rpcUrl}
      portalUrl={LAZORKIT_CONFIG.portalUrl}
      paymasterConfig={LAZORKIT_CONFIG.paymasterConfig}
    >
      {children}
    </LazorkitProvider>
  );
}
```

### Wire Up the Provider

Update your `src/app/layout.tsx`:

```typescript
import { LazorKitWrapper } from '@/components/wallet/LazorKitProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LazorKitWrapper>{children}</LazorKitWrapper>
      </body>
    </html>
  );
}
```

---

## Step 3: Create the Connect Button

Now let's build the connect button that triggers passkey authentication.

Create `src/components/wallet/ConnectButton.tsx`:

```typescript
'use client';

import { useWallet } from '@lazorkit/wallet';
import { useState } from 'react';

export function ConnectButton() {
  const { connect, disconnect, isConnected, isConnecting, wallet } = useWallet();
  const [error, setError] = useState<string | null>(null);

  // Handle connection
  const handleConnect = async () => {
    try {
      setError(null);
      await connect();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
      console.error('Connection error:', err);
    }
  };

  // Handle disconnection
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Loading state
  if (isConnecting) {
    return (
      <button disabled className="px-4 py-2 bg-gray-600 text-white rounded-lg">
        Connecting...
      </button>
    );
  }

  // Connected state
  if (isConnected && wallet) {
    return (
      <div className="flex items-center gap-2">
        {/* Display wallet address */}
        <div className="px-3 py-2 bg-gray-800 rounded-lg">
          <span className="text-green-400">●</span>
          <span className="ml-2 font-mono text-sm">
            {formatAddress(wallet.smartWallet)}
          </span>
        </div>

        {/* Disconnect button */}
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Disconnected state
  return (
    <div>
      <button
        onClick={handleConnect}
        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium"
      >
        Connect with Passkey
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

---

## Step 4: Understanding the Wallet Object

When a user connects, the `wallet` object contains:

```typescript
interface WalletInfo {
  credentialId: string;      // Unique WebAuthn credential ID
  passkeyPubkey: number[];   // Raw passkey public key bytes
  smartWallet: string;       // Solana wallet address (Base58)
  walletDevice: string;      // Device PDA for management
  platform: string;          // Platform info (e.g., 'web', 'macIntel')
  accountName?: string;      // User's account name (if set)
}
```

The `smartWallet` field is the user's Solana address. This is a Program Derived Address (PDA) controlled by the LazorKit program.

---

## Step 5: Displaying Wallet Information

Create a component to show detailed wallet info:

```typescript
'use client';

import { useWallet } from '@lazorkit/wallet';

export function WalletInfo() {
  const { wallet, isConnected } = useWallet();

  if (!isConnected || !wallet) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Wallet Details</h3>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-400">Address:</span>
          <p className="font-mono break-all">{wallet.smartWallet}</p>
        </div>

        <div>
          <span className="text-gray-400">Platform:</span>
          <p>{wallet.platform}</p>
        </div>

        <div>
          <span className="text-gray-400">Credential ID:</span>
          <p className="font-mono text-xs break-all">
            {wallet.credentialId.slice(0, 20)}...
          </p>
        </div>
      </div>

      {/* Link to Solana Explorer */}
      <a
        href={`https://explorer.solana.com/address/${wallet.smartWallet}?cluster=devnet`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-violet-400 hover:text-violet-300"
      >
        View on Explorer →
      </a>
    </div>
  );
}
```

---

## Step 6: Handle Edge Cases

### Browser Compatibility

WebAuthn requires a secure context (HTTPS) except for `localhost`. Add a check:

```typescript
const isSecureContext = window.isSecureContext;

if (!isSecureContext) {
  console.warn('WebAuthn requires HTTPS. Some features may not work.');
}
```

### Popup Blockers

Some browsers may block the LazorKit portal popup. Handle this gracefully:

```typescript
const handleConnect = async () => {
  try {
    await connect();
  } catch (err) {
    if (err instanceof Error && err.message.includes('popup')) {
      setError('Please allow popups for this site to connect.');
    }
  }
};
```

### Session Persistence

LazorKit automatically persists sessions in local storage. The `isConnected` state will be `true` on page reload if the user was previously connected.

---

## Complete Example

Here's the full working example:

```typescript
// src/app/page.tsx
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { WalletInfo } from '@/components/wallet/WalletInfo';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My App</h1>
        <ConnectButton />
      </header>

      <WalletInfo />
    </main>
  );
}
```

---

## What's Next?

Now that users can connect their passkey wallet, let's learn how to send gasless transactions:

→ [Tutorial 2: Gasless Subscription Transactions](./02-gasless-transactions.md)

---

## Troubleshooting

### "Cannot find module 'buffer'"

Install the buffer polyfill:

```bash
npm install buffer
```

### "WebAuthn not supported"

Ensure you're using a modern browser (Chrome 67+, Safari 13+, Firefox 60+) and serving over HTTPS.

### "Connection timeout"

Check your network connection and ensure the LazorKit portal URL is accessible.
