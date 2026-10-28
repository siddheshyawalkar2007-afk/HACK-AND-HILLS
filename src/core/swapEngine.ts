import { Token, TokenSymbol, SwapCalculationResult } from './types';

export const DEFAULT_TOKENS: Record<TokenSymbol, Token> = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    balance: 1000.0,
    priceUsd: 1.0,
    isStable: true,
    color: '#2775CA',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    balance: 500.0,
    priceUsd: 1.0,
    isStable: true,
    color: '#26A17B',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    balance: 0.50,
    priceUsd: 3000.0,
    isStable: false,
    color: '#627EEA',
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    balance: 0.02,
    priceUsd: 65000.0,
    isStable: false,
    color: '#F7931A',
  },
  NEX: {
    symbol: 'NEX',
    name: 'Nexus Token',
    decimals: 18,
    balance: 250.0,
    priceUsd: 12.50,
    isStable: false,
    color: '#06B6D4',
  },
};

/**
 * Calculates swap output, trading fee, slippage, and validates available balances.
 */
export function calculateSwap(params: {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: number;
  slippageTolerancePercent?: number; // e.g. 0.5%
  feePercent?: number; // e.g. 0.3%
}): SwapCalculationResult {
  const {
    tokenIn,
    tokenOut,
    amountIn,
    slippageTolerancePercent = 0.5,
    feePercent = 0.3,
  } = params;

  if (amountIn <= 0 || isNaN(amountIn)) {
    return {
      amountIn: 0,
      amountOut: 0,
      exchangeRate: tokenIn.priceUsd / tokenOut.priceUsd,
      feePercent,
      feeAmount: 0,
      minimumReceived: 0,
      slippageTolerancePercent,
      isValid: false,
      validationError: 'Enter an amount greater than 0',
      priceImpactPercent: 0,
    };
  }

  // Case G validation: Prevent swapping more tokens than the user owns
  if (amountIn > tokenIn.balance) {
    return {
      amountIn,
      amountOut: 0,
      exchangeRate: tokenIn.priceUsd / tokenOut.priceUsd,
      feePercent,
      feeAmount: 0,
      minimumReceived: 0,
      slippageTolerancePercent,
      isValid: false,
      validationError: `Insufficient balance: you hold ${tokenIn.balance.toLocaleString()} ${tokenIn.symbol}, but attempted to swap ${amountIn.toLocaleString()} ${tokenIn.symbol}.`,
      priceImpactPercent: 0,
    };
  }

  // Deterministic calculation
  const feeAmount = Number((amountIn * (feePercent / 100)).toFixed(6));
  const effectiveIn = amountIn - feeAmount;

  // Rate = (Price of tokenIn in USD) / (Price of tokenOut in USD)
  const exchangeRate = tokenIn.priceUsd / tokenOut.priceUsd;
  const amountOut = Number((effectiveIn * exchangeRate).toFixed(6));

  const slippageMultiplier = 1 - (slippageTolerancePercent / 100);
  const minimumReceived = Number((amountOut * slippageMultiplier).toFixed(6));

  // Small simulated price impact based on trade size
  const priceImpactPercent = Number(Math.min(amountIn / 100000, 2.5).toFixed(3));

  return {
    amountIn,
    amountOut,
    exchangeRate,
    feePercent,
    feeAmount,
    minimumReceived,
    slippageTolerancePercent,
    isValid: true,
    priceImpactPercent,
  };
}

