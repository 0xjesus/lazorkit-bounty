# LazorKit Developer Playground

<div align="center">

![LazorKit](https://img.shields.io/badge/LazorKit-Developer%20Playground-8b5cf6?style=for-the-badge)

**Learn LazorKit in 5 minutes**

*Interactive demo • Copy-paste code • Real transactions*

[![Live Demo](https://img.shields.io/badge/Live-Demo-emerald?style=flat-square)](https://lazorkit-subscription-starter.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=flat-square)](https://solana.com/)

</div>

---

## What is this?

An **interactive playground** for developers to learn LazorKit SDK. Try passkey authentication and gasless transactions in real-time, then copy the code into your project.

**This is NOT a product** — it's an educational starter template.

---

## 🚀 Try it Live

**[→ Open Playground](https://lazorkit-subscription-starter.vercel.app)**

1. Click "Connect with Passkey"
2. Sign a message
3. Send a gasless transaction
4. Watch the log panel
5. Copy the code

---

## ⚡ Quick Start

```bash
# Clone
git clone https://github.com/your-username/lazorkit-playground.git
cd lazorkit-playground

# Install
npm install

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 What's Inside

```
src/
├── components/
│   ├── demo/
│   │   ├── HeroSection.tsx      # Landing hero
│   │   ├── PlaygroundSection.tsx # Interactive demo
│   │   └── CodePreview.tsx      # Copy-paste snippets
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── wallet/
│       └── LazorKitProvider.tsx # SDK setup
├── config/
│   └── lazorkit.ts              # Configuration
└── app/
    ├── layout.tsx               # Root layout
    └── page.tsx                 # Main page
```

---

## 🔧 Core Integration

### 1. Install

```bash
npm install @lazorkit/wallet @solana/web3.js
```

### 2. Setup Provider

```tsx
// layout.tsx
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

### 3. Connect Wallet

```tsx
import { useWallet } from '@lazorkit/wallet';

function App() {
  const { connect, isConnected, wallet } = useWallet();

  return (
    <button onClick={connect}>
      {isConnected ? wallet.smartWallet : 'Connect'}
    </button>
  );
}
```

### 4. Sign Message

```tsx
const { signMessage } = useWallet();

const result = await signMessage('Hello LazorKit!');
console.log(result.signature);
```

### 5. Gasless Transaction

```tsx
import { SystemProgram } from '@solana/web3.js';

const { signAndSendTransaction, smartWalletPubkey } = useWallet();

const signature = await signAndSendTransaction({
  instructions: [
    SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: recipientAddress,
      lamports: 1000000,
    })
  ],
  transactionOptions: {
    feeToken: 'USDC', // Paymaster pays gas
  }
});
```

---

## 📚 Features Demonstrated

| Feature | Description |
|---------|-------------|
| **Passkey Auth** | WebAuthn login with Face ID / Touch ID / Windows Hello |
| **Smart Wallet** | PDA-based wallet controlled by passkey |
| **Gasless Tx** | Paymaster sponsors all transaction fees |
| **Sign Message** | Cryptographic message signing |
| **Real-time Log** | See exactly what happens under the hood |
| **Copy-paste Code** | Ready-to-use snippets for your project |

---

## 🎯 LazorKit Bounty

This project was built for the [LazorKit Bounty](https://docs.lazorkit.com):

> **Goal:** Help Solana developers get started with LazorKit SDK by creating clear, practical integration examples.

### Judging Criteria Met

- ✅ **Clarity & Usefulness (40%)** — Interactive demo + copy-paste code
- ✅ **SDK Integration (30%)** — Real passkey auth + gasless transactions
- ✅ **Code Structure (30%)** — Clean, reusable starter template

---

## 🔗 Resources

- [LazorKit Docs](https://docs.lazorkit.com)
- [LazorKit GitHub](https://github.com/lazor-kit/lazor-kit)
- [LazorKit Telegram](https://t.me/lazorkit)

---

## 📄 License

MIT

---

<div align="center">

**Built for Solana developers** 💜

</div>
