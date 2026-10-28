import React from 'react';
import { useApp } from '../../context/AppContext';
import { useWeb3 } from '../../context/Web3Context';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeftRight,
  CreditCard,
  Clock,
  Sparkles,
  CheckCircle,
  ExternalLink,
  UserCheck,
  Sliders,
  Layers,
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface DashboardOverviewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenReceipt: (txId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onOpenReceipt,
}) => {
  const {
    tokens,
    portfolioValueUsd,
    loans,
    activeLoan,
    nextRepayment,
    creditAssessment,
    transactions,
    timeMachineResult,
    workspaceMode,
    activeScenarioId,
    savedScenarios,
  } = useApp();
  const { mode } = useWeb3();
  const { user, profile } = useAuth();

  const activeScenario = savedScenarios.find((s) => s.id === activeScenarioId);

  // Financial health status
  const isHealthy = !timeMachineResult.isShortfall && creditAssessment.score >= 60;
  const healthStatus = timeMachineResult.isShortfall
    ? 'Shortfall Risk'
    : creditAssessment.score >= 80
    ? 'Prime Resilient'
    : creditAssessment.score >= 60
    ? 'Healthy Buffer'
    : 'Elevated Risk';

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting & Quick Summary */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121B2B] via-[#101726] to-[#152338] border border-[#1F2E45] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {workspaceMode === 'USER_WORKSPACE' ? 'USER WORKSPACE' : 'DEMO MODE'}
              </span>
              {activeScenario && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  SCENARIO: {activeScenario.name}
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                {user ? `Logged in as ${profile?.displayName || 'Trader'}` : 'Guest Session'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">
              Financial Health & Credit Command
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              {workspaceMode === 'USER_WORKSPACE'
                ? 'Simulating your personalized financial profile, custom token holdings, and hypothetical debt obligations.'
                : 'Simulating predefined Hack in Hills demo presets across swaps, debts, and market price shocks.'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-semibold text-xs tracking-wide transition-all shadow-md shadow-cyan-500/20 flex items-center space-x-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Edit My Financial Profile</span>
            </button>
            <button
              onClick={() => onNavigate('scenarioLab')}
              className="px-3.5 py-2 rounded-xl bg-[#162032] hover:bg-[#1E2E4A] border border-[#22334D] text-slate-200 text-xs font-mono transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scenario Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Portfolio Value */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2E45] relative">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Portfolio Value</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            ${portfolioValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono">
            <span>Liquid USDC: ${tokens.USDC ? tokens.USDC.balance.toLocaleString() : '0.00'}</span>
          </div>
        </div>

        {/* Credit Score & Tier */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2E45]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Estimated Credit Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {creditAssessment.score}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                creditAssessment.score >= 80
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : creditAssessment.score >= 60
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {creditAssessment.scoreBand.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Max Headroom: <span className="text-cyan-300 font-bold">{creditAssessment.estimatedLoanLimit} USDC</span>
          </div>
        </div>

        {/* Active Debt Exposure */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2E45]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Debt Exposure</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {activeLoan ? `${activeLoan.outstandingBalance.toLocaleString()} USDC` : '0.00 USDC'}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            {activeLoan ? (
              <span className="text-amber-300">
                Principal: {activeLoan.principal} USDC @ {activeLoan.interestRatePercent}% APR
              </span>
            ) : (
              <span className="text-emerald-400">No active liabilities</span>
            )}
          </div>
        </div>

        {/* Next Obligation / Due Date */}
        <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2E45]">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Next Repayment Due</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-300">
            {nextRepayment ? `${nextRepayment.amount.toLocaleString()} USDC` : 'None'}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>{nextRepayment ? `Due in ${nextRepayment.daysLeft} days` : 'All obligations settled'}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                healthStatus === 'Shortfall Risk'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {healthStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Token Holdings Grid */}
      <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2E45]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Token Holdings & Valuation</h3>
            <p className="text-xs text-slate-400">
              Balances available for simulated trading and debt settlement.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Customize Holdings</span>
            </button>
            <button
              onClick={() => onNavigate('clearswap')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Trade on ClearSwap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.values(tokens).map((tok) => {
            const holdingUsd = (tok.balance || 0) * (tok.priceUsd || 0);
            return (
              <div
                key={tok.symbol}
                className="p-3.5 rounded-lg bg-[#162032] border border-[#22334D] hover:border-cyan-500/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: `${tok.color || '#06B6D4'}25`, color: tok.color || '#06B6D4' }}
                    >
                      {tok.symbol.substring(0, 1)}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white block">{tok.symbol}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[80px]">{tok.name}</span>
                    </div>
                  </div>
                  {tok.isStable && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-700/50 text-slate-300 font-mono">
                      STABLE
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="text-sm font-bold font-mono text-slate-100">
                    {tok.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ≈ ${holdingUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Spotlight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ClearSwap Card */}
        <div className="p-5 rounded-xl bg-gradient-to-b from-[#131D2E] to-[#101726] border border-[#1F2E45] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Module A: ClearSwap</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Execute deterministic swaps with slippage limits, fee transparency, and validation preventing excessive balance spend.
            </p>
          </div>
          <button
            onClick={() => onNavigate('clearswap')}
            className="mt-4 w-full py-2 px-3 rounded-lg bg-[#182438] hover:bg-[#20314C] text-cyan-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-cyan-500/20 cursor-pointer"
          >
            <span>Open ClearSwap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Financial Time Machine Card */}
        <div className="p-5 rounded-xl bg-gradient-to-b from-[#131D2E] to-[#101726] border border-[#1F2E45] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Module B: Time Machine</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Simulate upcoming loan repayments against planned trades and price shocks. Automatically detect impending shortfalls.
            </p>
          </div>
          <button
            onClick={() => onNavigate('timeMachine')}
            className="mt-4 w-full py-2 px-3 rounded-lg bg-[#182438] hover:bg-[#20314C] text-teal-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-teal-500/20 cursor-pointer"
          >
            <span>Run Simulation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Credit Flight Simulator Card */}
        <div className="p-5 rounded-xl bg-gradient-to-b from-[#131D2E] to-[#101726] border border-[#1F2E45] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Module C: Credit Simulator</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Test how on-time repayments, liquid buffers, and debt affect your 0–100 credit score and borrowing limit with full explainability.
            </p>
          </div>
          <button
            onClick={() => onNavigate('creditSimulator')}
            className="mt-4 w-full py-2 px-3 rounded-lg bg-[#182438] hover:bg-[#20314C] text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-emerald-500/20 cursor-pointer"
          >
            <span>Simulate Credit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-5 rounded-xl bg-[#111827] border border-[#1F2E45]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Transactions & Events</h3>
            <p className="text-xs text-slate-400">
              Swaps, loan drawdowns, and debt settlements. Click any row to view its receipt.
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#162032] text-slate-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2E45]">
              {transactions.slice(0, 5).map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onOpenReceipt(tx.id)}
                  className="hover:bg-[#162032]/70 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        tx.type === 'SWAP'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : tx.type === 'LOAN_DISBURSEMENT'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-200">{tx.title}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-100">
                    {tx.amountIn ? `${tx.amountIn} ${tx.tokenIn || 'USDC'}` : '-'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[10px] text-slate-400 bg-[#1E293B] px-1.5 py-0.5 rounded">
                      {tx.source}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center space-x-1 text-emerald-400 font-mono text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{tx.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
