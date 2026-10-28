import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Coins,
  CreditCard,
  Zap,
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface ScenarioLabProps {
  onNavigate: (tab: NavTab) => void;
}

export const ScenarioLab: React.FC<ScenarioLabProps> = ({ onNavigate }) => {
  const { loadScenarioPreset, resetDemoData } = useApp();

  const cases = [
    {
      id: 'CASE_A' as const,
      letter: 'Case A',
      title: 'Safe Swap Execution',
      tag: 'Time Machine',
      color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/20',
      description: 'Swap 200 USDC with 300 USDC repayment due.',
      parameters: 'Starting: 1,000 USDC | Swap: 200 USDC | Repayment: 300 USDC | Fee: 0.3%',
      expectedResult: 'Remaining USDC is 799.40, leaving 499.40 USDC after reserving the 300 USDC repayment.',
      targetTab: 'timeMachine' as NavTab,
    },
    {
      id: 'CASE_B' as const,
      letter: 'Case B',
      title: 'Repayment Deficit Risk',
      tag: 'Time Machine',
      color: 'border-rose-500/40 text-rose-300 bg-rose-950/20',
      description: 'Swap 800 USDC with 300 USDC repayment due.',
      parameters: 'Starting: 1,000 USDC | Swap: 800 USDC | Repayment: 300 USDC | Fee: 0.3%',
      expectedResult: 'Remaining USDC is 197.60, creating a 102.40 USDC shortfall relative to the repayment.',
      targetTab: 'timeMachine' as NavTab,
    },
    {
      id: 'CASE_C' as const,
      letter: 'Case C',
      title: 'Falling Token Price Shock',
      tag: 'Time Machine',
      color: 'border-purple-500/40 text-purple-300 bg-purple-950/20',
      description: 'Stress-test a -20% market drop on volatile assets (ETH/WBTC).',
      parameters: '0.5 ETH ($1,500) + 1,000 USDC | Price Shock: -20%',
      expectedResult: 'Estimated portfolio drops from $2,500 to $2,200. Liquid stablecoins remain strictly at 1,000 USDC.',
      targetTab: 'timeMachine' as NavTab,
    },
    {
      id: 'CASE_D' as const,
      letter: 'Case D',
      title: 'Better Repayment Behaviour',
      tag: 'Credit Simulator',
      color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20',
      description: 'Switch hypothetical repayment history to 100% on-time.',
      parameters: 'Repayment On-Time = Yes | Consistency = 96%',
      expectedResult: 'Scoring model recalculates and explains positive score delta and expanded borrow limit.',
      targetTab: 'creditSimulator' as NavTab,
    },
    {
      id: 'CASE_E' as const,
      letter: 'Case E',
      title: 'Excessive Loan Request',
      tag: 'Lending & Credit',
      color: 'border-amber-500/40 text-amber-300 bg-amber-950/20',
      description: 'Request 1,400 USDC with only 400 USDC liquidity.',
      parameters: 'Liquidity: 400 USDC | Requested Loan: 1,400 USDC',
      expectedResult: 'Application is restricted or rejected under demo exposure rules, showing transparent explanation.',
      targetTab: 'creditSimulator' as NavTab,
    },
    {
      id: 'CASE_F' as const,
      letter: 'Case F',
      title: 'Partial Loan Repayment',
      tag: 'Lending',
      color: 'border-teal-500/40 text-teal-300 bg-teal-950/20',
      description: 'Pay 50 USDC towards an active 200 USDC loan.',
      parameters: 'Active Debt: 200 USDC | Repayment: 50 USDC',
      expectedResult: 'Outstanding principal decreases from 200 USDC to exactly 150 USDC.',
      targetTab: 'lending' as NavTab,
    },
    {
      id: 'CASE_G' as const,
      letter: 'Case G',
      title: 'Insufficient Swap Balance',
      tag: 'ClearSwap',
      color: 'border-red-500/40 text-red-300 bg-red-950/20',
      description: 'Attempt to swap 1,500 USDC when holding only 1,000 USDC.',
      parameters: 'Holdings: 1,000 USDC | Attempted: 1,500 USDC',
      expectedResult: 'Swap is blocked with explicit validation error. Balances remain unchanged.',
      targetTab: 'clearswap' as NavTab,
    },
    {
      id: 'CASE_H' as const,
      letter: 'Case H',
      title: 'Multi-Parameter Stress Test',
      tag: 'Time Machine & Credit',
      color: 'border-blue-500/40 text-blue-300 bg-blue-950/20',
      description: 'Simultaneously modify swap, debt, price shock, and liquidity.',
      parameters: 'Swap: 450 USDC | Price Shock: -15% | Income: 350 USDC | Debt: 400 USDC',
      expectedResult: 'All financial metrics, charts, and risk scores recalculate synchronously without reload.',
      targetTab: 'timeMachine' as NavTab,
    },
  ];

  const handleRunCase = (caseItem: typeof cases[0]) => {
    loadScenarioPreset(caseItem.id);
    onNavigate(caseItem.targetTab);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>HYPOTHETICAL CASE TESTING SUITE</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">Scenario Lab</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Reproducible 1-click test suite for Hack in Hills '26 judges. Verify all 8 test cases from Section 11 of the master build prompt.
          </p>
        </div>

        <button
          onClick={resetDemoData}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#162032] hover:bg-[#1E2E4A] border border-[#22334D] text-slate-200 text-xs font-mono transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      {/* Grid of 8 Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cases.map((c) => (
          <div
            key={c.id}
            className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${c.color} shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/10">
                  {c.letter} • {c.tag}
                </span>
                <h3 className="text-base font-bold text-white mt-2">{c.title}</h3>
              </div>
              <button
                onClick={() => handleRunCase(c)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Run Case</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-2 font-medium">{c.description}</p>

            <div className="mt-3 p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1 font-mono text-[11px]">
              <div className="text-slate-400">
                <span className="text-slate-500">Inputs: </span>
                <span>{c.parameters}</span>
              </div>
              <div className="text-slate-200">
                <span className="text-cyan-400 font-semibold">Expected: </span>
                <span>{c.expectedResult}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

