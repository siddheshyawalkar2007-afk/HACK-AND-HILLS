import {
  CreditSimulatorInputs,
  CreditAssessmentResult,
  CreditScoreFactor,
  CreditComparison,
} from './types';

/**
 * Weights:
 * 1. Repayment Consistency: 35%
 * 2. Available Liquidity: 25%
 * 3. Existing Debt Exposure: 20%
 * 4. Wallet Activity & History: 10%
 * 5. Wallet Age: 10%
 * Total: 100%
 */
export const SCORING_WEIGHTS = {
  REPAYMENT_CONSISTENCY: 0.35,
  AVAILABLE_LIQUIDITY: 0.25,
  DEBT_EXPOSURE: 0.20,
  WALLET_ACTIVITY: 0.10,
  WALLET_AGE: 0.10,
};

export const MAX_DEMO_LOAN_CAP = 1500; // USDC platform demo ceiling

/**
 * Normalizes input factors and computes an explainable credit score (0-100)
 * and loan eligibility limits.
 */
export function calculateCreditAssessment(inputs: CreditSimulatorInputs): CreditAssessmentResult {
  const {
    repaymentCompletedOnTime,
    repaymentOverdue,
    availableLiquidBalance,
    outstandingLoanAmount,
    walletActivityTxCount,
    walletAgeMonths,
    repaymentConsistencyPercent,
    requestedLoanAmount,
  } = inputs;

  const factors: CreditScoreFactor[] = [];
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];

  // 1. Repayment Consistency Factor (35%)
  let normalizedRepaymentScore = repaymentConsistencyPercent;
  let repaymentStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'GOOD';
  let repaymentExplanation = 'Consistent past repayment performance.';

  if (repaymentOverdue) {
    normalizedRepaymentScore = Math.min(normalizedRepaymentScore, 18);
    repaymentStatus = 'POOR';
    repaymentExplanation = 'Active overdue loan detected! Overdue status triggers severe credit risk penalty.';
    negativeFactors.push('Unresolved overdue repayment drastically impairs credit assessment.');
  } else if (repaymentCompletedOnTime) {
    normalizedRepaymentScore = Math.max(normalizedRepaymentScore, 92);
    repaymentStatus = 'EXCELLENT';
    repaymentExplanation = 'All scheduled loan obligations completed promptly on or before due date.';
    positiveFactors.push('Impeccable on-time repayment track record.');
  } else {
    if (normalizedRepaymentScore >= 75) {
      repaymentStatus = 'GOOD';
      positiveFactors.push('Solid history of honoring debt commitments.');
    } else if (normalizedRepaymentScore >= 50) {
      repaymentStatus = 'FAIR';
      negativeFactors.push('Occasional delayed repayments reduce consistency rating.');
    } else {
      repaymentStatus = 'POOR';
      negativeFactors.push('Irregular repayment history indicates repayment risk.');
    }
  }

  normalizedRepaymentScore = Math.max(0, Math.min(100, normalizedRepaymentScore));
  const repaymentContribution = Number((normalizedRepaymentScore * SCORING_WEIGHTS.REPAYMENT_CONSISTENCY).toFixed(2));

  factors.push({
    id: 'repayment_consistency',
    name: 'Repayment Consistency',
    weightPercent: 35,
    rawValue: repaymentOverdue ? 'Overdue' : repaymentCompletedOnTime ? 'On-Time (100%)' : `${repaymentConsistencyPercent}%`,
    normalizedScore: normalizedRepaymentScore,
    weightedContribution: repaymentContribution,
    status: repaymentStatus,
    explanation: repaymentExplanation,
  });

  // 2. Available Liquidity Factor (25%)
  // Scale: 0 -> 0 pts, 500 -> 50 pts, 1000 -> 80 pts, 1500+ -> 100 pts
  let normalizedLiquidity = Math.min(100, Math.round((availableLiquidBalance / 1500) * 100));
  let liquidityStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'GOOD';
  let liquidityExplanation = '';

  if (availableLiquidBalance >= 1200) {
    liquidityStatus = 'EXCELLENT';
    liquidityExplanation = `Robust cash cushion of ${availableLiquidBalance.toLocaleString()} USDC provides ample debt service buffer.`;
    positiveFactors.push(`High liquid reserves (${availableLiquidBalance.toLocaleString()} USDC) support borrowing capacity.`);
  } else if (availableLiquidBalance >= 600) {
    liquidityStatus = 'GOOD';
    liquidityExplanation = `Adequate liquidity buffer (${availableLiquidBalance.toLocaleString()} USDC).`;
    positiveFactors.push('Sufficient liquid reserves to absorb modest volatility.');
  } else if (availableLiquidBalance >= 250) {
    liquidityStatus = 'FAIR';
    liquidityExplanation = `Moderate liquidity (${availableLiquidBalance.toLocaleString()} USDC). Limited capacity for large obligations.`;
    negativeFactors.push('Sub-optimal liquid balance limits allowable exposure.');
  } else {
    liquidityStatus = 'POOR';
    liquidityExplanation = `Low liquidity (${availableLiquidBalance.toLocaleString()} USDC). High vulnerability to debt distress.`;
    negativeFactors.push('Depleted liquid balance creates immediate liquidity risk.');
  }

  const liquidityContribution = Number((normalizedLiquidity * SCORING_WEIGHTS.AVAILABLE_LIQUIDITY).toFixed(2));
  factors.push({
    id: 'available_liquidity',
    name: 'Available Liquidity',
    weightPercent: 25,
    rawValue: `${availableLiquidBalance.toLocaleString()} USDC`,
    normalizedScore: normalizedLiquidity,
    weightedContribution: liquidityContribution,
    status: liquidityStatus,
    explanation: liquidityExplanation,
  });

  // 3. Existing Debt Exposure Factor (20%)
  // Lower debt relative to liquidity is better.
  const debtToLiquidityRatio = availableLiquidBalance > 0
    ? outstandingLoanAmount / availableLiquidBalance
    : outstandingLoanAmount > 0 ? 3.0 : 0;

  let normalizedDebt = 100;
  let debtStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = 'EXCELLENT';
  let debtExplanation = '';

  if (outstandingLoanAmount === 0) {
    normalizedDebt = 100;
    debtStatus = 'EXCELLENT';
    debtExplanation = 'Zero outstanding debt obligations.';
    positiveFactors.push('Unencumbered balance sheet with no active liabilities.');
  } else if (debtToLiquidityRatio <= 0.3) {
    normalizedDebt = 85;
    debtStatus = 'GOOD';
    debtExplanation = `Low debt load (${outstandingLoanAmount} USDC, ${(debtToLiquidityRatio * 100).toFixed(0)}% of liquidity).`;
    positiveFactors.push('Manageable debt-to-liquidity ratio under 30%.');
  } else if (debtToLiquidityRatio <= 0.7) {
    normalizedDebt = 60;
    debtStatus = 'FAIR';
    debtExplanation = `Moderate leverage (${outstandingLoanAmount} USDC, ${(debtToLiquidityRatio * 100).toFixed(0)}% of liquidity).`;
    negativeFactors.push(`Existing debt of ${outstandingLoanAmount} USDC absorbs significant borrowing headroom.`);
  } else {
    normalizedDebt = Math.max(10, Math.round(100 - debtToLiquidityRatio * 40));
    debtStatus = 'POOR';
    debtExplanation = `High debt exposure (${outstandingLoanAmount} USDC exceeds ${(debtToLiquidityRatio * 100).toFixed(0)}% of cash reserves).`;
    negativeFactors.push('High debt-to-liquidity ratio creates over-leverage concern.');
  }

  const debtContribution = Number((normalizedDebt * SCORING_WEIGHTS.DEBT_EXPOSURE).toFixed(2));
  factors.push({
    id: 'debt_exposure',
    name: 'Debt Exposure',
    weightPercent: 20,
    rawValue: `${outstandingLoanAmount.toLocaleString()} USDC`,
    normalizedScore: normalizedDebt,
    weightedContribution: debtContribution,
    status: debtStatus,
    explanation: debtExplanation,
  });

  // 4. Wallet Activity & History (10%)
  // Scale: 0 -> 15 pts, 5 -> 50 pts, 20+ -> 100 pts
  let normalizedActivity = Math.min(100, Math.max(15, Math.round((walletActivityTxCount / 20) * 100)));
  let activityStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = normalizedActivity >= 80 ? 'EXCELLENT' : normalizedActivity >= 50 ? 'GOOD' : 'FAIR';
  let activityExplanation = `${walletActivityTxCount} recorded onchain interactions.`;

  if (walletActivityTxCount >= 15) {
    positiveFactors.push(`Active onchain transaction footprint (${walletActivityTxCount} transactions).`);
  } else if (walletActivityTxCount < 5) {
    negativeFactors.push('Sparse onchain transaction history reduces behavioral confidence.');
  }

  const activityContribution = Number((normalizedActivity * SCORING_WEIGHTS.WALLET_ACTIVITY).toFixed(2));
  factors.push({
    id: 'wallet_activity',
    name: 'Wallet Activity',
    weightPercent: 10,
    rawValue: `${walletActivityTxCount} transactions`,
    normalizedScore: normalizedActivity,
    weightedContribution: activityContribution,
    status: activityStatus,
    explanation: activityExplanation,
  });

  // 5. Wallet Age (10%)
  // Scale: 0 -> 15 pts, 6 mo -> 60 pts, 12+ mo -> 100 pts
  let normalizedAge = Math.min(100, Math.max(15, Math.round((walletAgeMonths / 12) * 100)));
  let ageStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' = normalizedAge >= 80 ? 'EXCELLENT' : normalizedAge >= 50 ? 'GOOD' : 'FAIR';
  let ageExplanation = `${walletAgeMonths} months of wallet tenure.`;

  if (walletAgeMonths >= 10) {
    positiveFactors.push(`Mature wallet tenure (${walletAgeMonths} months).`);
  } else if (walletAgeMonths < 3) {
    negativeFactors.push('Young wallet address lacking multi-cycle performance data.');
  }

  const ageContribution = Number((normalizedAge * SCORING_WEIGHTS.WALLET_AGE).toFixed(2));
  factors.push({
    id: 'wallet_age',
    name: 'Wallet Age',
    weightPercent: 10,
    rawValue: `${walletAgeMonths} months`,
    normalizedScore: normalizedAge,
    weightedContribution: ageContribution,
    status: ageStatus,
    explanation: ageExplanation,
  });

  // Total Composite Score (0 to 100)
  const totalScore = Math.round(
    repaymentContribution +
    liquidityContribution +
    debtContribution +
    activityContribution +
    ageContribution
  );

  // Score Band & Illustrative Eligibility
  let scoreBand: 'TIER_1_EXCELLENT' | 'TIER_2_GOOD' | 'TIER_3_MODERATE' | 'TIER_4_HIGH_RISK';
  let maxPermittedExposure = 0;

  if (totalScore >= 80) {
    scoreBand = 'TIER_1_EXCELLENT';
    // Higher eligibility: up to 1.2x liquidity or 1,500 max cap
    maxPermittedExposure = Math.min(MAX_DEMO_LOAN_CAP, Math.round(availableLiquidBalance * 1.2) || 800);
  } else if (totalScore >= 60) {
    scoreBand = 'TIER_2_GOOD';
    // Moderate eligibility: up to 0.7x liquidity or 800 cap
    maxPermittedExposure = Math.min(800, Math.round(availableLiquidBalance * 0.7) || 450);
  } else if (totalScore >= 40) {
    scoreBand = 'TIER_3_MODERATE';
    // Limited eligibility: up to 0.35x liquidity or 300 cap
    maxPermittedExposure = Math.min(300, Math.round(availableLiquidBalance * 0.35) || 150);
  } else {
    scoreBand = 'TIER_4_HIGH_RISK';
    // Score below 40: Not eligible under demo rules
    maxPermittedExposure = 0;
  }

  // Headroom remaining after accounting for existing debt
  const estimatedLoanLimit = Math.max(0, maxPermittedExposure - outstandingLoanAmount);

  // Eligibility Status against requested loan
  let eligibilityStatus: 'APPROVED' | 'RESTRICTED' | 'REJECTED' = 'APPROVED';
  let plainExplanation = '';

  if (totalScore < 40) {
    eligibilityStatus = 'REJECTED';
    plainExplanation = `Application rejected under demo rules: Estimated credit score (${totalScore}/100) is below the minimum tier threshold of 40. Primary cause: ${repaymentOverdue ? 'Active overdue repayment obligation' : 'Insufficient liquidity and limited history'}.`;
  } else if (requestedLoanAmount > estimatedLoanLimit) {
    eligibilityStatus = 'RESTRICTED';
    plainExplanation = `Requested amount (${requestedLoanAmount.toLocaleString()} USDC) exceeds calculated exposure limit (${estimatedLoanLimit.toLocaleString()} USDC). Based on your score of ${totalScore}/100 and existing debt of ${outstandingLoanAmount} USDC, maximum permitted new borrowing is capped at ${estimatedLoanLimit} USDC.`;
  } else {
    eligibilityStatus = 'APPROVED';
    plainExplanation = `Eligible for financing: With an estimated credit score of ${totalScore}/100 (${scoreBand.replace(/_/g, ' ')}), your requested ${requestedLoanAmount} USDC is well within your available ${estimatedLoanLimit} USDC borrowing headroom.`;
  }

  const affordabilityRatio = availableLiquidBalance > 0
    ? Number((requestedLoanAmount / availableLiquidBalance).toFixed(2))
    : 99;

  return {
    score: totalScore,
    scoreBand,
    eligibilityStatus,
    estimatedLoanLimit,
    factors,
    positiveFactors,
    negativeFactors,
    plainExplanation,
    maxPermittedExposure,
    affordabilityRatio,
  };
}

/**
 * Compares baseline credit result with a simulated scenario and returns deltas.
 */
export function compareCreditScenarios(
  baseline: CreditAssessmentResult,
  simulated: CreditAssessmentResult
): CreditComparison {
  return {
    baseline,
    simulated,
    scoreDelta: simulated.score - baseline.score,
    limitDelta: simulated.estimatedLoanLimit - baseline.estimatedLoanLimit,
    statusChanged: baseline.eligibilityStatus !== simulated.eligibilityStatus,
  };
}

