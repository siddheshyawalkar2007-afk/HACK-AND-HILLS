import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TransactionRecord, TransactionType, TransactionSource } from '../../core/types';
import {
  History,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Search,
  ArrowRight,
  Copy,
  Check,
  FileText,
} from 'lucide-react';

interface TransactionHistoryViewProps {
  onOpenReceipt: (txId: string) => void;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({ onOpenReceipt }) => {
  const { transactions } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
    if (sourceFilter !== 'ALL' && tx.source !== sourceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchId = tx.id.toLowerCase().includes(q);
      const matchToken = tx.tokenIn?.toLowerCase().includes(q) || tx.tokenOut?.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchToken) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
            <span>MODULE E</span>
            <span className="w-1 h-1 rounded-full bg-cyan-400" />
            <span>AUDITABLE LEDGER & ACTIVITY</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">Transaction History</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Persistent ledger of swaps, credit disbursements, repayments, and simulation records.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2E45] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#162032] border border-[#22334D] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#162032] text-slate-200 border border-[#22334D] rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="SWAP">Swaps</option>
            <option value="LOAN_DISBURSEMENT">Drawdowns</option>
            <option value="LOAN_REPAYMENT">Repayments</option>
          </select>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400 ml-2">
            <span>Source:</span>
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#162032] text-slate-200 border border-[#22334D] rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="ALL">All Sources</option>
            <option value="DEMO">DEMO</option>
            <option value="SIMULATION">SIMULATION</option>
            <option value="SUPABASE">SUPABASE</option>
            <option value="ONCHAIN">ONCHAIN</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-mono text-xs">
            No transactions matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#162032] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Tx ID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E45]">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onOpenReceipt(tx.id)}
                    className="hover:bg-[#162032]/70 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-3 text-slate-400 font-mono">
                      {tx.id.substring(0, 10)}...
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                    <td className="py-3.5 px-3 font-semibold text-slate-200">{tx.title}</td>
                    <td className="py-3.5 px-3 font-bold text-white">
                      {tx.amountIn ? `${tx.amountIn} ${tx.tokenIn || 'USDC'}` : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          tx.source === 'ONCHAIN'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : tx.source === 'SUPABASE'
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                            : 'bg-[#1E293B] text-slate-400'
                        }`}
                      >
                        {tx.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{tx.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReceipt(tx.id);
                        }}
                        className="p-1 rounded hover:bg-[#20314C] text-cyan-400 transition-colors"
                        title="View Full Receipt"
                      >
                        <FileText className="w-4 h-4" />
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
  );
};

