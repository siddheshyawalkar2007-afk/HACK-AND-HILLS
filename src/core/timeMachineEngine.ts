import { TimeMachineInputs, TimeMachineResult, TimeMachineTimelinePoint } from './types';

/**
 * Runs deterministic financial simulation over 7, 14, or 30 days.
 * Identifies repayment shortfalls, price impact on volatile assets, and delivers actionable suggestions.
 */
export function runTimeMachineSimulation(inputs: TimeMachineInputs): TimeMachineResult {
  const {
    startingUsdc,
    plannedSwapAmount,
    feePercent = 0.3,
    priceShockPercent = 0,
    expectedIncome = 0,
    repaymentAmount = 0,
    repaymentDueDays = 7,
    otherExpenses = 0,
    simulationDays = 7,
    volatileHoldingAmount = 0.5,
    volatileHoldingPriceUsd = 3000,
  } = inputs;

  // Trading fee for swap
  const tradingFee = Number((plannedSwapAmount * (feePercent / 100)).toFixed(2));
  const totalSwapCost = Number((plannedSwapAmount + tradingFee).toFixed(2));

  // Remaining liquid USDC after swap execution
  const remainingLiquidBalance = Number((startingUsdc - totalSwapCost).toFixed(2));

  // Total obligations due during the window
  const totalObligations = Number((repaymentAmount + otherExpenses).toFixed(2));

  // Available liquidity after paying obligations and factoring expected income
  const projectedFundsAfterObligations = Number(
    (remainingLiquidBalance - totalObligations + expectedIncome).toFixed(2)
  );

  // Shortfall: If projected funds is negative, shortfall is absolute value
  const potentialShortfall = projectedFundsAfterObligations < 0
    ? Number(Math.abs(projectedFundsAfterObligations).toFixed(2))
    : 0;

  const isShortfall = potentialShortfall > 0;

  // Minimum starting balance needed to comfortably perform swap AND cover obligations
  const minBalanceRequired = Number((totalSwapCost + totalObligations - expectedIncome).toFixed(2));

  // Volatile asset valuation
  const initialVolatileValue = Number((volatileHoldingAmount * volatileHoldingPriceUsd).toFixed(2));
  const shockedVolatilePrice = volatileHoldingPriceUsd * (1 + priceShockPercent / 100);
  const postShockVolatileValue = Number((volatileHoldingAmount * shockedVolatilePrice).toFixed(2));

  // Initial and post-event portfolio valuations
  // Stablecoins are not affected by volatile token price changes (Case C requirement)
  const currentPortfolioValue = Number((startingUsdc + initialVolatileValue).toFixed(2));
  
  // Post swap portfolio includes remaining USDC, acquired asset (simulated as swap amount value), and volatile asset shock
  const postSwapPortfolioValue = Number(
    (remainingLiquidBalance + plannedSwapAmount + postShockVolatileValue).toFixed(2)
  );

  // Determine risk level
  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (isShortfall) {
    if (potentialShortfall > totalObligations * 0.5 || remainingLiquidBalance < 0) {
      riskLevel = 'CRITICAL';
    } else {
      riskLevel = 'HIGH';
    }
  } else if (projectedFundsAfterObligations < totalObligations * 0.25) {
    riskLevel = 'MODERATE';
  } else {
    riskLevel = 'LOW';
  }

  // Generate actionable suggestions
  const suggestions: string[] = [];
  if (remainingLiquidBalance < 0) {
    suggestions.push(
      `Insufficient swap balance: Your proposed swap of ${plannedSwapAmount} USDC (plus ${tradingFee} USDC fee) exceeds your available ${startingUsdc} USDC.`
    );
  }

  if (isShortfall) {
    suggestions.push(
      `Potential repayment shortfall detected: You will face a deficit of ${potentialShortfall.toFixed(2)} USDC on day ${repaymentDueDays}.`
    );
    const maxSafeSwap = Math.max(0, Number(((startingUsdc - totalObligations + expectedIncome) / (1 + feePercent / 100)).toFixed(2)));
    if (maxSafeSwap > 0) {
      suggestions.push(
        `Reduce planned swap to at most ${maxSafeSwap} USDC to retain enough liquidity for your ${repaymentAmount} USDC loan repayment.`
      );
    } else {
      suggestions.push(
        `Delay this swap until your ${repaymentAmount} USDC loan obligation has been settled.`
      );
    }
    suggestions.push(
      `Deposit at least ${potentialShortfall.toFixed(2)} USDC before day ${repaymentDueDays} to avoid default risk.`
    );
  } else {
    suggestions.push(
      `Financial runway safe: After the swap and loan repayment, you will retain a buffer of ${projectedFundsAfterObligations.toFixed(2)} USDC.`
    );
    if (priceShockPercent < 0) {
      suggestions.push(
        `Stress test passed: Even with a ${Math.abs(priceShockPercent)}% drop in volatile holdings, your liquid stablecoin reserve remains intact.`
      );
    }
  }

  // Construct day-by-day projection timeline
  const timeline: TimeMachineTimelinePoint[] = [];
  const today = new Date();

  for (let day = 0; day <= simulationDays; day++) {
    const d = new Date(today);
    d.setDate(today.getDate() + day);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let liquid = startingUsdc;
    let obligationDue = 0;

    // Day 1: Planned swap executed
    if (day >= 1) {
      liquid -= totalSwapCost;
    }

    // Repayment due date
    if (day >= repaymentDueDays && repaymentDueDays <= simulationDays) {
      liquid -= repaymentAmount;
      if (day === repaymentDueDays) {
        obligationDue = repaymentAmount;
      }
    }

    // Expected income arrives midway or on specific day
    if (day >= Math.floor(simulationDays / 2) && expectedIncome > 0) {
      liquid += expectedIncome;
    }

    // Other expenses
    if (day >= simulationDays && otherExpenses > 0) {
      liquid -= otherExpenses;
    }

    // Price shock applied progressively or immediately
    const dayProgress = day / simulationDays;
    const currentPrice = volatileHoldingPriceUsd * (1 + (priceShockPercent * dayProgress) / 100);
    const volatileVal = Number((volatileHoldingAmount * currentPrice).toFixed(2));
    const totalVal = Number((Math.max(0, liquid) + volatileVal).toFixed(2));

    timeline.push({
      day,
      dateStr,
      liquidUsdc: Number(liquid.toFixed(2)),
      volatileValueUsd: volatileVal,
      totalPortfolioValue: totalVal,
      obligationDue,
      netReserve: Number((liquid - (day < repaymentDueDays ? repaymentAmount : 0)).toFixed(2)),
    });
  }

  return {
    startingPortfolioValue: currentPortfolioValue,
    currentPortfolioValue,
    postSwapPortfolioValue,
    remainingLiquidBalance,
    totalTradingFee: tradingFee,
    totalSwapCost,
    repaymentObligations: totalObligations,
    projectedFundsAfterObligations,
    potentialShortfall,
    minBalanceRequired,
    isShortfall,
    riskLevel,
    suggestions,
    timeline,
  };
}

