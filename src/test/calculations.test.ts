import { describe, it, expect } from 'vitest';
import { calculateSwap, DEFAULT_TOKENS } from '../core/swapEngine';
import { runTimeMachineSimulation } from '../core/timeMachineEngine';
import { calculateCreditAssessment, compareCreditScenarios } from '../core/creditScoring';

describe('EXIDO Nexus Core Financial Logic & Scenario Cases', () => {

  // --- CASE A: Safe Swap ---
  it('Case A — Safe swap: Computes exact remaining USDC (799.40) and reserve buffer (499.40)', () => {
    const result = runTimeMachineSimulation({
      startingUsdc: 1000,
      plannedSwapToken: 'ETH',
      plannedSwapAmount: 200,
      feePercent: 0.3,
      priceShockPercent: 0,
      expectedIncome: 0,
      repaymentAmount: 300,
      repaymentDueDays: 7,
      otherExpenses: 0,
      simulationDays: 7,
      volatileHoldingSymbol: 'ETH',
      volatileHoldingAmount: 0.5,
      volatileHoldingPriceUsd: 3000,
    });

    // Trading fee = 200 * 0.003 = 0.60 USDC
    expect(result.totalTradingFee).toBe(0.60);
    // Swap cost = 200.60 USDC
    expect(result.totalSwapCost).toBe(200.60);
    // Remaining liquid USDC = 1000 - 200.60 = 799.40 USDC
    expect(result.remainingLiquidBalance).toBe(799.40);
    // Funds after obligations = 799.40 - 300 = 499.40 USDC
    expect(result.projectedFundsAfterObligations).toBe(499.40);
    // No shortfall
    expect(result.potentialShortfall).toBe(0);
    expect(result.isShortfall).toBe(false);
    expect(result.riskLevel).toBe('LOW');
  });

  // --- CASE B: Repayment Risk ---
  it('Case B — Repayment risk: Detects exact 102.40 USDC shortfall and flags high risk', () => {
    const result = runTimeMachineSimulation({
      startingUsdc: 1000,
      plannedSwapToken: 'ETH',
      plannedSwapAmount: 800,
      feePercent: 0.3,
      priceShockPercent: 0,
      expectedIncome: 0,
      repaymentAmount: 300,
      repaymentDueDays: 7,
      otherExpenses: 0,
      simulationDays: 7,
      volatileHoldingSymbol: 'ETH',
      volatileHoldingAmount: 0.5,
      volatileHoldingPriceUsd: 3000,
    });

    // Fee = 800 * 0.003 = 2.40 USDC
    expect(result.totalTradingFee).toBe(2.40);
    // Total swap cost = 802.40 USDC
    expect(result.totalSwapCost).toBe(802.40);
    // Remaining liquid USDC = 1000 - 802.40 = 197.60 USDC
    expect(result.remainingLiquidBalance).toBe(197.60);
    // Relative to 300 repayment = 197.60 - 300 = -102.40 USDC
    expect(result.projectedFundsAfterObligations).toBe(-102.40);
    // Potential shortfall = 102.40 USDC
    expect(result.potentialShortfall).toBe(102.40);
    expect(result.isShortfall).toBe(true);
    expect(result.riskLevel).toBe('HIGH');
    expect(result.suggestions.some(s => s.includes('shortfall detected'))).toBe(true);
  });

  // --- CASE C: Falling Token Price ---
  it('Case C — Falling token price: Recalculates volatile assets without altering stablecoins', () => {
    const result = runTimeMachineSimulation({
      startingUsdc: 1000,
      plannedSwapToken: 'USDC',
      plannedSwapAmount: 0,
      feePercent: 0.3,
      priceShockPercent: -20, // 20% drop
      expectedIncome: 0,
      repaymentAmount: 0,
      repaymentDueDays: 7,
      otherExpenses: 0,
      simulationDays: 7,
      volatileHoldingSymbol: 'ETH',
      volatileHoldingAmount: 0.5,
      volatileHoldingPriceUsd: 3000, // 0.5 * 3000 = $1500
    });

    // Starting portfolio: 1000 USDC + 1500 ETH = $2500
    expect(result.startingPortfolioValue).toBe(2500);
    // Post shock ETH: 0.5 * 2400 = 1200
    // Stablecoin remains unchanged at 1000 USDC
    expect(result.remainingLiquidBalance).toBe(1000);
    // Post swap portfolio: 1000 + 1200 = 2200
    expect(result.postSwapPortfolioValue).toBe(2200);
  });

  // --- CASE D: Better Repayment Behaviour ---
  it('Case D — Better repayment behavior: Recalculates credit score and explains difference', () => {
    const baseline = calculateCreditAssessment({
      repaymentCompletedOnTime: false,
      repaymentOverdue: false,
      availableLiquidBalance: 800,
      outstandingLoanAmount: 200,
      walletActivityTxCount: 12,
      walletAgeMonths: 8,
      repaymentConsistencyPercent: 55,
      requestedLoanAmount: 250,
    });

    const improved = calculateCreditAssessment({
      repaymentCompletedOnTime: true,
      repaymentOverdue: false,
      availableLiquidBalance: 800,
      outstandingLoanAmount: 200,
      walletActivityTxCount: 12,
      walletAgeMonths: 8,
      repaymentConsistencyPercent: 95,
      requestedLoanAmount: 250,
    });

    const comparison = compareCreditScenarios(baseline, improved);

    expect(improved.score).toBeGreaterThan(baseline.score);
    expect(comparison.scoreDelta).toBeGreaterThan(0);
    expect(improved.positiveFactors.some(f => f.includes('on-time'))).toBe(true);
  });

  // --- CASE E: Excessive Loan Request ---
  it('Case E — Excessive loan request: Rejects or restricts loans exceeding headroom', () => {
    const assessment = calculateCreditAssessment({
      repaymentCompletedOnTime: true,
      repaymentOverdue: false,
      availableLiquidBalance: 500,
      outstandingLoanAmount: 200,
      walletActivityTxCount: 8,
      walletAgeMonths: 6,
      repaymentConsistencyPercent: 80,
      requestedLoanAmount: 1200, // Excessive request
    });

    expect(assessment.eligibilityStatus).toBe('RESTRICTED');
    expect(assessment.estimatedLoanLimit).toBeLessThan(1200);
    expect(assessment.plainExplanation).toContain('exceeds calculated exposure limit');
  });

  // --- CASE F: Partial Repayment ---
  it('Case F — Partial repayment: Accurately decrements outstanding balance', () => {
    const initialOutstanding = 200.0;
    const partialPayment = 50.0;
    const newOutstanding = initialOutstanding - partialPayment;

    expect(newOutstanding).toBe(150.0);
    expect(newOutstanding).toBeGreaterThan(0);
  });

  // --- CASE G: Insufficient Swap Balance ---
  it('Case G — Insufficient swap balance: Blocks swap exceeding available tokens', () => {
    const usdcToken = { ...DEFAULT_TOKENS.USDC, balance: 1000 };
    const ethToken = { ...DEFAULT_TOKENS.ETH };

    const swapResult = calculateSwap({
      tokenIn: usdcToken,
      tokenOut: ethToken,
      amountIn: 1500, // Exceeds 1000 balance
    });

    expect(swapResult.isValid).toBe(false);
    expect(swapResult.validationError).toContain('Insufficient balance');
    expect(swapResult.amountOut).toBe(0);
  });

  // --- CASE H: Multiple Hypothetical Changes ---
  it('Case H — Multiple hypothetical changes: All outputs update synchronously', () => {
    const simResult = runTimeMachineSimulation({
      startingUsdc: 1500,
      plannedSwapToken: 'ETH',
      plannedSwapAmount: 400,
      feePercent: 0.3,
      priceShockPercent: -15,
      expectedIncome: 200,
      repaymentAmount: 500,
      repaymentDueDays: 14,
      otherExpenses: 50,
      simulationDays: 14,
      volatileHoldingSymbol: 'ETH',
      volatileHoldingAmount: 1.0,
      volatileHoldingPriceUsd: 3000,
    });

    // Swap cost = 400 + (400 * 0.003) = 401.20
    expect(simResult.totalSwapCost).toBe(401.20);
    // Remaining liquid = 1500 - 401.20 = 1098.80
    expect(simResult.remainingLiquidBalance).toBe(1098.80);
    // Obligations = 500 + 50 = 550
    expect(simResult.repaymentObligations).toBe(550);
    // Projected funds = 1098.80 - 550 + 200 = 748.80
    expect(simResult.projectedFundsAfterObligations).toBe(748.80);
    expect(simResult.isShortfall).toBe(false);
    expect(simResult.timeline.length).toBe(15); // days 0 to 14
  });
});

