import { Token, TokenSymbol, LoanRecord, TransactionRecord } from '../core/types';

export const INITIAL_DEMO_TOKENS: Record<TokenSymbol, Token> = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    balance: 1000.0,
    priceUsd: 1.0,
    isStable: true,
    color: '#2775CA',
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
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    balance: 350.0,
    priceUsd: 1.0,
    isStable: true,
    color: '#26A17B',
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    balance: 0.015,
    priceUsd: 65000.0,
    isStable: false,
    color: '#F7931A',
  },
  NEX: {
    symbol: 'NEX',
    name: 'Nexus Token',
    decimals: 18,
    balance: 200.0,
    priceUsd: 12.50,
    isStable: false,
    color: '#06B6D4',
  },
};

export const INITIAL_DEMO_LOANS: LoanRecord[] = [
  {
    id: 'loan_demo_001',
    principal: 200.0,
    outstandingBalance: 200.0,
    interestRatePercent: 4.5,
    durationDays: 30,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    dueDateTimestamp: Date.now() + 7 * 86400000,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 23 * 86400000).toISOString(),
    source: 'DEMO',
  },
];

export const INITIAL_DEMO_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx_demo_001',
    type: 'LOAN_DISBURSEMENT',
    title: 'Credit Facility Drawdown',
    amountIn: 200.0,
    tokenIn: 'USDC',
    fee: 0,
    timestamp: new Date(Date.now() - 23 * 86400000).toISOString(),
    status: 'CONFIRMED',
    source: 'DEMO',
    details: {
      loanId: 'loan_demo_001',
      interestRate: '4.5%',
      tenure: '30 Days',
    },
  },
  {
    id: 'tx_demo_002',
    type: 'SWAP',
    title: 'ClearSwap USDC -> ETH',
    tokenIn: 'USDC',
    tokenOut: 'ETH',
    amountIn: 300.0,
    amountOut: 0.0997,
    fee: 0.90,
    timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
    status: 'CONFIRMED',
    source: 'DEMO',
    details: {
      rate: '1 ETH = 3,000 USDC',
      slippage: '0.5%',
    },
  },
  {
    id: 'tx_demo_003',
    type: 'LOAN_REPAYMENT',
    title: 'Partial Loan Repayment',
    tokenIn: 'USDC',
    amountIn: 50.0,
    fee: 0,
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'CONFIRMED',
    source: 'DEMO',
    details: {
      loanId: 'loan_demo_001',
      remainingBalance: '150 USDC',
    },
  },
];

