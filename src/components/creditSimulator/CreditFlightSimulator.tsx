import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { SCORING_WEIGHTS } from '../../core/creditScoring';

export const CreditFlightSimulator: React.FC = () => {
  const {
    creditInputs,
    setCreditInputs,
    creditAssessment,
    updateCreditInputFactor,
    resetCreditSimulator,
  } = useApp();

  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Quick Preset Scenarios from Prompt Section 8
  const handleLoadScenario = (scenarioNum: 1 | 2 | 3 | 4) => {
    switch (scenarioNum) {
      case 1:
        // Scenario 1: Repayment improvement
        setCreditInputs((prev) => ({
          ...prev,
          repaymentCompletedOnTime: true,
          repaymentOverdue: false,
          repaymentConsistencyPercent: 96,
        }));
        break;
      case 2:
        // Scenario 2: Low liquidity
        setCreditInputs((prev) => ({
          ...prev,
          availableLiquidBalance: 180,
          requestedLoanAmount: 600,
        }));
        break;
      case 3:
        // Scenario 3: Overdue repayment
        setCreditInputs((prev) => ({
          ...prev,
          repaymentOverdue: true,
          repaymentCompletedOnTime: false,
          repaymentConsistencyPercent: 30,
        }));
        break;
      case 4:
        // Scenario 4: Multiple changes
        setCreditInputs({
          repaymentCompletedOnTime: true,
          repaymentOverdue: false,
          availableLiquidBalance: 1400,
          outstandingLoanAmount: 100,
          walletActivityTxCount: 25,
          walletAgeMonths: 18,
          repaymentConsistencyPercent: 95,
          requestedLoanAmount: 500,
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
            <span>MODULE C</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            <span>EXPLAINABLE UNDERWRITING ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">Credit Flight Simulator</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Test how hypothetical financial behaviors alter your algorithmic credit score and borrowing headroom. Transparent, weighted, and explainable.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={resetCreditSimulator}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#141F30] border border-[#1F2E45] text-slate-300 hover:text-white text-xs font-mono transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Buttons (Prompt Section 8 requirement) */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2E45]">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
          Load Hypothetical Scenarios:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleLoadScenario(1)}
            className="p-2.5 rounded-lg bg-[#162032] hover:bg-[#1E2E4A] border border-[#22334D] text-left transition-all group"
          >
            <span className="text-xs font-bold text-emerald-300 block group-hover:text-emerald-200">
              Scenario 1
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Repayment Improvement (On-Time = Yes)
            </span>
          </button>

          <button
            onClick={() => handleLoadScenario(2)}
            className="p-2.5 rounded-lg bg-[#162032] hover:bg-[#1E2E4A] border border-[#22334D] text-left transition-all group"
          >
            <span className="text-xs font-bold text-amber-300 block group-hover:text-amber-200">
              Scenario 2
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Low Liquidity Shock (Cash Reduced)
            </span>
          </button>

          <button
            onClick={() => handleLoadScenario(3)}
            className="p-2.5 rounded-lg bg-[#162032] hover:bg-[#1E2E4A] border border-[#22334D] text-left transition-all group"
          >
            <span className="text-xs font-bold text-rose-300 block group-hover:text-rose-200">
              Scenario 3
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Overdue Repayment (Risk Penalty)
            </span>
          </button>

          <button
            onClick={() => handleLoadScenario(4)}
            className="p-2.5 rounded-lg bg-[#162032] hover:bg-[#1E2E4A] border border-[#22334D] text-left transition-all group"
          >
            <span className="text-xs font-bold text-cyan-300 block group-hover:text-cyan-200">
              Scenario 4
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Multi-Factor Upgrade (Prime Profile)
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs (Left) and Score/Eligibility (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: INTERACTIVE CONTROLS (6 cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2E45]/80">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Adjust Behavioral Inputs</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Sliders & Toggles</span>
          </div>

          {/* Toggle Switches: On-Time vs Overdue */}
          <div className="grid grid-cols-2 gap-3">
            {/* On-Time Toggle */}
            <div className="p-3 rounded-xl bg-[#162032] border border-[#22334D]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Repayment On Time</span>
                <button
                  onClick={() => {
                    const nextVal = !creditInputs.repaymentCompletedOnTime;
                    updateCreditInputFactor('repaymentCompletedOnTime', nextVal);
                    if (nextVal) updateCreditInputFactor('repaymentOverdue', false);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    creditInputs.repaymentCompletedOnTime ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform transform mt-1 ${
                      creditInputs.repaymentCompletedOnTime ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {creditInputs.repaymentCompletedOnTime ? '100% on-time record' : 'Delayed or unverified'}
              </span>
            </div>

            {/* Overdue Toggle */}
            <div className="p-3 rounded-xl bg-[#162032] border border-[#22334D]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Repayment Overdue</span>
                <button
                  onClick={() => {
                    const nextVal = !creditInputs.repaymentOverdue;
                    updateCreditInputFactor('repaymentOverdue', nextVal);
                    if (nextVal) updateCreditInputFactor('repaymentCompletedOnTime', false);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    creditInputs.repaymentOverdue ? 'bg-rose-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform transform mt-1 ${
                      creditInputs.repaymentOverdue ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {creditInputs.repaymentOverdue ? 'Delinquency detected' : 'No overdue status'}
              </span>
            </div>
          </div>

          {/* Repayment Consistency Slider (35% weight) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Repayment Consistency ({SCORING_WEIGHTS.REPAYMENT_CONSISTENCY * 100}% Weight)
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                {creditInputs.repaymentConsistencyPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={creditInputs.repaymentConsistencyPercent}
              onChange={(e) =>
                updateCreditInputFactor('repaymentConsistencyPercent', parseInt(e.target.value))
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Available Liquidity Slider (25% weight) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Available Liquid Balance ({SCORING_WEIGHTS.AVAILABLE_LIQUIDITY * 100}% Weight)
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                {creditInputs.availableLiquidBalance.toLocaleString()} USDC
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2500"
              step="50"
              value={creditInputs.availableLiquidBalance}
              onChange={(e) =>
                updateCreditInputFactor('availableLiquidBalance', parseInt(e.target.value))
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Outstanding Debt Exposure Slider (20% weight) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Outstanding Debt Exposure ({SCORING_WEIGHTS.DEBT_EXPOSURE * 100}% Weight)
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {creditInputs.outstandingLoanAmount.toLocaleString()} USDC
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1500"
              step="25"
              value={creditInputs.outstandingLoanAmount}
              onChange={(e) =>
                updateCreditInputFactor('outstandingLoanAmount', parseInt(e.target.value))
              }
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Activity & Wallet Age (10% + 10% weight) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Tx Count (10%)</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {creditInputs.walletActivityTxCount} tx
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={creditInputs.walletActivityTxCount}
                onChange={(e) =>
                  updateCreditInputFactor('walletActivityTxCount', parseInt(e.target.value))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Wallet Age (10%)</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {creditInputs.walletAgeMonths} mo
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={creditInputs.walletAgeMonths}
                onChange={(e) =>
                  updateCreditInputFactor('walletAgeMonths', parseInt(e.target.value))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Requested Loan Amount Input */}
          <div className="pt-2 border-t border-[#1F2E45]/80">
            <div className="flex justify-between items-center text-xs text-slate-300 mb-1.5 font-medium">
              <span>Hypothetical Requested Loan</span>
              <span className="font-mono text-cyan-400 font-bold">
                {creditInputs.requestedLoanAmount} USDC
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="2000"
              step="50"
              value={creditInputs.requestedLoanAmount}
              onChange={(e) =>
                updateCreditInputFactor('requestedLoanAmount', parseFloat(e.target.value) || 0)
              }
              className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: SCORE, ELIGIBILITY & EXPLAINABILITY (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Scorecard */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2E45] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                  Calculated Credit Score
                </span>
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="text-4xl font-extrabold font-mono text-white">
                    {creditAssessment.score}
                  </span>
                  <span className="text-sm font-mono text-slate-400">/ 100</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      creditAssessment.score >= 80
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : creditAssessment.score >= 60
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : creditAssessment.score >= 40
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {creditAssessment.scoreBand.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Status:</span>
                <span
                  className={`inline-flex items-center space-x-1 font-bold text-xs px-2.5 py-1 rounded-lg mt-0.5 ${
                    creditAssessment.eligibilityStatus === 'APPROVED'
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                      : creditAssessment.eligibilityStatus === 'RESTRICTED'
                      ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                      : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {creditAssessment.eligibilityStatus === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {creditAssessment.eligibilityStatus === 'RESTRICTED' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {creditAssessment.eligibilityStatus === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                  <span>{creditAssessment.eligibilityStatus}</span>
                </span>
              </div>
            </div>

            {/* Borrowing Limits */}
            <div className="mt-5 grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#162032] border border-[#22334D] text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[11px]">Maximum Exposure Limit:</span>
                <span className="text-base font-bold text-slate-100 mt-0.5 block">
                  {creditAssessment.maxPermittedExposure} USDC
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Available Borrow Headroom:</span>
                <span className="text-base font-bold text-cyan-300 mt-0.5 block">
                  {creditAssessment.estimatedLoanLimit} USDC
                </span>
              </div>
            </div>

            {/* Plain Language Explanation (Prompt requirement) */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#0E1522] border border-[#1C273A]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                Underwriting Decision Explanation
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {creditAssessment.plainExplanation}
              </p>
            </div>
          </div>

          {/* Factor Breakdown Cards with Weights */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Weighted Factor Attribution (0–100 Model)
            </h4>

            <div className="space-y-2">
              {creditAssessment.factors.map((f) => (
                <div
                  key={f.id}
                  className="p-2.5 rounded-lg bg-[#162032] border border-[#22334D] flex items-center justify-between text-xs font-mono"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-200 font-semibold">{f.name}</span>
                      <span className="text-[10px] text-cyan-400 font-bold">({f.weightPercent}%)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5 font-sans">
                      {f.explanation}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-slate-100">{f.normalizedScore}/100</span>
                    <span className="text-[10px] text-emerald-400 block">+{f.weightedContribution} pts</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Positive vs Negative Factor Bullets */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-200">
                <span className="font-bold font-mono text-[10px] uppercase text-emerald-400 block mb-1">
                  Primary Positive Signals:
                </span>
                <ul className="space-y-1 text-[11px] list-disc list-inside">
                  {creditAssessment.positiveFactors.slice(0, 3).map((pf, i) => (
                    <li key={i}>{pf}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-200">
                <span className="font-bold font-mono text-[10px] uppercase text-rose-400 block mb-1">
                  Risk Constraints:
                </span>
                <ul className="space-y-1 text-[11px] list-disc list-inside">
                  {creditAssessment.negativeFactors.length > 0 ? (
                    creditAssessment.negativeFactors.slice(0, 3).map((nf, i) => (
                      <li key={i}>{nf}</li>
                    ))
                  ) : (
                    <li>No acute risk factors identified.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experimental Credit Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
        <span className="font-bold text-slate-300">Transparency Note:</span> Experimental credit scores are calculated using deterministic onchain heuristics for hackathon demonstration. Wallet addresses and transaction histories do not establish legal identity, certified income, or verified creditworthiness. Simulated scenarios do not modify underlying blockchain state.
      </div>
    </div>
  );
};

