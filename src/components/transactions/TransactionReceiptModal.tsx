import React, { useState } from 'react';
import { TransactionRecord } from '../../core/types';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Shield,
  FileCheck,
} from 'lucide-react';

interface TransactionReceiptModalProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const copyId = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#111827] border border-[#1F2E45] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#1F2E45] pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Transaction Receipt</h3>
              <p className="text-[10px] text-slate-400 font-mono">Auditable execution proof</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#162032] flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Transaction ID:</span>
              <span className="text-white font-bold">{transaction.id}</span>
            </div>
            <button
              onClick={copyId}
              className="p-1.5 rounded-lg bg-[#20314C] text-cyan-400 hover:text-white transition-colors"
              title="Copy ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0E1522] border border-[#1C273A] space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Event Type:</span>
              <span className="text-slate-200 font-bold">{transaction.type.replace('_', ' ')}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Description:</span>
              <span className="text-slate-200 font-sans">{transaction.title}</span>
            </div>

            {transaction.amountIn !== undefined && (
              <div className="flex justify-between text-slate-400">
                <span>Amount In:</span>
                <span className="text-white font-bold">
                  {transaction.amountIn} {transaction.tokenIn || 'USDC'}
                </span>
              </div>
            )}

            {transaction.amountOut !== undefined && (
              <div className="flex justify-between text-slate-400">
                <span>Amount Out:</span>
                <span className="text-emerald-400 font-bold">
                  {transaction.amountOut} {transaction.tokenOut}
                </span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Protocol Fee:</span>
              <span className="text-slate-300">{transaction.fee} {transaction.tokenIn || 'USDC'}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Timestamp:</span>
              <span className="text-slate-300">{new Date(transaction.timestamp).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Ledger Source:</span>
              <span className="px-2 py-0.5 rounded bg-[#1A263B] text-cyan-300 text-[10px] font-bold">
                {transaction.source}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Verification Status:</span>
              <span className="text-emerald-400 font-bold inline-flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{transaction.status}</span>
              </span>
            </div>

            {/* Custom transaction details if present */}
            {transaction.details && Object.keys(transaction.details).length > 0 && (
              <div className="pt-2 border-t border-[#1C273A] space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Metadata:</span>
                {Object.entries(transaction.details).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px] text-slate-300">
                    <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span>{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Real Onchain explorer link if txHash genuinely exists */}
            {transaction.txHash ? (
              <div className="pt-2 border-t border-[#1C273A]">
                <a
                  href={`https://etherscan.io/tx/${transaction.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-cyan-400 hover:underline text-xs"
                >
                  <span>View on Block Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#1C273A] text-[10px] text-slate-400 font-sans">
                Source recorded as {transaction.source}. No onchain transaction hash is fabricated.
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          Close Receipt
        </button>
      </div>
    </div>
  );
};

