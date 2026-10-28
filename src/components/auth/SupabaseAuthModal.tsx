import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Database,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Shield,
  UserCheck,
  Key,
  Info,
} from 'lucide-react';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const {
    signInDemo,
    signUpDemo,
    signInSupabase,
    signUpSupabase,
    isBackendConnected,
    listDemoAccounts,
  } = useAuth();

  // Mode: Demo Auth (local prototype) vs Supabase Cloud
  const [authProviderTab, setAuthProviderTab] = useState<'demo' | 'supabase'>('demo');
  const [flowMode, setFlowMode] = useState<'signin' | 'signup'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredDemoEmails, setRegisteredDemoEmails] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRegisteredDemoEmails(listDemoAccounts());
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Fill Example Test Credentials
  const handleFillExampleCredentials = () => {
    setEmail('student@example.test');
    setPassword('DemoPass123!');
    setConfirmPassword('DemoPass123!');
    setErrorMsg(null);
  };

  const handleSelectExistingDemoAccount = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword('');
    setConfirmPassword('');
    setFlowMode('signin');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (authProviderTab === 'demo') {
      if (flowMode === 'signup') {
        const res = await signUpDemo(email, password, confirmPassword, displayName);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to create demo account');
        } else {
          setSuccessMsg('Demo account registered successfully! Signing into your workspace...');
          setTimeout(() => {
            onClose();
          }, 800);
        }
      } else {
        const res = await signInDemo(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Incorrect email or password');
        } else {
          setSuccessMsg('Welcome back! Opening your personal workspace...');
          setTimeout(() => {
            onClose();
          }, 800);
        }
      }
    } else {
      // Supabase Cloud Auth
      if (flowMode === 'signup') {
        const res = await signUpSupabase(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to sign up with Supabase');
        } else {
          setSuccessMsg('Supabase account registered! Please check email if confirmation is enabled.');
        }
      } else {
        const res = await signInSupabase(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to sign in with Supabase');
        } else {
          onClose();
        }
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#111827] border border-[#1F2E45] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2E45] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">EXIDO Nexus Authentication</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {authProviderTab === 'demo'
                  ? 'Local Demo Mode (No Email Verification Required)'
                  : 'Supabase Cloud Authentication'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Demo Auth vs Supabase Auth */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#141C2B] rounded-xl border border-[#1F2E45] text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setAuthProviderTab('demo');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              authProviderTab === 'demo'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Demo Authentication</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthProviderTab('supabase');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              authProviderTab === 'supabase'
                ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Cloud Auth</span>
          </button>
        </div>

        {/* DEMO AUTHENTICATION VIEW */}
        {authProviderTab === 'demo' && (
          <div className="space-y-3.5">
            {/* Quick Test Preset Badge */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-cyan-300 block font-mono">Example Demo Credentials:</span>
                <span className="text-[11px] text-slate-300 font-mono">
                  student@example.test • DemoPass123!
                </span>
              </div>
              <button
                type="button"
                onClick={handleFillExampleCredentials}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold border border-cyan-500/40 transition-colors cursor-pointer"
              >
                Auto Fill
              </button>
            </div>

            {/* Previously Registered Accounts Chips (if any) */}
            {registeredDemoEmails.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block">
                  Registered Demo Accounts on this machine:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {registeredDemoEmails.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => handleSelectExistingDemoAccount(em)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        email === em
                          ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50'
                          : 'bg-[#162032] text-slate-400 hover:text-white border border-[#22334D]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUPABASE STATUS NOTICE */}
        {authProviderTab === 'supabase' && !isBackendConnected && (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Supabase Not Yet Connected</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Live Supabase credentials are not detected in environment variables. Switch to Demo Authentication or configure credentials.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="text-cyan-300 font-mono underline hover:text-cyan-200 text-[11px] pt-1 block cursor-pointer"
            >
              Configure Supabase Settings & Run Migration
            </button>
          </div>
        )}

        {/* Sub-toggle: Sign In vs Sign Up */}
        <div className="flex items-center justify-between border-b border-[#1F2E45]/80 pb-2">
          <div className="flex items-center space-x-3 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setFlowMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`pb-1 transition-all ${
                flowMode === 'signin'
                  ? 'text-cyan-300 font-bold border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setFlowMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`pb-1 transition-all ${
                flowMode === 'signup'
                  ? 'text-cyan-300 font-bold border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New Account
            </button>
          </div>

          <span className="text-[10px] font-mono text-slate-500">
            {flowMode === 'signup' ? 'Instant Activation' : 'Password Verified'}
          </span>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          {flowMode === 'signup' && (
            <div>
              <label className="text-slate-300 block mb-1">Display Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Alice / Nexus Trader"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#162032] border border-[#22334D] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          <div>
            <label className="text-slate-300 block mb-1">
              Hypothetical Email Address <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="trader@example.test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#162032] border border-[#22334D] rounded-xl pl-9 pr-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">
              Password <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#162032] border border-[#22334D] rounded-xl pl-9 pr-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {flowMode === 'signup' && (
            <div>
              <label className="text-slate-300 block mb-1">
                Confirm Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#162032] border border-[#22334D] rounded-xl pl-9 pr-3.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-[#0B0F17] font-bold text-xs shadow-md transition-all cursor-pointer mt-2 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Processing...'
              : flowMode === 'signup'
              ? authProviderTab === 'demo'
                ? 'Register & Open Workspace'
                : 'Register Supabase Account'
              : authProviderTab === 'demo'
              ? 'Sign In to Demo Workspace'
              : 'Sign In to Supabase'}
          </button>
        </form>

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-[#0E1522] border border-[#1C273A] text-[10px] text-slate-400 font-mono leading-relaxed">
          <span className="font-bold text-slate-300">Prototype Security Architecture:</span>{' '}
          {authProviderTab === 'demo' ? (
            <span>
              Demo accounts use client-side salted SHA-256 cryptographic hashing to avoid storing plaintext passwords in localStorage. This allows instant testing with hypothetical credentials without external email infrastructure. It is designed for hackathon evaluation, not production security.
            </span>
          ) : (
            <span>
              Supabase Cloud Authentication uses industry-standard BCrypt server-side hashing with Row-Level Security policies.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
