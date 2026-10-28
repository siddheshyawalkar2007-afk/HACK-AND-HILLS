import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Key,
  Globe,
  RefreshCw,
  Terminal,
} from 'lucide-react';

const SQL_MIGRATION_SAMPLE = `-- ==============================================================================
-- EXIDO Nexus Initial Migration (supabase/migrations/20260228_initial_schema.sql)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT,
    display_name TEXT DEFAULT 'Nexus Trader',
    estimated_credit_score INTEGER DEFAULT 68,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.token_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    balance NUMERIC(28, 8) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    principal NUMERIC(18, 4) NOT NULL,
    outstanding_balance NUMERIC(18, 4) NOT NULL,
    interest_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 4.50,
    duration_days INTEGER NOT NULL DEFAULT 30,
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REPAID', 'OVERDUE')),
    source TEXT NOT NULL DEFAULT 'SUPABASE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    amount_in NUMERIC(28, 8),
    fee NUMERIC(18, 6) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    source TEXT NOT NULL DEFAULT 'SUPABASE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can only access own tokens" ON public.token_balances FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access own loans" ON public.loans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access own txs" ON public.transactions FOR ALL USING (auth.uid() = user_id);`;

export const DatabaseSettingsView: React.FC = () => {
  const { isBackendConnected, connectionStatusMessage, isConfigured, updateConfig, checkConnection } = useAuth();
  const { lendingContractAddress, usdcContractAddress, isContractConfigured, networkName, chainId, mode } = useWeb3();

  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem('EXIDO_RUNTIME_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    localStorage.getItem('EXIDO_RUNTIME_SUPABASE_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    updateConfig(supabaseUrl, supabaseAnonKey);
    await checkConnection();
    setIsTesting(false);
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SAMPLE);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>BACKEND & BLOCKCHAIN INTEGRATION</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">System Configuration & Integrations</h1>
        <p className="text-xs text-slate-400 max-w-xl">
          Supabase PostgreSQL, Row Level Security (RLS), and Web3 smart contract settings.
        </p>
      </div>

      {/* Supabase Status Banner */}
      <div
        className={`p-5 rounded-2xl border ${
          isBackendConnected
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
            : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isBackendConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isBackendConnected
                  ? 'Supabase PostgreSQL: Connected & Isolated'
                  : 'Supabase PostgreSQL: Standalone Demo Mode'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">{connectionStatusMessage}</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
              isBackendConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isBackendConnected ? 'RLS ACTIVE' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Supabase Credentials Input */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2E45]/80">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Supabase Connection Parameters</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Environment or Runtime</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 block font-medium mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full bg-[#162032] border border-[#22334D] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block font-medium mb-1">
                Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full bg-[#162032] border border-[#22334D] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={handleSaveAndTest}
                disabled={isTesting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Connecting...' : 'Save & Test Connection'}</span>
              </button>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="p-3.5 rounded-xl bg-[#0E1522] border border-[#1C273A] space-y-1.5 text-xs text-slate-300">
            <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider font-mono">
              3-Step Supabase Setup:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[11px]">
              <li>Create a free project at <span className="text-cyan-400">supabase.com</span>.</li>
              <li>Go to SQL Editor and run the migration script shown on the right.</li>
              <li>Copy your Project URL and Anon API key into the inputs above or your <span className="font-mono text-cyan-300">.env</span> file.</li>
            </ol>
          </div>
        </div>

        {/* RIGHT: SQL Migration Script Preview */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2E45]/80">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>PostgreSQL Migration & RLS</span>
              </h3>
              <button
                onClick={copySql}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#182438] hover:bg-[#20314C] text-cyan-300 text-xs font-mono transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Defines user profiles, loans, repayments, and enforces Row-Level Security so users access only their own private records.
            </p>

            <div className="mt-3 p-3 rounded-xl bg-[#090D14] border border-[#1C273A] max-h-56 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed">
              <pre>{SQL_MIGRATION_SAMPLE}</pre>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            File location: <span className="text-cyan-300">supabase/migrations/20260228_initial_schema.sql</span>
          </div>
        </div>
      </div>

      {/* Smart Contract & Web3 Status Card */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-[#1F2E45] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2 font-mono">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>Smart Contract & EVM Configuration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#162032] border border-[#22334D]">
            <span className="text-slate-400 block text-[11px]">Network:</span>
            <span className="text-white font-bold mt-1 block">{networkName} (Chain ID {chainId})</span>
          </div>

          <div className="p-3 rounded-xl bg-[#162032] border border-[#22334D]">
            <span className="text-slate-400 block text-[11px]">ExidoLending Contract:</span>
            <span className="text-slate-200 mt-1 block truncate">
              {lendingContractAddress || 'Not Configured (Using Demo Engine)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#162032] border border-[#22334D]">
            <span className="text-slate-400 block text-[11px]">Mock USDC Contract:</span>
            <span className="text-slate-200 mt-1 block truncate">
              {usdcContractAddress || 'Not Configured (Using Demo Engine)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

