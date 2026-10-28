export type TokenSymbol = 'USDC' | 'USDT' | 'ETH' | 'WBTC' | 'NEX' | string;

export interface Token {
  id?: string;
  symbol: TokenSymbol;
  name: string;
  decimals: number;
  balance: number;
  priceUsd: number;
  isStable: boolean;
  color: string;
  icon?: string;
}

export type TransactionType = 'SWAP' | 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'DEPOSIT';
export type TransactionStatus = 'CONFIRMED' | 'PENDING' | 'FAILED';
export type TransactionSource = 'SIMULATION' | 'DEMO' | 'SUPABASE' | 'ONCHAIN';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  title: string;
  tokenIn?: TokenSymbol;
  tokenOut?: TokenSymbol;
  amountIn?: number;
  amountOut?: number;
  fee: number;
  timestamp: string;
  status: TransactionStatus;
  source: TransactionSource;
  txHash?: string;
  network?: string;
  details?: Record<string, any>;
}

export interface LoanRecord {
  id: string;
  principal: number;
  outstandingBalance: number;
  interestRatePercent: number; // e.g. 4.5%
  durationDays: number;
  dueDate: string;
  dueDateTimestamp: number;
  status: 'ACTIVE' | 'REPAID' | 'OVERDUE';
  createdAt: string;
  lastRepaymentDate?: string;
  source: 'DEMO' | 'SUPABASE' | 'ONCHAIN' | 'SIMULATION';
}

export interface PlannedTransaction {
  id: string;
  type: 'SWAP' | 'INCOME' | 'EXPENSE';
  title: string;
  amount: number;
  tokenSymbol: TokenSymbol;
  targetTokenSymbol?: TokenSymbol;
  dueDay: number; // e.g., Day 1 to 30
  createdAt?: string;
}

export interface TimeMachineInputs {
  startingUsdc: number;
  plannedSwapToken: TokenSymbol;
  plannedSwapAmount: number;
  feePercent: number; // default 0.3%
  priceShockPercent: number; // e.g. -20 for 20% drop
  expectedIncome: number;
  repaymentAmount: number;
  repaymentDueDays: number;
  otherExpenses: number;
  simulationDays: 7 | 14 | 30;
  volatileHoldingSymbol: TokenSymbol;
  volatileHoldingAmount: number;
  volatileHoldingPriceUsd: number;
}

export interface TimeMachineTimelinePoint {
  day: number;
  dateStr: string;
  liquidUsdc: number;
  volatileValueUsd: number;
  totalPortfolioValue: number;
  obligationDue: number;
  netReserve: number;
}

export interface TimeMachineResult {
  currentPortfolioValue: number;
  postSwapPortfolioValue: number;
  remainingLiquidBalance: number;
  totalTradingFee: number;
  totalSwapCost: number;
  repaymentObligations: number;
  projectedFundsAfterObligations: number;
  potentialShortfall: number;
  minBalanceRequired: number;
  isShortfall: boolean;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  suggestions: string[];
  timeline: TimeMachineTimelinePoint[];
  startingPortfolioValue: number;
}

export interface CreditScoreFactor {
  id: string;
  name: string;
  weightPercent: number;
  rawValue: number | boolean | string;
  normalizedScore: number; // 0 to 100
  weightedContribution: number;
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  explanation: string;
}

export interface CreditSimulatorInputs {
  repaymentCompletedOnTime: boolean;
  repaymentOverdue: boolean;
  availableLiquidBalance: number; // in USDC
  outstandingLoanAmount: number; // in USDC
  walletActivityTxCount: number; // number of transactions
  walletAgeMonths: number; // months of wallet history
  repaymentConsistencyPercent: number; // 0 to 100%
  requestedLoanAmount: number; // USDC
}

export interface CreditAssessmentResult {
  score: number; // 0 to 100
  scoreBand: 'TIER_1_EXCELLENT' | 'TIER_2_GOOD' | 'TIER_3_MODERATE' | 'TIER_4_HIGH_RISK';
  eligibilityStatus: 'APPROVED' | 'RESTRICTED' | 'REJECTED';
  estimatedLoanLimit: number;
  factors: CreditScoreFactor[];
  positiveFactors: string[];
  negativeFactors: string[];
  plainExplanation: string;
  maxPermittedExposure: number;
  affordabilityRatio: number;
}

export interface CreditComparison {
  baseline: CreditAssessmentResult;
  simulated: CreditAssessmentResult;
  scoreDelta: number;
  limitDelta: number;
  statusChanged: boolean;
}

export interface SwapCalculationResult {
  amountIn: number;
  amountOut: number;
  exchangeRate: number;
  feePercent: number;
  feeAmount: number;
  minimumReceived: number;
  slippageTolerancePercent: number;
  isValid: boolean;
  validationError?: string;
  priceImpactPercent: number;
}

// User-Specific Profile & Scenario Management
export interface UserFinancialProfileData {
  stablecoinBalance: number;
  tokens: Record<string, Token>;
  plannedTransactions: PlannedTransaction[];
  loans: LoanRecord[];
  creditInputs: CreditSimulatorInputs;
  timeMachineInputs: TimeMachineInputs;
  notes?: string;
  updatedAt?: string;
}

export interface SavedScenarioRecord {
  id: string;
  userId: string;
  name: string;
  description: string;
  data: UserFinancialProfileData;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceMode = 'USER_WORKSPACE' | 'DEMO_MODE';
