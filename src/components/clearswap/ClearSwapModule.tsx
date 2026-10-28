import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useWeb3 } from '../../context/Web3Context';
import { TokenSymbol, TransactionRecord } from '../../core/types';
import { calculateSwap } from '../../core/swapEngine';
import {
  ArrowDownUp,
  Settings,
  Info,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

interface ClearSwapModuleProps {
  onOpenReceipt: (txId: string) => void;
}

export const ClearSwapModule: React.FC<ClearSwapModuleProps> = ({ onOpenReceipt }) => {
  const { tokens, executeSwap } = useApp();
  const { mode } = useWeb3();

  const [fromSymbol, setFromSymbol] = useState<TokenSymbol>('USDC');
  const [toSymbol, setToSymbol] = useState<TokenSymbol>('ETH');
  const [amountInText, setAmountInText] = useState<string>('200');
  const [slippagePercent, setSlippagePercent] = useState<number>(0.5);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [lastReceipt, setLastReceipt] = useState<TransactionRecord | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const tokenIn = tokens[fromSymbol];
  const tokenOut = tokens[toSymbol];

  const amountInNum = parseFloat(amountInText) || 0;

  // Swap calculation preview
  const swapResult = useMemo(() => {
    return calculateSwap({
      tokenIn,
      tokenOut,
      amountIn: amountInNum,
      slippageTolerancePercent: slippagePercent,
      feePercent: 0.3,
    });
  }, [tokenIn, tokenOut, amountInNum, slippagePercent]);

  // Flip tokens
  const handleFlipTokens = () => {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
  };

  // Quick percent buttons
  const handleQuickPercent = (pct: number) => {
    const calculated = (tokenIn.balance * (pct / 100)).toFixed(
      tokenIn.symbol === 'ETH' || tokenIn.symbol === 'WBTC' ? 4 : 2
    );
    setAmountInText(calculated);
  };

  // Execute Swap Confirmation
  const handleConfirmSwap = () => {
    const result = executeSwap({
      tokenInSymbol: fromSymbol,
      tokenOutSymbol: toSymbol,
      amountIn: amountInNum,
      slippageTolerancePercent: slippagePercent,
    });

    setIsConfirmModalOpen(false);

    if (result.success && result.tx) {
      setLastReceipt(result.tx);
    }
  };

  const copyReceiptId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Module Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
          <span>MODULE A</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span>SIMULATED AMM & ROUTER</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">ClearSwap DEX</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Deterministic decentralized swapping with explicit fee transparency and balance protection.
        </p>
      </div>

      {/* Main Swap Card */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-[#1F2E45] shadow-2xl relative">
        {/* Slippage & Settings Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1F2E45]/80 mb-4">
          <span className="text-xs font-medium text-slate-400">Swap Execution</span>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Slippage:</span>
            {[0.1, 0.5, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => setSlippagePercent(s)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
                  slippagePercent === s
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50'
                    : 'bg-[#182335] text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* FROM TOKEN SECTION */}
        <div className="p-4 rounded-xl bg-[#162032] border border-[#22334D] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>You Pay (From)</span>
            <div className="flex items-center space-x-1.5 font-mono">
              <span>Available:</span>
              <span className="text-cyan-300 font-semibold">
                {tokenIn.balance.toLocaleString()} {tokenIn.symbol}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={amountInText}
              onChange={(e) => setAmountInText(e.target.value)}
              placeholder="0.00"
              min="0"
              step="any"
              className="w-full bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
            />

            <select
              value={fromSymbol}
              onChange={(e) => {
                const newSym = e.target.value as TokenSymbol;
                if (newSym === toSymbol) setToSymbol(fromSymbol);
                setFromSymbol(newSym);
              }}
              className="bg-[#1D2B42] text-white border border-[#2D4163] rounded-lg px-3 py-1.5 font-semibold text-sm focus:outline-none focus:border-cyan-400"
            >
              {Object.keys(tokens).map((sym) => (
                <option key={sym} value={sym}>
                  {sym}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 font-mono">
              ≈ ${(amountInNum * tokenIn.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </span>
            <div className="flex items-center space-x-1">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handleQuickPercent(pct)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1E2B40] text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
                >
                  {pct === 100 ? 'MAX' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FLIP BUTTON */}
        <div className="flex justify-center -my-2.5 relative z-10">
          <button
            onClick={handleFlipTokens}
            className="w-9 h-9 rounded-full bg-[#1A263B] border border-[#2B3E5C] text-cyan-400 hover:text-white hover:bg-cyan-600 transition-all flex items-center justify-center shadow-lg"
            title="Invert swap direction"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* TO TOKEN SECTION */}
        <div className="p-4 rounded-xl bg-[#162032] border border-[#22334D] space-y-2 mt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>You Receive (Estimated)</span>
            <div className="flex items-center space-x-1.5 font-mono">
              <span>Balance:</span>
              <span className="text-slate-300">
                {tokenOut.balance.toLocaleString()} {tokenOut.symbol}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-full text-2xl font-bold font-mono text-cyan-300 truncate">
              {swapResult.amountOut > 0 ? swapResult.amountOut.toLocaleString() : '0.00'}
            </div>

            <select
              value={toSymbol}
              onChange={(e) => {
                const newSym = e.target.value as TokenSymbol;
                if (newSym === fromSymbol) setFromSymbol(toSymbol);
                setToSymbol(newSym);
              }}
              className="bg-[#1D2B42] text-white border border-[#2D4163] rounded-lg px-3 py-1.5 font-semibold text-sm focus:outline-none focus:border-cyan-400"
            >
              {Object.keys(tokens).map((sym) => (
                <option key={sym} value={sym}>
                  {sym}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            ≈ ${(swapResult.amountOut * tokenOut.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
        </div>

        {/* SWAP METRICS BREAKDOWN */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#0E1522] border border-[#1C273A] space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Exchange Rate:</span>
            <span className="text-slate-200 font-semibold">
              1 {tokenIn.symbol} = {swapResult.exchangeRate.toFixed(6)} {tokenOut.symbol}
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Protocol Trading Fee (0.3%):</span>
            <span className="text-slate-200">
              {swapResult.feeAmount} {tokenIn.symbol} (~${(swapResult.feeAmount * tokenIn.priceUsd).toFixed(2)})
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Minimum Received ({slippagePercent}% slippage):</span>
            <span className="text-emerald-400 font-semibold">
              {swapResult.minimumReceived} {tokenOut.symbol}
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Estimated Price Impact:</span>
            <span className="text-slate-300">{swapResult.priceImpactPercent}%</span>
          </div>
        </div>

        {/* VALIDATION ERROR (e.g. Case G) */}
        {!swapResult.isValid && swapResult.validationError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{swapResult.validationError}</span>
          </div>
        )}

        {/* SWAP BUTTON */}
        <button
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={!swapResult.isValid || amountInNum <= 0}
          className={`mt-5 w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer ${
            swapResult.isValid && amountInNum > 0
              ? 'bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-400 hover:from-cyan-500 hover:to-emerald-300 text-[#0B0F17] shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {amountInNum <= 0
            ? 'Enter an Amount'
            : !swapResult.isValid
            ? 'Swap Blocked'
            : `Swap ${fromSymbol} for ${toSymbol}`}
        </button>
      </div>

      {/* CONFIRMATION MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-[#1F2E45] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1F2E45] pb-3">
              <h3 className="text-base font-bold text-white">Review Swap Order</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                {mode}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#162032] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">You are paying</span>
                  <span className="text-lg font-bold font-mono text-white">
                    {amountInNum} {fromSymbol}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500" />
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">You will receive</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {swapResult.amountOut} {toSymbol}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-2 p-3 rounded-xl bg-[#0E1522] border border-[#1C273A] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Trading Fee (0.3%):</span>
                  <span className="text-slate-200">{swapResult.feeAmount} {fromSymbol}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Guaranteed Minimum:</span>
                  <span className="text-slate-200">{swapResult.minimumReceived} {toSymbol}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Slippage Tolerance:</span>
                  <span className="text-slate-200">{slippagePercent}%</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                By confirming, your wallet balances will update immediately in {mode} mode. All rates are calculated deterministically.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#28384E] text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwap}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Confirm Swap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SWAP RECEIPT MODAL */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Swap Receipt Generated</h3>
              <p className="text-xs text-slate-400">
                Transaction confirmed and recorded in local state & database.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1522] border border-[#1C273A] space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400">
                <span>Transaction ID:</span>
                <button
                  onClick={() => copyReceiptId(lastReceipt.id)}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
                >
                  <span>{lastReceipt.id.substring(0, 14)}...</span>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Swapped:</span>
                <span className="text-white font-semibold">
                  {lastReceipt.amountIn} {lastReceipt.tokenIn}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Received:</span>
                <span className="text-emerald-400 font-semibold">
                  {lastReceipt.amountOut} {lastReceipt.tokenOut}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Protocol Fee:</span>
                <span className="text-slate-300">{lastReceipt.fee} {lastReceipt.tokenIn}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Timestamp:</span>
                <span className="text-slate-300">{new Date(lastReceipt.timestamp).toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Source:</span>
                <span className="px-2 py-0.5 rounded bg-[#1A263B] text-cyan-300 text-[10px]">
                  {lastReceipt.source}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setLastReceipt(null)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

