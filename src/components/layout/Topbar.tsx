import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  Shield,
  Database,
  User,
  LogOut,
  ExternalLink,
  ChevronDown,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Cloud,
  UserCheck,
  Layers,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopbarProps {
  onOpenAuthModal: () => void;
  onOpenSettings: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenAuthModal, onOpenSettings, onNavigateTab }) => {
  const {
    mode,
    setMode,
    account,
    networkName,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
  } = useWeb3();

  const { user, profile, signOut, isBackendConnected } = useAuth();
  const { workspaceMode, setWorkspaceMode, activeScenarioId, savedScenarios, isCloudSynced } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const activeScenario = savedScenarios.find((s) => s.id === activeScenarioId);

  const truncatedAccount = account
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : null;

  return (
    <header className="sticky top-0 z-20 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#1F2E45] px-6 py-3.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Workspace Selector & Network */}
        <div className="flex items-center space-x-3 flex-wrap">
          {/* Workspace Switcher */}
          <div className="flex items-center bg-[#141C2B] p-1 rounded-lg border border-[#1F2E45]">
            <button
              onClick={() => setWorkspaceMode('USER_WORKSPACE')}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
                workspaceMode === 'USER_WORKSPACE'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>User Workspace</span>
            </button>
            <button
              onClick={() => setWorkspaceMode('DEMO_MODE')}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
                workspaceMode === 'DEMO_MODE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demo Presets
            </button>
          </div>

          {/* Active Scenario Pill */}
          {activeScenario && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Scenario: {activeScenario.name}</span>
            </div>
          )}

          {/* Network Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg bg-[#141C2B] border border-[#1F2E45] text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>{mode === 'WALLET' ? networkName : 'Simulated Hardhat / EVM'}</span>
          </div>

          {/* Supabase Status Pill */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
              isBackendConnected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/70'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-950/60'
            }`}
            title="Click to view database connection status and credentials"
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {isBackendConnected
                ? 'Supabase: Connected (RLS Active)'
                : 'Backend: Standalone Demo'}
            </span>
          </button>
        </div>

        {/* Right Side: Wallet Connection & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Wallet Action */}
          {isConnected ? (
            <div className="flex items-center space-x-2 bg-[#141C2B] border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{truncatedAccount}</span>
              <button
                onClick={disconnectWallet}
                className="ml-2 text-slate-400 hover:text-rose-400 transition-colors"
                title="Disconnect Wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-semibold text-xs tracking-wide transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
            </button>
          )}

          {/* User Account / Auth */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#141C2B] border border-[#1F2E45] hover:border-slate-500 transition-all text-xs text-slate-200"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-[10px] text-cyan-300 font-bold">
                    {profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium max-w-[120px] truncate">{profile?.displayName || 'User'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#121A28] border border-[#1F2E45] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 font-mono text-xs">
                    <div className="px-3 py-2 border-b border-[#1F2E45]/80">
                      <div className="font-semibold text-white truncate">{profile?.displayName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <div className="mt-1 text-[10px] text-cyan-400">UID: {user.id.substring(0, 10)}...</div>
                    </div>
                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onNavigateTab('profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-[#1E293B] flex items-center space-x-2 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>My Financial Profile</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-[#1E293B] flex items-center space-x-2 cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-slate-400" />
                      <span>Database & Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-950/40 flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#141C2B] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/30 text-xs font-medium transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Supabase Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Demo Notice Banner only when in DEMO_MODE */}
      {workspaceMode === 'DEMO_MODE' && (
        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-[11px] text-amber-300">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 font-mono font-bold text-[10px]">
              DEMO PRESETS
            </span>
            <span>
              Currently viewing standardized hackathon demo datasets. Switch to <strong>User Workspace</strong> to customize your own data.
            </span>
          </div>
          <button
            onClick={() => setWorkspaceMode('USER_WORKSPACE')}
            className="text-cyan-300 underline font-mono hover:text-white cursor-pointer"
          >
            Switch to User Workspace
          </button>
        </div>
      )}
    </header>
  );
};
