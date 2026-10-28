import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TokenSymbol } from '../../core/types';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
  DollarSign,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

export const FinancialTimeMachine: React.FC = () => {
  const {
    tokens,
    timeMachineInputs,
    setTimeMachineInputs,
    timeMachineResult,
    loadScenarioPreset,
  } = useApp();

  const [activeScenarioTab, setActiveScenarioTab] = useState<'neutral' | 'optimistic' | 'pessimistic' | 'custom'>('neutral');

  // Scenario presets
  const handleSelectPriceScenario = (scenario: 'neutral' | 'optimistic' | 'pessimistic') => {
    setActiveScenarioTab(scenario);
    if (scenario === 'neutral') {
      setTimeMachineInputs((prev) => ({ ...prev, priceShockPercent: 0 }));
    } else if (scenario === 'optimistic') {
      setTimeMachineInputs((prev) => ({ ...prev, priceShockPercent: 25 }));
    } else if (scenario === 'pessimistic') {
      setTimeMachineInputs((prev) => ({ ...prev, priceShockPercent: -20 }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
            <span>MODULE B</span>
            <span className="w-1 h-1 rounded-full bg-teal-400" />
            <span>PREDICTIVE CASH FLOW SIMULATION</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">Financial Time Machine</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Simulate future wallet balances before executing swaps or incurring debt. Stress test volatile price swings and detect repayment deficits in advance.
          </p>
        </div>

        {/* Quick Test Case Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadScenarioPreset('CASE_A')}
            className="px-3 py-1.5 rounded-lg bg-[#141F30] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono transition-all"
          >
            Load Case A (Safe Swap)
          </button>
          <button
            onClick={() => loadScenarioPreset('CASE_B')}
            className="px-3 py-1.5 rounded-lg bg-[#2B1417] border border-rose-500/40 text-rose-300 hover:bg-rose-950/40 text-xs font-mono transition-all"
          >
            Load Case B (Shortfall Risk)
          </button>
        </div>
      </div>

      {/* SHORTFALL ALERT BANNER (Exact requirement: "Potential repayment shortfall detected") */}
      {timeMachineResult.isShortfall && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#330D14] via-[#240B10] to-[#1F0A0E] border-2 border-rose-500/70 shadow-2xl text-rose-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Potential Repayment Shortfall Detected.
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/30 text-rose-200 border border-rose-500/50">
                  DEFICIT: -{timeMachineResult.potentialShortfall.toFixed(2)} USDC
                </span>
              </div>

              <p className="text-xs text-rose-200 leading-relaxed">
                Executing your proposed swap of {timeMachineInputs.plannedSwapAmount} USDC will leave only{' '}
                <span className="font-mono font-bold text-white">{timeMachineResult.remainingLiquidBalance} USDC</span> in
                liquid funds, which is insufficient to cover your upcoming loan obligation of{' '}
                <span className="font-mono font-bold text-white">{timeMachineInputs.repaymentAmount} USDC</span> due on day {timeMachineInputs.repaymentDueDays}.
              </p>

              {/* Actionable Alternatives */}
              <div className="pt-2 border-t border-rose-500/30">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 block mb-1">
                  Actionable Recommendations:
                </span>
                <ul className="space-y-1 text-xs text-rose-100">
                  {timeMachineResult.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SIMULATION INPUT CONTROLS (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2E45]/80">
            <h3 className="text-sm font-bold text-white">Hypothetical Scenario Inputs</h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              Deterministic Math
            </span>
          </div>

          {/* Starting Liquid USDC */}
          <div>
            <label className="text-xs text-slate-300 flex justify-between font-medium mb-1">
              <span>Current Liquid Stablecoin (USDC)</span>
              <span className="font-mono text-cyan-300">{timeMachineInputs.startingUsdc} USDC</span>
            </label>
            <input
              type="number"
              value={timeMachineInputs.startingUsdc}
              onChange={(e) =>
                setTimeMachineInputs((prev) => ({
                  ...prev,
                  startingUsdc: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Planned Swap Amount */}
          <div>
            <label className="text-xs text-slate-300 flex justify-between font-medium mb-1">
              <span>Proposed Planned Swap (USDC)</span>
              <span className="font-mono text-cyan-300">{timeMachineInputs.plannedSwapAmount} USDC</span>
            </label>
            <input
              type="number"
              value={timeMachineInputs.plannedSwapAmount}
              onChange={(e) =>
                setTimeMachineInputs((prev) => ({
                  ...prev,
                  plannedSwapAmount: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="mt-1 text-[11px] text-slate-400 font-mono">
              Fee (0.3%): <span className="text-slate-300">{timeMachineResult.totalTradingFee} USDC</span> | Total Deducted:{' '}
              <span className="text-slate-300">{timeMachineResult.totalSwapCost} USDC</span>
            </div>
          </div>

          {/* Upcoming Loan Repayment Obligation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 block font-medium mb-1">
                Loan Repayment (USDC)
              </label>
              <input
                type="number"
                value={timeMachineInputs.repaymentAmount}
                onChange={(e) =>
                  setTimeMachineInputs((prev) => ({
                    ...prev,
                    repaymentAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block font-medium mb-1">
                Due on Day
              </label>
              <input
                type="number"
                min="1"
                max={timeMachineInputs.simulationDays}
                value={timeMachineInputs.repaymentDueDays}
                onChange={(e) =>
                  setTimeMachineInputs((prev) => ({
                    ...prev,
                    repaymentDueDays: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Expected Deposits or Income */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 block font-medium mb-1">
                Expected Inflow (USDC)
              </label>
              <input
                type="number"
                value={timeMachineInputs.expectedIncome}
                onChange={(e) =>
                  setTimeMachineInputs((prev) => ({
                    ...prev,
                    expectedIncome: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block font-medium mb-1">
                Other Expenses (USDC)
              </label>
              <input
                type="number"
                value={timeMachineInputs.otherExpenses}
                onChange={(e) =>
                  setTimeMachineInputs((prev) => ({
                    ...prev,
                    otherExpenses: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Price Scenario Selector (Section 7 requirement: Optimistic, Neutral, Pessimistic, Custom) */}
          <div className="pt-2">
            <label className="text-xs text-slate-300 block font-medium mb-1.5">
              Volatile Token Market Scenario (ETH/WBTC)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSelectPriceScenario('optimistic')}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all ${
                  timeMachineInputs.priceShockPercent === 25
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-[#162032] text-slate-400 hover:text-slate-200'
                }`}
              >
                Optimistic (+25%)
              </button>
              <button
                onClick={() => handleSelectPriceScenario('neutral')}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all ${
                  timeMachineInputs.priceShockPercent === 0
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'bg-[#162032] text-slate-400 hover:text-slate-200'
                }`}
              >
                Neutral (0%)
              </button>
              <button
                onClick={() => handleSelectPriceScenario('pessimistic')}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all ${
                  timeMachineInputs.priceShockPercent === -20
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : 'bg-[#162032] text-slate-400 hover:text-slate-200'
                }`}
              >
                Pessimistic (-20%)
              </button>
            </div>

            {/* Custom slider */}
            <div className="mt-3 flex items-center space-x-3">
              <span className="text-[11px] text-slate-400 font-mono w-16">
                Custom: {timeMachineInputs.priceShockPercent > 0 ? `+${timeMachineInputs.priceShockPercent}` : timeMachineInputs.priceShockPercent}%
              </span>
              <input
                type="range"
                min="-50"
                max="100"
                step="5"
                value={timeMachineInputs.priceShockPercent}
                onChange={(e) => {
                  setActiveScenarioTab('custom');
                  setTimeMachineInputs((prev) => ({
                    ...prev,
                    priceShockPercent: parseInt(e.target.value),
                  }));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Simulation Horizon Days */}
          <div className="pt-2">
            <label className="text-xs text-slate-300 block font-medium mb-1.5">
              Simulation Horizon (Days)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() =>
                    setTimeMachineInputs((prev) => ({
                      ...prev,
                      simulationDays: days as 7 | 14 | 30,
                    }))
                  }
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-all ${
                    timeMachineInputs.simulationDays === days
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                      : 'bg-[#162032] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECHARTS PROJECTION & METRIC CARDS (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Output Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1F2E45]">
              <span className="text-[11px] text-slate-400 block">Remaining Liquid</span>
              <span className="text-lg font-bold font-mono text-white mt-1 block">
                {timeMachineResult.remainingLiquidBalance.toFixed(2)} USDC
              </span>
              <span className="text-[10px] text-slate-400 font-mono">After swap execution</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1F2E45]">
              <span className="text-[11px] text-slate-400 block">Upcoming Debt</span>
              <span className="text-lg font-bold font-mono text-amber-300 mt-1 block">
                {timeMachineResult.repaymentObligations.toFixed(2)} USDC
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Due Day {timeMachineInputs.repaymentDueDays}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1F2E45]">
              <span className="text-[11px] text-slate-400 block">Post-Obligation Funds</span>
              <span
                className={`text-lg font-bold font-mono mt-1 block ${
                  timeMachineResult.projectedFundsAfterObligations >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {timeMachineResult.projectedFundsAfterObligations.toFixed(2)} USDC
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Net liquid runway</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1F2E45]">
              <span className="text-[11px] text-slate-400 block">Simulation Risk</span>
              <span
                className={`text-lg font-bold font-mono mt-1 block ${
                  timeMachineResult.riskLevel === 'LOW'
                    ? 'text-emerald-400'
                    : timeMachineResult.riskLevel === 'MODERATE'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {timeMachineResult.riskLevel}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {timeMachineResult.isShortfall ? 'Deficit Warning' : 'Safe Runway'}
              </span>
            </div>
          </div>

          {/* Interactive Balance Projection Chart */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2E45]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">Projected Balance & Debt Over Time</h4>
                <p className="text-xs text-slate-400">
                  Daily tracking of liquid stablecoin reserves versus loan obligations.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="flex items-center space-x-1 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Liquid USDC</span>
                </span>
                <span className="flex items-center space-x-1 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span>Volatile Asset</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeMachineResult.timeline}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorLiquid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorVolatile" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2E45" />
                  <XAxis dataKey="dateStr" stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1624',
                      borderColor: '#1F2E45',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#F8FAFC',
                    }}
                  />
                  <ReferenceLine
                    x={timeMachineResult.timeline[Math.min(timeMachineInputs.repaymentDueDays, timeMachineResult.timeline.length - 1)]?.dateStr}
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    label={{ value: 'Loan Due Date', fill: '#EF4444', fontSize: 10, position: 'top' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="liquidUsdc"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorLiquid)"
                    name="Liquid USDC"
                  />
                  <Area
                    type="monotone"
                    dataKey="volatileValueUsd"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVolatile)"
                    name="Volatile Holdings USD"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Before-Versus-After Comparison Table (Section 7 requirement: distinguish liquid stablecoin from volatile tokens) */}
          <div className="p-4 rounded-xl bg-[#0E1522] border border-[#1C273A]">
            <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider font-mono">
              Before vs. After Simulation Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#141D2D] text-center">
                <span className="text-[10px] text-slate-400 block">Baseline Portfolio</span>
                <span className="text-sm font-bold text-white mt-1 block">
                  ${timeMachineResult.startingPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400">1,000 USDC + 0.5 ETH</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141D2D] text-center">
                <span className="text-[10px] text-slate-400 block">Post-Swap & Shock</span>
                <span className="text-sm font-bold text-cyan-300 mt-1 block">
                  ${timeMachineResult.postSwapPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-slate-400">
                  {timeMachineInputs.priceShockPercent !== 0 ? `${timeMachineInputs.priceShockPercent}% Shock` : 'Stable Prices'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141D2D] text-center">
                <span className="text-[10px] text-slate-400 block">Min Balance Needed</span>
                <span className="text-sm font-bold text-amber-300 mt-1 block">
                  {timeMachineResult.minBalanceRequired.toFixed(2)} USDC
                </span>
                <span className="text-[9px] text-slate-400">To avoid shortfall</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

