import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useWeb3 } from '../../context/Web3Context';
import { LoanRecord } from '../../core/types';
import {
  Wallet,
  CreditCard,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Coins,
  DollarSign,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const LendingManager: React.FC = () => {
  const {
    loans,
    tokens,
    applyForLoan,
    repayLoan,
    creditAssessment,
    totalDebtUsd,
    loadScenarioPreset,
  } = useApp();

  const { mode, isContractConfigured, executeOnChainLoan, executeOnChainRepayment } = useWeb3();

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [requestAmountText, setRequestAmountText] = useState('300');
  const [tenureDays, setTenureDays] = useState(30);

  // Repayment Modal state
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState<LoanRecord | null>(null);
  const [repayAmountText, setRepayAmountText] = useState('50');

  const requestedAmountNum = parseFloat(requestAmountText) || 0;
  const repayAmountNum = parseFloat(repayAmountText) || 0;

  // Handle Apply Submission
  const handleApply = async () => {
    if (mode === 'WALLET' && isContractConfigured) {
      const res = await executeOnChainLoan(requestedAmountNum, creditAssessment.score, tenureDays);
      if (res.success) {
        setIsApplyModalOpen(false);
      }
    } else {
      const res = applyForLoan({
        amount: requestedAmountNum,
        durationDays: tenureDays,
      });
      if (res.success) {
        setIsApplyModalOpen(false);
      }
    }
  };

  // Handle Repayment Submission
  const handleRepay = async () => {
    if (!selectedLoanForRepay) return;

    if (mode === 'WALLET' && isContractConfigured) {
      const res = await executeOnChainRepayment(1, repayAmountNum);
      if (res.success) {
        setSelectedLoanForRepay(null);
      }
    } else {
      const res = repayLoan({
        loanId: selectedLoanForRepay.id,
        amount: repayAmountNum,
      });
      if (res.success) {
        setSelectedLoanForRepay(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
            <span>MODULE D</span>
            <span className="w-1 h-1 rounded-full bg-purple-400" />
            <span>TRANSPARENT DEBT & REPAYMENT FACILITY</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">Lending & Loan Management</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Underwrite and service decentralized credit facilities. Borrow against your algorithmic credit score and execute partial or full loan liquidations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadScenarioPreset('CASE_F')}
            className="px-3 py-1.5 rounded-lg bg-[#141F30] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 text-xs font-mono transition-all"
          >
            Run Case F: Pay 50 USDC
          </button>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-semibold text-xs tracking-wide transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply For Loan</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2E45]">
          <span className="text-xs text-slate-400">Total Outstanding Debt</span>
          <div className="mt-1 text-2xl font-bold font-mono text-white">
            {totalDebtUsd.toLocaleString()} USDC
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Across {loans.filter((l) => l.status === 'ACTIVE').length} active facility
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2E45]">
          <span className="text-xs text-slate-400">Available Borrow Headroom</span>
          <div className="mt-1 text-2xl font-bold font-mono text-cyan-400">
            {creditAssessment.estimatedLoanLimit.toLocaleString()} USDC
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
            Score: {creditAssessment.score}/100 ({creditAssessment.scoreBand.replace(/_/g, ' ')})
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2E45]">
          <span className="text-xs text-slate-400">Liquid USDC Reserve</span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
            {tokens.USDC.balance.toLocaleString()} USDC
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Available for immediate loan repayment
          </span>
        </div>
      </div>

      {/* Loans Table */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2E45]/80">
          <h3 className="text-sm font-bold text-white">Credit Facilities & Active Loans</h3>
          <span className="text-xs font-mono text-slate-400">
            {loans.length} Recorded {loans.length === 1 ? 'Loan' : 'Loans'}
          </span>
        </div>

        {loans.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No loans found. Click "Apply For Loan" above to initiate a credit facility.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#162032] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Loan ID</th>
                  <th className="py-2.5 px-3">Principal</th>
                  <th className="py-2.5 px-3">Outstanding Balance</th>
                  <th className="py-2.5 px-3">APR</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E45]">
                {loans.map((loan) => {
                  const isActive = loan.status === 'ACTIVE';
                  const daysLeft = Math.max(0, Math.round((loan.dueDateTimestamp - Date.now()) / 86400000));
                  return (
                    <tr key={loan.id} className="hover:bg-[#162032]/60 transition-colors">
                      <td className="py-3 px-3 text-cyan-300 font-semibold">{loan.id}</td>
                      <td className="py-3 px-3 text-slate-200">{loan.principal} USDC</td>
                      <td className="py-3 px-3 font-bold text-white">{loan.outstandingBalance} USDC</td>
                      <td className="py-3 px-3 text-slate-300">{loan.interestRatePercent}%</td>
                      <td className="py-3 px-3 text-slate-300">
                        {new Date(loan.dueDate).toLocaleDateString()}{' '}
                        {isActive && <span className="text-amber-400 text-[10px]">({daysLeft}d left)</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            loan.status === 'ACTIVE'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : loan.status === 'REPAID'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isActive ? (
                          <button
                            onClick={() => {
                              setSelectedLoanForRepay(loan);
                              setRepayAmountText(Math.min(50, loan.outstandingBalance).toString());
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Repay Loan
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">Fully Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LOAN APPLICATION MODAL */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-[#1F2E45] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1F2E45] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Apply for Credit Facility</h3>
                <p className="text-xs text-slate-400">Algorithmic, rule-governed drawdown</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                {mode}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block font-medium mb-1">
                  Requested Loan Amount (USDC)
                </label>
                <input
                  type="number"
                  min="50"
                  max={creditAssessment.estimatedLoanLimit}
                  value={requestAmountText}
                  onChange={(e) => setRequestAmountText(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22334D] rounded-xl px-3.5 py-2.5 text-base font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <div className="mt-1 flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Approved Headroom: {creditAssessment.estimatedLoanLimit} USDC</span>
                  <button
                    onClick={() => setRequestAmountText(creditAssessment.estimatedLoanLimit.toString())}
                    className="text-cyan-400 hover:underline"
                  >
                    Set Max Available
                  </button>
                </div>
              </div>

              {/* Assessment Breakdown Box */}
              <div className="p-3.5 rounded-xl bg-[#0E1522] border border-[#1C273A] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Current Credit Score:</span>
                  <span className="text-cyan-300 font-bold">{creditAssessment.score}/100</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Interest Rate (Fixed):</span>
                  <span className="text-slate-200">4.50% APR</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Duration Term:</span>
                  <span className="text-slate-200">{tenureDays} Days</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Repayment Due Date:</span>
                  <span className="text-amber-300">
                    {new Date(Date.now() + tenureDays * 86400000).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Validation Warning */}
              {requestedAmountNum > creditAssessment.estimatedLoanLimit && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <span>
                    Requested amount ({requestedAmountNum} USDC) exceeds your permitted limit of {creditAssessment.estimatedLoanLimit} USDC.
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                By submitting this application, test tokens will be disbursed directly into your liquid USDC wallet balance. Repayments can be made partially or in full at any time.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#28384E] text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={requestedAmountNum <= 0 || requestedAmountNum > creditAssessment.estimatedLoanLimit}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                Accept Terms & Disburse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPAYMENT MODAL */}
      {selectedLoanForRepay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-[#1F2E45] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1F2E45] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Execute Loan Repayment</h3>
                <p className="text-xs text-slate-400 font-mono">Loan: {selectedLoanForRepay.id}</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Active
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#162032] flex justify-between items-center font-mono text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Outstanding Debt:</span>
                  <span className="text-base font-bold text-white">
                    {selectedLoanForRepay.outstandingBalance} USDC
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Available USDC:</span>
                  <span className="text-base font-bold text-emerald-400">
                    {tokens.USDC.balance} USDC
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block font-medium mb-1">
                  Repayment Amount (USDC)
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedLoanForRepay.outstandingBalance}
                  value={repayAmountText}
                  onChange={(e) => setRepayAmountText(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22334D] rounded-xl px-3.5 py-2.5 text-base font-mono text-white focus:outline-none focus:border-cyan-400"
                />

                <div className="mt-2 flex items-center space-x-2">
                  <button
                    onClick={() => setRepayAmountText('50')}
                    className="px-2 py-1 rounded bg-[#1A263B] text-[11px] font-mono text-slate-300 hover:text-white"
                  >
                    50 USDC (Case F)
                  </button>
                  <button
                    onClick={() =>
                      setRepayAmountText((selectedLoanForRepay.outstandingBalance / 2).toFixed(2))
                    }
                    className="px-2 py-1 rounded bg-[#1A263B] text-[11px] font-mono text-slate-300 hover:text-white"
                  >
                    50% Partial
                  </button>
                  <button
                    onClick={() =>
                      setRepayAmountText(selectedLoanForRepay.outstandingBalance.toString())
                    }
                    className="px-2 py-1 rounded bg-[#1A263B] text-[11px] font-mono text-cyan-300 hover:text-white"
                  >
                    Pay Full Balance
                  </button>
                </div>
              </div>

              {/* Excess Repayment Guard Validation */}
              {repayAmountNum > selectedLoanForRepay.outstandingBalance && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                  Repayment amount exceeds outstanding balance of {selectedLoanForRepay.outstandingBalance} USDC.
                </div>
              )}

              {/* Insufficient Funds Validation */}
              {tokens.USDC.balance < repayAmountNum && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                  Insufficient USDC in wallet: you have {tokens.USDC.balance} USDC.
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setSelectedLoanForRepay(null)}
                className="w-1/2 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#28384E] text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRepay}
                disabled={
                  repayAmountNum <= 0 ||
                  repayAmountNum > selectedLoanForRepay.outstandingBalance ||
                  tokens.USDC.balance < repayAmountNum
                }
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                Confirm Repayment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

