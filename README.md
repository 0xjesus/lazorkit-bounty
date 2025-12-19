# LazorKit Developer Playground

<div align="center">

![LazorKit](https://img.shields.io/badge/LazorKit-Developer%20Playground-8b5cf6?style=for-the-badge)
![SDK Version](https://img.shields.io/badge/SDK-v2.0.1-22c55e?style=for-the-badge)

**Learn LazorKit in 5 minutes**

*Interactive demo | Copy-paste code | Real transactions on Devnet*

[![Live Demo](https://img.shields.io/badge/Live-Demo-emerald?style=flat-square)](https://lazorkit-subscription-starter.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=flat-square&logo=solana)](https://solana.com/)

</div>

---

## What is this?

An **interactive playground** for developers to learn LazorKit SDK. Try passkey authentication and gasless transactions in real-time, then copy the code into your project.

**Key Features:**
- **Passkey Auth** - Face ID, Touch ID, Windows Hello (no seed phrases!)
- **Smart Wallets** - PDA-based wallets controlled by biometrics
- **Gasless Transactions** - Paymaster sponsors all fees

---

## Try it Live

**[Open Playground](https://lazorkit-subscription-starter.vercel.app)**

1. Click "Connect with Passkey"
2. Authenticate with Face ID / Touch ID / Windows Hello
3. Sign a message
4. Send a gasless transaction
5. Watch the activity log

---

## Quick Start

```bash
# Clone
git clone https://github.com/0xjesus/lazorkit-bounty.git
cd lazorkit-bounty

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Setup

Create a `.env.local` file (optional - defaults work on Devnet):

```env
# RPC endpoint (defaults to Solana Devnet)
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# LazorKit Portal (WebAuthn authentication)
NEXT_PUBLIC_PORTAL_URL=https://portal.lazor.sh

# Paymaster (sponsors transaction fees)
NEXT_PUBLIC_PAYMASTER_URL=https://kora.devnet.lazorkit.com
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main demo page (all-in-one)
│   └── globals.css         # Tailwind styles
├── components/
│   ├── wallet/
│   │   └── LazorKitProvider.tsx  # SDK wrapper hook
│   └── ui/                 # Reusable UI components
├── hooks/
│   └── useSubscription.ts  # Example: subscription payments
└── config/
    └── lazorkit.ts         # Configuration constants
```

---

## Core Integration (SDK 2.0.1)

### 1. Install Dependencies

```bash
npm install @lazorkit/wallet @solana/web3.js
```

### 2. Setup Provider

```tsx
// app/layout.tsx or _app.tsx
import { LazorkitProvider } from '@lazorkit/wallet';

export default function Layout({ children }) {
  return (
    <LazorkitProvider
      rpcUrl="https://api.devnet.solana.com"
      portalUrl="https://portal.lazor.sh"
      paymasterConfig={{
        paymasterUrl: "https://kora.devnet.lazorkit.com"
      }}
    >
      {children}
    </LazorkitProvider>
  );
}
```

### 3. Connect with Passkey

```tsx
import { useWallet } from '@lazorkit/wallet';

function ConnectButton() {
  const { connect, disconnect, wallet, isConnecting } = useWallet();

  const isConnected = !!wallet?.smartWallet;

  if (isConnected) {
    return (
      <div>
        <p>Connected: {wallet.smartWallet}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <button onClick={() => connect()} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect with Passkey'}
    </button>
  );
}
```

### 4. Sign a Message

```tsx
const { signMessage } = useWallet();

async function handleSign() {
  try {
    const result = await signMessage('Hello from LazorKit!');
    console.log('Signature:', result.signature);
  } catch (error) {
    console.error('Signing failed:', error);
  }
}
```

### 5. Send Gasless Transaction

```tsx
import { SystemProgram, PublicKey } from '@solana/web3.js';
import { useWallet } from '@lazorkit/wallet';

function SendTransaction() {
  const { signAndSendTransaction, wallet } = useWallet();

  const smartWalletPubkey = wallet?.smartWallet
    ? new PublicKey(wallet.smartWallet)
    : null;

  async function handleSend() {
    if (!smartWalletPubkey) return;

    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: smartWalletPubkey, // self-transfer for demo
      lamports: 100,
    });

    // Paymaster pays all fees - user signs with passkey only
    const signature = await signAndSendTransaction({
      instructions: [instruction],
      transactionOptions: {
        computeUnitLimit: 200_000,
      },
    });

    console.log('Transaction:', signature);
  }

  return (
    <button onClick={handleSend}>
      Send Gasless Transaction
    </button>
  );
}
```

---

## SDK 2.0.1 API Reference

### useWallet() Hook

```typescript
const {
  wallet,              // WalletInfo | null - Contains smartWallet address
  isConnecting,        // boolean - Connection in progress
  isSigning,           // boolean - Signing in progress
  error,               // Error | null - Last error
  connect,             // () => Promise<WalletInfo>
  disconnect,          // () => Promise<void>
  signMessage,         // (message: string) => Promise<SignResult>
  signAndSendTransaction, // (payload) => Promise<string>
} = useWallet();
```

### WalletInfo Type

```typescript
interface WalletInfo {
  credentialId: string;      // WebAuthn credential ID
  passkeyPubkey: number[];   // Passkey public key bytes
  smartWallet: string;       // Smart wallet address (base58)
  platform: string;          // Device platform
}
```

### SignAndSendTransaction Payload

```typescript
interface Payload {
  instructions: TransactionInstruction[];
  transactionOptions?: {
    computeUnitLimit?: number;
    clusterSimulation?: 'devnet' | 'mainnet';
  };
}
```

---

## Features Demonstrated

| Feature | Description |
|---------|-------------|
| **Passkey Auth** | WebAuthn login with Face ID / Touch ID / Windows Hello |
| **Smart Wallet** | PDA-based wallet controlled by passkey |
| **Gasless Tx** | Paymaster sponsors all transaction fees |
| **Sign Message** | Cryptographic message signing |
| **Activity Log** | Real-time visibility into what happens |

---

## LazorKit Bounty

This project was built for the [LazorKit Bounty](https://docs.lazorkit.com):

> **Goal:** Help Solana developers get started with LazorKit SDK by creating clear, practical integration examples.

### Deliverables

- **Working Example Repo** - Complete Next.js integration
- **Quick-start Guide** - Get running in 5 minutes
- **Step-by-step Tutorials** - See `/docs/tutorials/`
- **Live Demo** - Try it without installing anything

### Judging Criteria

| Criteria | Weight | Implementation |
|----------|--------|----------------|
| **Clarity & Usefulness** | 40% | Interactive demo + copy-paste code snippets |
| **SDK Integration** | 30% | Real passkey auth + gasless transactions |
| **Code Structure** | 30% | Clean, typed, well-organized codebase |

---

## Tutorials

1. [Passkey Wallet Creation](docs/tutorials/01-passkey-wallet.md) - Create your first passkey wallet
2. [Gasless Transactions](docs/tutorials/02-gasless-transactions.md) - Send transactions without paying gas

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Blockchain:** Solana (Devnet)
- **SDK:** LazorKit Wallet v2.0.1

---

## Resources

- [LazorKit Documentation](https://docs.lazorkit.com)
- [LazorKit GitHub](https://github.com/lazor-kit/lazor-kit)
- [LazorKit Telegram](https://t.me/lazorkit)
- [Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet)

---

## License

MIT

---

<div align="center">

**Built for Solana developers**

</div>
