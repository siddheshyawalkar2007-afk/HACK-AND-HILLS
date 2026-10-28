import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  ArrowLeftRight,
  TrendingUp,
  Gauge,
  Wallet,
  History,
  FlaskConical,
  Database,
  ShieldCheck,
  Coins,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useWeb3 } from '../../context/Web3Context';

export type NavTab =
  | 'dashboard'
  | 'profile'
  | 'clearswap'
  | 'timeMachine'
  | 'creditSimulator'
  | 'lending'
  | 'transactions'
  | 'scenarioLab'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { creditAssessment, portfolioValueUsd, activeLoan, resetDemoData, workspaceMode, setWorkspaceMode } = useApp();
  const { mode } = useWeb3();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'profile' as NavTab, label: 'My Financial Profile', icon: UserCheck, badge: 'Studio' },
    { id: 'clearswap' as NavTab, label: 'ClearSwap', icon: ArrowLeftRight, badge: 'Trade' },
    { id: 'timeMachine' as NavTab, label: 'Financial Time Machine', icon: TrendingUp, badge: 'Sim' },
    { id: 'creditSimulator' as NavTab, label: 'Credit Flight Simulator', icon: Gauge, badge: 'Score' },
    { id: 'lending' as NavTab, label: 'My Loans & Lending', icon: Wallet, badge: activeLoan ? '1 Active' : null },
    { id: 'transactions' as NavTab, label: 'Transaction History', icon: History, badge: null },
    { id: 'scenarioLab' as NavTab, label: 'Scenario Lab (Cases A-H)', icon: FlaskConical, badge: '8 Cases' },
    { id: 'settings' as NavTab, label: 'Supabase & Web3 Settings', icon: Database, badge: null },
  ];

  return (
    <aside className="w-64 lg:w-72 bg-[#0B0F17] border-r border-[#1F2E45] flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Platform Branding */}
      <div className="p-6 border-b border-[#1F2E45]/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Coins className="w-6 h-6 text-[#0B0F17]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-wider text-white">EXIDO</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30">
                NEXUS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight mt-0.5">
              Financial Resilience Engine
            </p>
          </div>
        </div>

        {/* Workspace Mode Indicator */}
        <div className="mt-3 p-1.5 rounded-lg bg-[#141C2B] border border-[#1E2A3C] flex items-center justify-between text-[11px] font-mono">
          <button
            onClick={() => setWorkspaceMode('USER_WORKSPACE')}
            className={`px-2 py-0.5 rounded transition-all ${
              workspaceMode === 'USER_WORKSPACE'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            User Studio
          </button>
          <button
            onClick={() => setWorkspaceMode('DEMO_MODE')}
            className={`px-2 py-0.5 rounded transition-all ${
              workspaceMode === 'DEMO_MODE'
                ? 'bg-amber-500/20 text-amber-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo Presets
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase">
          Modules & Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#162032]/60'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono flex-shrink-0 ${
                    isActive
                      ? 'bg-cyan-500/30 text-cyan-200'
                      : 'bg-[#1E293B] text-slate-400 group-hover:bg-[#28384E]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Status / Metrics Footer */}
      <div className="p-4 border-t border-[#1F2E45]/80 bg-[#0E1420]/80 space-y-3">
        <div className="p-3 rounded-lg bg-[#141C2B] border border-[#1E2A3C]">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Credit Score:</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {creditAssessment.score}/100
            </span>
          </div>
          <div className="w-full bg-[#1F2E45] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                creditAssessment.score >= 80
                  ? 'bg-emerald-400'
                  : creditAssessment.score >= 60
                  ? 'bg-cyan-400'
                  : creditAssessment.score >= 40
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${creditAssessment.score}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
            <span>Portfolio: ${portfolioValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-emerald-400">{activeLoan ? '1 Loan' : 'Debt Free'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${workspaceMode === 'USER_WORKSPACE' ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-mono text-[11px]">{workspaceMode === 'USER_WORKSPACE' ? 'USER WORKSPACE' : 'DEMO MODE'}</span>
          </span>
          <button
            onClick={resetDemoData}
            className="text-[11px] text-slate-400 hover:text-cyan-300 underline font-mono cursor-pointer"
          >
            Reset Data
          </button>
        </div>
      </div>
    </aside>
  );
};
