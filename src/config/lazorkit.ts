/**
 * LazorKit SDK Configuration
 *
 * This file contains all configuration for the LazorKit SDK.
 * Environment variables are used for sensitive data in production.
 */

export const LAZORKIT_CONFIG = {
  // Solana RPC endpoint - Using Devnet for development
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',

  // LazorKit authentication portal
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL || 'https://portal.lazor.sh',

  // Paymaster configuration for gasless transactions
  paymasterConfig: {
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || 'https://kora.devnet.lazorkit.com',
    // apiKey: process.env.NEXT_PUBLIC_PAYMASTER_API_KEY, // Optional: Add your API key for production
  },

  // Cluster for transaction simulation
  clusterSimulation: 'devnet' as const,
} as const;

// USDC Token addresses
export const TOKEN_ADDRESSES = {
  // Devnet USDC (Circle's official devnet faucet)
  USDC_DEVNET: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
  // Mainnet USDC
  USDC_MAINNET: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
} as const;

// Get current USDC address based on network
export const getUsdcAddress = () => {
  return LAZORKIT_CONFIG.clusterSimulation === 'devnet'
    ? TOKEN_ADDRESSES.USDC_DEVNET
    : TOKEN_ADDRESSES.USDC_MAINNET;
};
