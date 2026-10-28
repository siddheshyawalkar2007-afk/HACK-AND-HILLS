import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Wallet,
  Plus,
  Trash2,
  Save,
  Edit2,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Gauge,
  Calendar,
  Cloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';
import { Token, PlannedTransaction, LoanRecord } from '../../core/types';

export const MyFinancialProfile: React.FC = () => {
  const {
    user,
    isBackendConnected,
  } = useAuth();

  const {
    workspaceMode,
    setWorkspaceMode,
    tokens,
    loans,
    plannedTransactions,
    creditInputs,
    timeMachineInputs,
    savedScenarios,
    activeScenarioId,
    isCloudSynced,
    isSaving,
    updateStablecoinBalance,
    addOrUpdateToken,
    deleteToken,
    addPlannedTransaction,
    deletePlannedTransaction,
    addHypotheticalLoan,
    updateHypotheticalLoan,
    deleteHypotheticalLoan,
    updateCreditInputFactor,
    saveCurrentFinancialProfile,
    saveCurrentAsScenario,
    loadSavedScenario,
    deleteSavedScenario,
    portfolioValueUsd,
    totalDebtUsd,
  } = useApp();

  // Active Profile Section Tab
  const [activeSection, setActiveSection] = useState<'holdings' | 'cashflows' | 'loans' | 'credit' | 'scenarios'>('holdings');

  // Token Modal / Form State
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [tokenPrice, setTokenPrice] = useState('1');
  const [isTokenStable, setIsTokenStable] = useState(false);

  // Planned Flow Form State
  const [flowType, setFlowType] = useState<'SWAP' | 'INCOME' | 'EXPENSE'>('INCOME');
  const [flowTitle, setFlowTitle] = useState('');
  const [flowAmount, setFlowAmount] = useState('100');
  const [flowToken, setFlowToken] = useState('USDC');
  const [flowTargetToken, setFlowTargetToken] = useState('ETH');
  const [flowDueDay, setFlowDueDay] = useState(7);

  // Loan Form State
  const [loanPrincipal, setLoanPrincipal] = useState('500');
  const [loanBalance, setLoanBalance] = useState('500');
  const [loanRate, setLoanRate] = useState('4.5');
  const [loanDays, setLoanDays] = useState(30);
  const [loanStatus, setLoanStatus] = useState<'ACTIVE' | 'REPAID' | 'OVERDUE'>('ACTIVE');

  // Scenario Form State
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDesc, setScenarioDesc] = useState('');

  // Handle Add Token Submit
  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenSymbol.trim()) return;

    const sym = tokenSymbol.trim().toUpperCase();
    const newToken: Token = {
      symbol: sym,
      name: tokenName.trim() || `${sym} Token`,
      decimals: 18,
      balance: parseFloat(tokenBalance) || 0,
      priceUsd: parseFloat(tokenPrice) || 0,
      isStable: isTokenStable,
      color: isTokenStable ? '#10B981' : '#06B6D4',
    };

    addOrUpdateToken(newToken);
    setIsAddTokenModalOpen(false);
    setTokenSymbol('');
    setTokenName('');
    setTokenBalance('0');
    setTokenPrice('1');
  };

  // Handle Add Planned Flow
  const handleAddFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowTitle.trim() || parseFloat(flowAmount) <= 0) return;

    addPlannedTransaction({
      type: flowType,
      title: flowTitle.trim(),
      amount: parseFloat(flowAmount) || 0,
      tokenSymbol: flowToken,
      targetTokenSymbol: flowType === 'SWAP' ? flowTargetToken : undefined,
      dueDay: Number(flowDueDay) || 7,
    });

    setFlowTitle('');
    setFlowAmount('100');
  };

  // Handle Add Hypothetical Loan
  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const principalNum = parseFloat(loanPrincipal) || 0;
    const balanceNum = parseFloat(loanBalance) || 0;
    if (principalNum <= 0) return;

    const days = Number(loanDays) || 30;
    const dueDate = new Date(Date.now() + days * 86400000).toISOString();

    addHypotheticalLoan({
      principal: principalNum,
      outstandingBalance: balanceNum,
      interestRatePercent: parseFloat(loanRate) || 4.5,
      durationDays: days,
      dueDate,
      status: loanStatus,
      source: 'SUPABASE',
    });

    setLoanPrincipal('500');
    setLoanBalance('500');
  };

  // Handle Save Scenario
  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioName.trim()) return;

    await saveCurrentAsScenario(scenarioName, scenarioDesc);
    setScenarioName('');
    setScenarioDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Cloud Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
            <Wallet className="w-3.5 h-3.5" />
            <span>PERSONAL FINANCIAL STUDIO</span>
            <span className="w-1 h-1 rounded-full bg-cyan-400" />
            <span>CUSTOM USER WORKSPACE</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">
            My Financial Profile
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Input, customize, and manage your hypothetical financial holdings, planned transactions, debt obligations, and credit parameters.
          </p>
        </div>

        {/* Global Save Profile & Cloud Sync Button */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => saveCurrentFinancialProfile()}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs tracking-wide transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
          </button>

          <div
            className={`px-3 py-2 rounded-xl border text-xs font-mono flex items-center space-x-1.5 ${
              isBackendConnected
                ? isCloudSynced
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>
              {isBackendConnected
                ? isCloudSynced
                  ? 'Supabase Synced'
                  : 'Sync Ready'
                : 'Local Workspace'}
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Context Banner */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2E45] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">Active Financial Context:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {activeScenarioId
                  ? `Scenario: ${savedScenarios.find((s) => s.id === activeScenarioId)?.name || 'Custom'}`
                  : 'Personal Default Workspace'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Calculations across ClearSwap, Time Machine, and Credit Flight Simulator automatically bind to these custom numbers.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">Net Portfolio:</span>
            <span className="text-white font-bold">${portfolioValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Debt:</span>
            <span className="text-amber-300 font-bold">{totalDebtUsd.toLocaleString()} USDC</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Profile Categories */}
      <div className="flex items-center space-x-2 border-b border-[#1F2E45] pb-2 overflow-x-auto">
        {[
          { id: 'holdings', label: 'Token Holdings & Balances', icon: Wallet },
          { id: 'cashflows', label: 'Planned Swaps & Cash Flows', icon: TrendingUp },
          { id: 'loans', label: 'Hypothetical Loans', icon: CreditCard },
          { id: 'credit', label: 'Credit Scoring Inputs', icon: Gauge },
          { id: 'scenarios', label: 'Multi-Scenario Manager', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium font-mono transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#162032]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: TOKEN HOLDINGS & BALANCES */}
      {activeSection === 'holdings' && (
        <div className="space-y-5">
          {/* Primary Stablecoin Quick Card */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                Primary Liquid Reserve (USDC)
              </span>
              <p className="text-xs text-slate-300 mt-1">
                This is your base liquid balance used for debt service and swaps.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="0"
                step="any"
                value={tokens.USDC?.balance || 0}
                onChange={(e) => updateStablecoinBalance(parseFloat(e.target.value) || 0)}
                className="w-44 bg-[#162032] border border-[#22334D] rounded-xl px-3.5 py-2 text-lg font-bold font-mono text-white focus:outline-none focus:border-cyan-400 text-right"
              />
              <span className="font-mono text-xs font-bold text-cyan-400">USDC</span>
            </div>
          </div>

          {/* Tokens Table & Add Button */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2E45]/80">
              <div>
                <h3 className="text-sm font-bold text-white">Custom Token Holdings</h3>
                <p className="text-xs text-slate-400">
                  Add tokens, adjust quantities, or assign hypothetical valuation prices.
                </p>
              </div>
              <button
                onClick={() => setIsAddTokenModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold border border-cyan-500/40 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Token</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#162032] text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Hypothetical Price (USD)</th>
                    <th className="py-2.5 px-3">Holding Value</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2E45]">
                  {Object.values(tokens).map((t) => (
                    <tr key={t.symbol} className="hover:bg-[#162032]/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-cyan-300">{t.symbol}</td>
                      <td className="py-3 px-3 text-slate-200">{t.name}</td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          step="any"
                          value={t.balance}
                          onChange={(e) =>
                            addOrUpdateToken({
                              ...t,
                              balance: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-28 bg-[#1A263B] border border-[#2B3E5C] rounded px-2 py-1 text-white text-xs font-mono"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-400">$</span>
                          <input
                            type="number"
                            step="any"
                            value={t.priceUsd}
                            onChange={(e) =>
                              addOrUpdateToken({
                                ...t,
                                priceUsd: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-24 bg-[#1A263B] border border-[#2B3E5C] rounded px-2 py-1 text-white text-xs font-mono"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        ${((t.balance || 0) * (t.priceUsd || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.isStable
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {t.isStable ? 'STABLE' : 'VOLATILE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {t.symbol !== 'USDC' && (
                          <button
                            onClick={() => deleteToken(t.symbol)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Token"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PLANNED TRANSACTIONS & CASH FLOWS */}
      {activeSection === 'cashflows' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Flow Form (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-[#1F2E45]/80">
              Schedule Future Inflow, Outflow or Swap
            </h3>

            <form onSubmit={handleAddFlow} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Flow Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['INCOME', 'EXPENSE', 'SWAP'] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFlowType(type)}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        flowType === type
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-[#162032] border-[#22334D] text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Title / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Protocol Staking Reward"
                  value={flowTitle}
                  onChange={(e) => setFlowTitle(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Amount</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={flowAmount}
                    onChange={(e) => setFlowAmount(e.target.value)}
                    className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Token</label>
                  <select
                    value={flowToken}
                    onChange={(e) => setFlowToken(e.target.value)}
                    className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                  >
                    {Object.keys(tokens).map((sym) => (
                      <option key={sym} value={sym}>
                        {sym}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {flowType === 'SWAP' && (
                <div>
                  <label className="text-slate-300 block mb-1">Target Swap Token</label>
                  <select
                    value={flowTargetToken}
                    onChange={(e) => setFlowTargetToken(e.target.value)}
                    className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                  >
                    {Object.keys(tokens).map((sym) => (
                      <option key={sym} value={sym}>
                        {sym}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-slate-300 block mb-1">Expected Day (Day 1 - 30)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={flowDueDay}
                  onChange={(e) => setFlowDueDay(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs mt-2 transition-all cursor-pointer"
              >
                Add Scheduled Flow
              </button>
            </form>
          </div>

          {/* Planned Flows List (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-[#1F2E45]/80">
              Active Planned Transactions ({plannedTransactions.length})
            </h3>

            {plannedTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                No planned cash flows or swaps registered. Add one using the form on the left to stress-test your runway.
              </div>
            ) : (
              <div className="space-y-2.5">
                {plannedTransactions.map((pt) => (
                  <div
                    key={pt.id}
                    className="p-3.5 rounded-xl bg-[#162032] border border-[#22334D] flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pt.type === 'INCOME'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : pt.type === 'EXPENSE'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {pt.type}
                      </span>
                      <div>
                        <span className="text-white font-semibold block">{pt.title}</span>
                        <span className="text-[11px] text-slate-400">
                          {pt.type === 'SWAP'
                            ? `Swap ${pt.amount} ${pt.tokenSymbol} → ${pt.targetTokenSymbol}`
                            : `${pt.amount} ${pt.tokenSymbol}`}{' '}
                          • Due Day {pt.dueDay}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePlannedTransaction(pt.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Flow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: HYPOTHETICAL LOANS */}
      {activeSection === 'loans' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Loan Form (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-[#1F2E45]/80">
              Register Hypothetical Debt Obligation
            </h3>

            <form onSubmit={handleAddLoan} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Principal (USDC)</label>
                  <input
                    type="number"
                    min="1"
                    value={loanPrincipal}
                    onChange={(e) => setLoanPrincipal(e.target.value)}
                    className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Current Balance</label>
                  <input
                    type="number"
                    min="0"
                    value={loanBalance}
                    onChange={(e) => setLoanBalance(e.target.value)}
                    className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Interest Rate %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={loanRate}
                    onChange={(e) => setLoanRate(e.target.value)}
                    className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={loanDays}
                    onChange={(e) => setLoanDays(parseInt(e.target.value) || 30)}
                    className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Loan Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ACTIVE', 'REPAID', 'OVERDUE'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setLoanStatus(st)}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        loanStatus === st
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-[#162032] border-[#22334D] text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs mt-2 transition-all cursor-pointer"
              >
                Register Loan Facility
              </button>
            </form>
          </div>

          {/* Active Loans Table (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-[#1F2E45]/80">
              Registered Loans ({loans.length})
            </h3>

            {loans.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                No debt obligations recorded. You currently have zero debt exposure.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#162032] text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Loan ID</th>
                      <th className="py-2.5 px-3">Principal</th>
                      <th className="py-2.5 px-3">Balance</th>
                      <th className="py-2.5 px-3">Rate</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2E45]">
                    {loans.map((l) => (
                      <tr key={l.id} className="hover:bg-[#162032]/60">
                        <td className="py-3 px-3 text-cyan-300">{l.id.substring(0, 10)}...</td>
                        <td className="py-3 px-3 text-slate-200">{l.principal} USDC</td>
                        <td className="py-3 px-3 font-bold text-white">{l.outstandingBalance} USDC</td>
                        <td className="py-3 px-3 text-slate-300">{l.interestRatePercent}%</td>
                        <td className="py-3 px-3">
                          <select
                            value={l.status}
                            onChange={(e) =>
                              updateHypotheticalLoan(l.id, {
                                status: e.target.value as any,
                              })
                            }
                            className="bg-[#1A263B] text-xs text-white rounded px-2 py-0.5 border border-[#2B3E5C]"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="REPAID">REPAID</option>
                            <option value="OVERDUE">OVERDUE</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => deleteHypotheticalLoan(l.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: CREDIT SCORING INPUTS */}
      {activeSection === 'credit' && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2E45]/80">
            <div>
              <h3 className="text-base font-bold text-white">Underwriting Model Behavioral Parameters</h3>
              <p className="text-xs text-slate-400">
                Tune the behavioral signals feeding your 0–100 algorithmic credit assessment.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live Interactive Model
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Repayment Consistency Slider */}
            <div className="p-4 rounded-xl bg-[#162032] border border-[#22334D] space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Repayment Consistency (35% Weight)</span>
                <span className="text-cyan-400 font-bold">{creditInputs.repaymentConsistencyPercent}%</span>
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
              <span className="text-[11px] text-slate-400 block">
                Higher consistency demonstrates lower default risk and expands borrow limits.
              </span>
            </div>

            {/* Wallet Activity Tx Count */}
            <div className="p-4 rounded-xl bg-[#162032] border border-[#22334D] space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Transaction Activity (10% Weight)</span>
                <span className="text-cyan-400 font-bold">{creditInputs.walletActivityTxCount} Tx</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={creditInputs.walletActivityTxCount}
                onChange={(e) =>
                  updateCreditInputFactor('walletActivityTxCount', parseInt(e.target.value))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                Number of historical onchain interactions providing behavioral confidence.
              </span>
            </div>

            {/* Wallet Age Months */}
            <div className="p-4 rounded-xl bg-[#162032] border border-[#22334D] space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Wallet Tenure / Age (10% Weight)</span>
                <span className="text-cyan-400 font-bold">{creditInputs.walletAgeMonths} Months</span>
              </div>
              <input
                type="range"
                min="1"
                max="36"
                value={creditInputs.walletAgeMonths}
                onChange={(e) =>
                  updateCreditInputFactor('walletAgeMonths', parseInt(e.target.value))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                Wallet address tenure demonstrating multi-cycle resilience.
              </span>
            </div>

            {/* Repayment On-Time & Overdue Toggles */}
            <div className="p-4 rounded-xl bg-[#162032] border border-[#22334D] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Repayments Completed On-Time</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !creditInputs.repaymentCompletedOnTime;
                    updateCreditInputFactor('repaymentCompletedOnTime', nextVal);
                    if (nextVal) updateCreditInputFactor('repaymentOverdue', false);
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    creditInputs.repaymentCompletedOnTime
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {creditInputs.repaymentCompletedOnTime ? 'YES (100%)' : 'NO'}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#22334D]">
                <span className="text-slate-300 font-semibold">Overdue Debt Detected</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !creditInputs.repaymentOverdue;
                    updateCreditInputFactor('repaymentOverdue', nextVal);
                    if (nextVal) updateCreditInputFactor('repaymentCompletedOnTime', false);
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    creditInputs.repaymentOverdue
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {creditInputs.repaymentOverdue ? 'OVERDUE (FLAGGED)' : 'CLEAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: MULTI-SCENARIO MANAGER */}
      {activeSection === 'scenarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Scenario Card (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-[#1F2E45]/80 flex items-center space-x-2">
              <FolderPlus className="w-4 h-4 text-cyan-400" />
              <span>Save Current Setup as Named Scenario</span>
            </h3>

            <form onSubmit={handleCreateScenario} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Scenario Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bull Market Aggressive Swaps"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description (Optional)</label>
                <textarea
                  placeholder="e.g. Models heavy ETH accumulation with 500 USDC upcoming loan obligation"
                  value={scenarioDesc}
                  onChange={(e) => setScenarioDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs mt-2 transition-all cursor-pointer"
              >
                Save as Scenario
              </button>
            </form>
          </div>

          {/* Saved Scenarios List (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-[#1F2E45]/80">
              Your Saved Scenarios ({savedScenarios.length})
            </h3>

            {savedScenarios.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                No custom scenarios saved yet. Use the form on the left to snapshot different financial hypotheses.
              </div>
            ) : (
              <div className="space-y-3">
                {savedScenarios.map((scen) => {
                  const isCurrent = activeScenarioId === scen.id;
                  return (
                    <div
                      key={scen.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md'
                          : 'bg-[#162032] border-[#22334D]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-white">{scen.name}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/30 text-cyan-200">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          {scen.description && (
                            <p className="text-xs text-slate-300 mt-1">{scen.description}</p>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                            Saved on {new Date(scen.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => loadSavedScenario(scen.id)}
                            className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold transition-colors cursor-pointer"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteSavedScenario(scen.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Scenario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD TOKEN MODAL */}
      {isAddTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-[#1F2E45] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">Add Custom Token Holding</h3>

            <form onSubmit={handleSaveToken} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Token Symbol</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOL, AVAX, LINK"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white uppercase"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Token Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chainlink"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={tokenBalance}
                    onChange={(e) => setTokenBalance(e.target.value)}
                    className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="any"
                    value={tokenPrice}
                    onChange={(e) => setTokenPrice(e.target.value)}
                    className="w-full bg-[#162032] border border-[#22334D] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="stableCheckbox"
                  checked={isTokenStable}
                  onChange={(e) => setIsTokenStable(e.target.checked)}
                  className="accent-cyan-400"
                />
                <label htmlFor="stableCheckbox" className="text-slate-300 text-xs">
                  This is a stablecoin asset (unaffected by volatile price shocks)
                </label>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTokenModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl bg-[#1E293B] text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-[#0B0F17] font-bold"
                >
                  Save Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hypothetical Data Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
        <span className="font-bold text-slate-300">Hypothetical Workspace Notice:</span> All values entered in your profile represent user-provided hypothetical parameters. They are not presented as verified financial records, actual credit bureau data, or onchain transactions.
      </div>
    </div>
  );
};

