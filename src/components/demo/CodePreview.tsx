'use client';

import { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';

const CODE_EXAMPLES = {
  setup: {
    title: '1. Setup Provider',
    description: 'Wrap your app with LazorkitProvider',
    language: 'tsx',
    code: `// app/layout.tsx
import { LazorkitProvider } from '@lazorkit/wallet';

export default function RootLayout({ children }) {
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
}`,
  },
  connect: {
    title: '2. Connect Wallet',
    description: 'Use the useWallet hook to connect',
    language: 'tsx',
    code: `import { useWallet } from '@lazorkit/wallet';

function ConnectButton() {
  const { connect, disconnect, isConnected, wallet } = useWallet();

  if (isConnected) {
    return (
      <div>
        <p>Connected: {wallet.smartWallet}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <button onClick={connect}>
      Connect with Passkey
    </button>
  );
}`,
  },
  signMessage: {
    title: '3. Sign Message',
    description: 'Sign messages for authentication',
    language: 'tsx',
    code: `import { useWallet } from '@lazorkit/wallet';

function SignDemo() {
  const { signMessage, isConnected } = useWallet();

  const handleSign = async () => {
    const result = await signMessage('Hello LazorKit!');
    console.log('Signature:', result.signature);
  };

  return (
    <button onClick={handleSign} disabled={!isConnected}>
      Sign Message
    </button>
  );
}`,
  },
  transaction: {
    title: '4. Gasless Transaction',
    description: 'Send transactions without paying gas',
    language: 'tsx',
    code: `import { useWallet } from '@lazorkit/wallet';
import { SystemProgram, PublicKey } from '@solana/web3.js';

function SendDemo() {
  const { signAndSendTransaction, smartWalletPubkey } = useWallet();

  const handleSend = async () => {
    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: new PublicKey('RECIPIENT_ADDRESS'),
      lamports: 1000000, // 0.001 SOL
    });

    // Gas is paid by Paymaster - user pays $0
    const signature = await signAndSendTransaction({
      instructions: [instruction],
      transactionOptions: {
        feeToken: 'USDC',  // Paymaster sponsors
        computeUnitLimit: 200_000,
      },
    });

    console.log('Tx:', signature);
  };

  return <button onClick={handleSend}>Send (Gasless)</button>;
}`,
  },
};

type CodeKey = keyof typeof CODE_EXAMPLES;

export function CodePreview() {
  const [activeTab, setActiveTab] = useState<CodeKey>('setup');
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(CODE_EXAMPLES[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 px-4 bg-zinc-900/30">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Code2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Copy-Paste Ready</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Integration Code</h2>
          <p className="text-zinc-400">
            Copy these snippets directly into your project. That's all you need.
          </p>
        </div>

        {/* Code Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-zinc-800 bg-zinc-900/50">
            {(Object.keys(CODE_EXAMPLES) as CodeKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? 'text-white border-b-2 border-violet-500 bg-zinc-800/50'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {CODE_EXAMPLES[key].title}
              </button>
            ))}
          </div>

          {/* Code Content */}
          <div className="relative">
            {/* Description */}
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <p className="text-sm text-zinc-400">{CODE_EXAMPLES[activeTab].description}</p>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Code Block */}
            <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
              <code className="text-zinc-300 font-mono">
                {CODE_EXAMPLES[activeTab].code}
              </code>
            </pre>
          </div>
        </div>

        {/* Quick Install */}
        <div className="mt-8 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
          <p className="text-sm text-zinc-400 mb-2">Quick install:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 text-emerald-400 font-mono text-sm">
              npm install @lazorkit/wallet @solana/web3.js
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText('npm install @lazorkit/wallet @solana/web3.js');
              }}
              className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <Copy className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
