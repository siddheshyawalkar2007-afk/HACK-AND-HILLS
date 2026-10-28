import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Token,
  TokenSymbol,
  LoanRecord,
  TransactionRecord,
  PlannedTransaction,
  CreditSimulatorInputs,
  CreditAssessmentResult,
  TimeMachineInputs,
  TimeMachineResult,
  UserFinancialProfileData,
  SavedScenarioRecord,
  WorkspaceMode,
} from '../core/types';
import { INITIAL_DEMO_TOKENS, INITIAL_DEMO_LOANS, INITIAL_DEMO_TRANSACTIONS } from '../lib/initialDemoData';
import { calculateCreditAssessment } from '../core/creditScoring';
import { calculateSwap } from '../core/swapEngine';
import { runTimeMachineSimulation } from '../core/timeMachineEngine';
import { useAuth } from './AuthContext';
import { SupabaseDb } from '../lib/supabase';

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  // Mode & Workspace
  workspaceMode: WorkspaceMode;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  activeScenarioId: string | null;
  savedScenarios: SavedScenarioRecord[];
  isCloudSynced: boolean;
  isSaving: boolean;

  // Active Financial Data (User Workspace or Demo)
  tokens: Record<string, Token>;
  loans: LoanRecord[];
  transactions: TransactionRecord[];
  plannedTransactions: PlannedTransaction[];
  activeLoan: LoanRecord | undefined;
  nextRepayment: { amount: number; dueDate: string; daysLeft: number } | null;
  portfolioValueUsd: number;
  totalDebtUsd: number;

  // Notifications
  notifications: NotificationToast[];
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  removeNotification: (id: string) => void;

  // ClearSwap Actions
  executeSwap: (params: {
    tokenInSymbol: string;
    tokenOutSymbol: string;
    amountIn: number;
    slippageTolerancePercent?: number;
  }) => { success: boolean; tx?: TransactionRecord; error?: string };

  // Lending Actions
  applyForLoan: (params: {
    amount: number;
    durationDays?: number;
  }) => { success: boolean; message: string; loan?: LoanRecord };

  repayLoan: (params: {
    loanId: string;
    amount: number;
  }) => { success: boolean; message: string };

  // Credit Flight Simulator State & Actions
  creditInputs: CreditSimulatorInputs;
  setCreditInputs: React.Dispatch<React.SetStateAction<CreditSimulatorInputs>>;
  creditAssessment: CreditAssessmentResult;
  updateCreditInputFactor: <K extends keyof CreditSimulatorInputs>(key: K, val: CreditSimulatorInputs[K]) => void;
  resetCreditSimulator: () => void;

  // Time Machine State & Actions
  timeMachineInputs: TimeMachineInputs;
  setTimeMachineInputs: React.Dispatch<React.SetStateAction<TimeMachineInputs>>;
  timeMachineResult: TimeMachineResult;

  // My Financial Profile Management Actions
  updateStablecoinBalance: (amount: number) => void;
  addOrUpdateToken: (token: Token) => void;
  deleteToken: (symbol: string) => void;
  addPlannedTransaction: (tx: Omit<PlannedTransaction, 'id' | 'createdAt'>) => void;
  deletePlannedTransaction: (id: string) => void;
  addHypotheticalLoan: (loan: Omit<LoanRecord, 'id' | 'createdAt' | 'dueDateTimestamp'>) => void;
  updateHypotheticalLoan: (id: string, updates: Partial<LoanRecord>) => void;
  deleteHypotheticalLoan: (id: string) => void;
  saveCurrentFinancialProfile: () => Promise<boolean>;

  // Scenario Management
  saveCurrentAsScenario: (name: string, description: string) => Promise<boolean>;
  loadSavedScenario: (scenarioId: string) => void;
  deleteSavedScenario: (scenarioId: string) => Promise<boolean>;

  // Demo & Scenario Lab Controls
  resetDemoData: () => void;
  loadScenarioPreset: (scenarioId: 'CASE_A' | 'CASE_B' | 'CASE_C' | 'CASE_D' | 'CASE_E' | 'CASE_F' | 'CASE_G' | 'CASE_H') => void;
}

const DEFAULT_USER_CREDIT_INPUTS: CreditSimulatorInputs = {
  repaymentCompletedOnTime: true,
  repaymentOverdue: false,
  availableLiquidBalance: 800,
  outstandingLoanAmount: 0,
  walletActivityTxCount: 10,
  walletAgeMonths: 6,
  repaymentConsistencyPercent: 90,
  requestedLoanAmount: 250,
};

const DEFAULT_USER_TIME_MACHINE_INPUTS: TimeMachineInputs = {
  startingUsdc: 800,
  plannedSwapToken: 'ETH',
  plannedSwapAmount: 150,
  feePercent: 0.3,
  priceShockPercent: 0,
  expectedIncome: 0,
  repaymentAmount: 0,
  repaymentDueDays: 7,
  otherExpenses: 0,
  simulationDays: 7,
  volatileHoldingSymbol: 'ETH',
  volatileHoldingAmount: 0.25,
  volatileHoldingPriceUsd: 3000,
};

const DEFAULT_USER_TOKENS: Record<string, Token> = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    balance: 800.0,
    priceUsd: 1.0,
    isStable: true,
    color: '#2775CA',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    balance: 0.25,
    priceUsd: 3000.0,
    isStable: false,
    color: '#627EEA',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    balance: 200.0,
    priceUsd: 1.0,
    isStable: true,
    color: '#26A17B',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isBackendConnected } = useAuth();

  // Active Workspace Mode
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(() => {
    return user ? 'USER_WORKSPACE' : 'DEMO_MODE';
  });

  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenarioRecord[]>([]);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Active Financial Data state
  const [tokens, setTokens] = useState<Record<string, Token>>(INITIAL_DEMO_TOKENS);
  const [loans, setLoans] = useState<LoanRecord[]>(INITIAL_DEMO_LOANS);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_DEMO_TRANSACTIONS);
  const [plannedTransactions, setPlannedTransactions] = useState<PlannedTransaction[]>([]);
  const [creditInputs, setCreditInputs] = useState<CreditSimulatorInputs>(DEFAULT_USER_CREDIT_INPUTS);
  const [timeMachineInputs, setTimeMachineInputs] = useState<TimeMachineInputs>(DEFAULT_USER_TIME_MACHINE_INPUTS);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  // Toast Helpers
  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeNotification(id);
    }, 6000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Load User Workspace when user logs in or switches mode
  useEffect(() => {
    if (user && workspaceMode === 'USER_WORKSPACE') {
      const userKey = `EXIDO_USER_${user.id}_PROFILE`;
      const scenariosKey = `EXIDO_USER_${user.id}_SCENARIOS`;

      // 1. Try loading from Supabase first if backend connected
      if (isBackendConnected) {
        SupabaseDb.getUserFinancialProfile(user.id).then((cloudProfile) => {
          if (cloudProfile) {
            applyLoadedProfile(cloudProfile);
            setIsCloudSynced(true);
          } else {
            // Check local fallback
            loadFromLocalStorage(userKey);
          }
        });

        SupabaseDb.getUserScenarios(user.id).then((cloudScenarios) => {
          if (cloudScenarios && cloudScenarios.length > 0) {
            setSavedScenarios(cloudScenarios);
          } else {
            const savedLocalScenarios = localStorage.getItem(scenariosKey);
            if (savedLocalScenarios) setSavedScenarios(JSON.parse(savedLocalScenarios));
          }
        });
      } else {
        // Standalone user workspace in localStorage
        loadFromLocalStorage(userKey);
        const savedLocalScenarios = localStorage.getItem(scenariosKey);
        if (savedLocalScenarios) setSavedScenarios(JSON.parse(savedLocalScenarios));
        setIsCloudSynced(false);
      }
    } else if (workspaceMode === 'DEMO_MODE') {
      // Revert to Demo Data
      const savedTokens = localStorage.getItem('EXIDO_DEMO_TOKENS');
      const savedLoans = localStorage.getItem('EXIDO_DEMO_LOANS');
      const savedTxs = localStorage.getItem('EXIDO_DEMO_TRANSACTIONS');

      setTokens(savedTokens ? JSON.parse(savedTokens) : INITIAL_DEMO_TOKENS);
      setLoans(savedLoans ? JSON.parse(savedLoans) : INITIAL_DEMO_LOANS);
      setTransactions(savedTxs ? JSON.parse(savedTxs) : INITIAL_DEMO_TRANSACTIONS);
      setPlannedTransactions([]);
      setActiveScenarioId(null);
    }
  }, [user, workspaceMode, isBackendConnected]);

  const loadFromLocalStorage = (userKey: string) => {
    const saved = localStorage.getItem(userKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserFinancialProfileData;
        applyLoadedProfile(parsed);
      } catch (e) {
        console.error('Error parsing local user profile:', e);
      }
    } else {
      // Initialize with fresh starter profile
      setTokens(DEFAULT_USER_TOKENS);
      setLoans([]);
      setTransactions([]);
      setPlannedTransactions([]);
      setCreditInputs(DEFAULT_USER_CREDIT_INPUTS);
      setTimeMachineInputs(DEFAULT_USER_TIME_MACHINE_INPUTS);
    }
  };

  const applyLoadedProfile = (p: UserFinancialProfileData) => {
    if (p.tokens) setTokens(p.tokens);
    if (p.loans) setLoans(p.loans);
    if (p.plannedTransactions) setPlannedTransactions(p.plannedTransactions);
    if (p.creditInputs) setCreditInputs(p.creditInputs);
    if (p.timeMachineInputs) setTimeMachineInputs(p.timeMachineInputs);
  };

  // Auto-persist active data to local storage on changes
  useEffect(() => {
    if (user && workspaceMode === 'USER_WORKSPACE') {
      const userKey = `EXIDO_USER_${user.id}_PROFILE`;
      const currentProfileData: UserFinancialProfileData = {
        stablecoinBalance: tokens.USDC?.balance || 0,
        tokens,
        loans,
        plannedTransactions,
        creditInputs,
        timeMachineInputs,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(userKey, JSON.stringify(currentProfileData));
    } else if (workspaceMode === 'DEMO_MODE') {
      localStorage.setItem('EXIDO_DEMO_TOKENS', JSON.stringify(tokens));
      localStorage.setItem('EXIDO_DEMO_LOANS', JSON.stringify(loans));
      localStorage.setItem('EXIDO_DEMO_TRANSACTIONS', JSON.stringify(transactions));
    }
  }, [tokens, loans, transactions, plannedTransactions, creditInputs, timeMachineInputs, user, workspaceMode]);

  // Derived calculations
  const portfolioValueUsd = Object.values(tokens).reduce(
    (acc, token) => acc + (token.balance || 0) * (token.priceUsd || 0),
    0
  );

  const activeLoan = loans.find((l) => l.status === 'ACTIVE');
  const totalDebtUsd = loans
    .filter((l) => l.status === 'ACTIVE')
    .reduce((acc, l) => acc + l.outstandingBalance, 0);

  const nextRepayment = activeLoan
    ? {
        amount: Math.min(50, activeLoan.outstandingBalance),
        dueDate: activeLoan.dueDate,
        daysLeft: Math.max(0, Math.round((activeLoan.dueDateTimestamp - Date.now()) / 86400000)),
      }
    : null;

  // Credit calculation
  const creditAssessment = calculateCreditAssessment({
    ...creditInputs,
    availableLiquidBalance: tokens.USDC?.balance || 0,
    outstandingLoanAmount: totalDebtUsd,
  });

  // Time Machine calculation (aggregates planned flows)
  const aggregatedIncome = plannedTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, timeMachineInputs.expectedIncome);

  const aggregatedExpenses = plannedTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, timeMachineInputs.otherExpenses);

  const aggregatedRepayment = activeLoan
    ? activeLoan.outstandingBalance
    : timeMachineInputs.repaymentAmount;

  const timeMachineResult = runTimeMachineSimulation({
    ...timeMachineInputs,
    startingUsdc: tokens.USDC?.balance || timeMachineInputs.startingUsdc,
    expectedIncome: aggregatedIncome,
    otherExpenses: aggregatedExpenses,
    repaymentAmount: aggregatedRepayment,
  });

  // Credit factor update
  const updateCreditInputFactor = <K extends keyof CreditSimulatorInputs>(key: K, val: CreditSimulatorInputs[K]) => {
    setCreditInputs((prev) => ({ ...prev, [key]: val }));
  };

  const resetCreditSimulator = () => {
    setCreditInputs(DEFAULT_USER_CREDIT_INPUTS);
  };

  // --- Financial Profile Modification Actions ---

  const updateStablecoinBalance = (amount: number) => {
    setTokens((prev) => ({
      ...prev,
      USDC: {
        ...(prev.USDC || DEFAULT_USER_TOKENS.USDC),
        balance: Math.max(0, amount),
      },
    }));
    setTimeMachineInputs((prev) => ({ ...prev, startingUsdc: Math.max(0, amount) }));
  };

  const addOrUpdateToken = (token: Token) => {
    setTokens((prev) => ({
      ...prev,
      [token.symbol]: token,
    }));
    addNotification('success', 'Token Updated', `Saved ${token.symbol} (${token.balance} @ $${token.priceUsd})`);
  };

  const deleteToken = (symbol: string) => {
    if (symbol === 'USDC') {
      addNotification('warning', 'Notice', 'Primary stablecoin USDC cannot be removed, but you can set balance to 0.');
      return;
    }
    setTokens((prev) => {
      const copy = { ...prev };
      delete copy[symbol];
      return copy;
    });
    addNotification('info', 'Token Removed', `Removed ${symbol} from holdings.`);
  };

  const addPlannedTransaction = (tx: Omit<PlannedTransaction, 'id' | 'createdAt'>) => {
    const newTx: PlannedTransaction = {
      ...tx,
      id: `ptx_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPlannedTransactions((prev) => [...prev, newTx]);
    addNotification('success', 'Planned Flow Added', `Added ${tx.type}: ${tx.title} (${tx.amount} ${tx.tokenSymbol})`);
  };

  const deletePlannedTransaction = (id: string) => {
    setPlannedTransactions((prev) => prev.filter((t) => t.id !== id));
    addNotification('info', 'Flow Removed', 'Planned flow deleted.');
  };

  const addHypotheticalLoan = (loan: Omit<LoanRecord, 'id' | 'createdAt' | 'dueDateTimestamp'>) => {
    const newLoan: LoanRecord = {
      ...loan,
      id: `loan_user_${Date.now()}`,
      dueDateTimestamp: new Date(loan.dueDate).getTime(),
      createdAt: new Date().toISOString(),
    };
    setLoans((prev) => [newLoan, ...prev]);
    addNotification('success', 'Loan Added', `Registered hypothetical loan of ${loan.principal} USDC.`);
  };

  const updateHypotheticalLoan = (id: string, updates: Partial<LoanRecord>) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
    addNotification('info', 'Loan Updated', 'Hypothetical loan details updated.');
  };

  const deleteHypotheticalLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
    addNotification('info', 'Loan Deleted', 'Hypothetical loan obligation removed.');
  };

  // Save current profile to Supabase
  const saveCurrentFinancialProfile = async (): Promise<boolean> => {
    if (!user) {
      addNotification('warning', 'Sign In Required', 'Please sign in to save your personal financial profile to cloud.');
      return false;
    }

    setIsSaving(true);
    const profileData: UserFinancialProfileData = {
      stablecoinBalance: tokens.USDC?.balance || 0,
      tokens,
      loans,
      plannedTransactions,
      creditInputs,
      timeMachineInputs,
      updatedAt: new Date().toISOString(),
    };

    let cloudOk = false;
    if (isBackendConnected) {
      cloudOk = await SupabaseDb.saveUserFinancialProfile(user.id, profileData);
      setIsCloudSynced(cloudOk);
    }

    // Always persist to local user workspace
    localStorage.setItem(`EXIDO_USER_${user.id}_PROFILE`, JSON.stringify(profileData));
    setIsSaving(false);

    if (cloudOk) {
      addNotification('success', 'Profile Synced to Cloud', 'Your financial inputs are securely saved in Supabase PostgreSQL.');
    } else {
      addNotification('info', 'Profile Saved Locally', 'Saved to your personal workspace (Supabase offline).');
    }

    return true;
  };

  // --- Multi-Scenario Management Actions ---

  const saveCurrentAsScenario = async (name: string, description: string): Promise<boolean> => {
    if (!name.trim()) {
      addNotification('error', 'Name Required', 'Please give this scenario a name.');
      return false;
    }

    const currentProfileData: UserFinancialProfileData = {
      stablecoinBalance: tokens.USDC?.balance || 0,
      tokens,
      loans,
      plannedTransactions,
      creditInputs,
      timeMachineInputs,
      updatedAt: new Date().toISOString(),
    };

    const newScenarioId = `scen_${Date.now()}`;
    const newRecord: SavedScenarioRecord = {
      id: newScenarioId,
      userId: user?.id || 'local_user',
      name: name.trim(),
      description: description.trim(),
      data: currentProfileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user && isBackendConnected) {
      const inserted = await SupabaseDb.saveUserScenario(user.id, name, description, currentProfileData);
      if (inserted) {
        setSavedScenarios((prev) => [inserted, ...prev]);
        setActiveScenarioId(inserted.id);
        addNotification('success', 'Scenario Saved', `Scenario "${name}" saved to Supabase PostgreSQL.`);
        return true;
      }
    }

    // Local scenario fallback
    setSavedScenarios((prev) => [newRecord, ...prev]);
    setActiveScenarioId(newScenarioId);
    if (user) {
      localStorage.setItem(`EXIDO_USER_${user.id}_SCENARIOS`, JSON.stringify([newRecord, ...savedScenarios]));
    }
    addNotification('success', 'Scenario Saved', `Scenario "${name}" saved to your workspace.`);
    return true;
  };

  const loadSavedScenario = (scenarioId: string) => {
    const target = savedScenarios.find((s) => s.id === scenarioId);
    if (!target) {
      addNotification('error', 'Scenario Not Found', 'Could not locate saved scenario.');
      return;
    }

    applyLoadedProfile(target.data);
    setActiveScenarioId(scenarioId);
    addNotification('info', 'Scenario Loaded', `Switched active parameters to "${target.name}".`);
  };

  const deleteSavedScenario = async (scenarioId: string): Promise<boolean> => {
    if (user && isBackendConnected) {
      await SupabaseDb.deleteUserScenario(user.id, scenarioId);
    }

    setSavedScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
    if (activeScenarioId === scenarioId) {
      setActiveScenarioId(null);
    }

    if (user) {
      const remaining = savedScenarios.filter((s) => s.id !== scenarioId);
      localStorage.setItem(`EXIDO_USER_${user.id}_SCENARIOS`, JSON.stringify(remaining));
    }

    addNotification('info', 'Scenario Deleted', 'Removed scenario from your list.');
    return true;
  };

  // ClearSwap Execution
  const executeSwap = (params: {
    tokenInSymbol: string;
    tokenOutSymbol: string;
    amountIn: number;
    slippageTolerancePercent?: number;
  }) => {
    const { tokenInSymbol, tokenOutSymbol, amountIn, slippageTolerancePercent = 0.5 } = params;
    const tokenIn = tokens[tokenInSymbol];
    const tokenOut = tokens[tokenOutSymbol];

    if (!tokenIn || !tokenOut) {
      addNotification('error', 'Swap Error', 'Invalid token selection');
      return { success: false, error: 'Invalid tokens' };
    }

    const swapResult = calculateSwap({
      tokenIn,
      tokenOut,
      amountIn,
      slippageTolerancePercent,
    });

    if (!swapResult.isValid) {
      addNotification('error', 'Swap Blocked', swapResult.validationError || 'Invalid swap parameters');
      return { success: false, error: swapResult.validationError };
    }

    // Execute swap state updates
    const newTokens = { ...tokens };
    newTokens[tokenInSymbol] = {
      ...tokenIn,
      balance: Number((tokenIn.balance - amountIn).toFixed(6)),
    };
    newTokens[tokenOutSymbol] = {
      ...tokenOut,
      balance: Number((tokenOut.balance + swapResult.amountOut).toFixed(6)),
    };

    setTokens(newTokens);

    const txRecord: TransactionRecord = {
      id: `tx_${Date.now()}`,
      type: 'SWAP',
      title: `ClearSwap: ${amountIn} ${tokenInSymbol} → ${swapResult.amountOut} ${tokenOutSymbol}`,
      tokenIn: tokenInSymbol,
      tokenOut: tokenOutSymbol,
      amountIn,
      amountOut: swapResult.amountOut,
      fee: swapResult.feeAmount,
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED',
      source: workspaceMode === 'USER_WORKSPACE' ? 'SUPABASE' : 'DEMO',
      details: {
        rate: `1 ${tokenInSymbol} = ${(tokenIn.priceUsd / tokenOut.priceUsd).toFixed(6)} ${tokenOutSymbol}`,
        feeUsd: `$${(swapResult.feeAmount * tokenIn.priceUsd).toFixed(2)}`,
        minimumReceived: `${swapResult.minimumReceived} ${tokenOutSymbol}`,
        slippage: `${slippageTolerancePercent}%`,
      },
    };

    setTransactions((prev) => [txRecord, ...prev]);

    addNotification(
      'success',
      'Swap Successful',
      `Swapped ${amountIn} ${tokenInSymbol} for ${swapResult.amountOut} ${tokenOutSymbol}. Fee: ${swapResult.feeAmount} ${tokenInSymbol}.`
    );

    return { success: true, tx: txRecord };
  };

  // Lending Application
  const applyForLoan = (params: { amount: number; durationDays?: number }) => {
    const { amount, durationDays = 30 } = params;

    const assessment = calculateCreditAssessment({
      ...creditInputs,
      requestedLoanAmount: amount,
      availableLiquidBalance: tokens.USDC?.balance || 0,
      outstandingLoanAmount: totalDebtUsd,
    });

    if (assessment.eligibilityStatus === 'REJECTED') {
      addNotification('error', 'Loan Application Rejected', assessment.plainExplanation);
      return { success: false, message: assessment.plainExplanation };
    }

    if (amount > assessment.estimatedLoanLimit) {
      const msg = `Loan amount of ${amount} USDC exceeds maximum approved limit of ${assessment.estimatedLoanLimit} USDC.`;
      addNotification('warning', 'Loan Limit Restricted', msg);
      return { success: false, message: msg };
    }

    const newLoan: LoanRecord = {
      id: `loan_${Date.now()}`,
      principal: amount,
      outstandingBalance: amount,
      interestRatePercent: 4.5,
      durationDays,
      dueDate: new Date(Date.now() + durationDays * 86400000).toISOString(),
      dueDateTimestamp: Date.now() + durationDays * 86400000,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      source: workspaceMode === 'USER_WORKSPACE' ? 'SUPABASE' : 'DEMO',
    };

    setLoans((prev) => [newLoan, ...prev]);

    // Disburse tokens into USDC balance
    if (tokens.USDC) {
      setTokens((prev) => ({
        ...prev,
        USDC: {
          ...prev.USDC,
          balance: Number((prev.USDC.balance + amount).toFixed(2)),
        },
      }));
    }

    const txRecord: TransactionRecord = {
      id: `tx_${Date.now()}`,
      type: 'LOAN_DISBURSEMENT',
      title: `Disbursed ${amount} USDC Credit Facility`,
      amountIn: amount,
      tokenIn: 'USDC',
      fee: 0,
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED',
      source: workspaceMode === 'USER_WORKSPACE' ? 'SUPABASE' : 'DEMO',
      details: {
        loanId: newLoan.id,
        durationDays: `${durationDays} Days`,
        interestRate: '4.5%',
      },
    };

    setTransactions((prev) => [txRecord, ...prev]);

    addNotification(
      'success',
      'Loan Approved & Disbursed',
      `Disbursed ${amount} USDC directly to your wallet balance.`
    );

    return { success: true, message: 'Approved and disbursed', loan: newLoan };
  };

  // Repayment
  const repayLoan = (params: { loanId: string; amount: number }) => {
    const { loanId, amount } = params;
    const targetLoan = loans.find((l) => l.id === loanId);

    if (!targetLoan) {
      addNotification('error', 'Repayment Failed', 'Loan not found.');
      return { success: false, message: 'Loan not found' };
    }

    if (amount <= 0) {
      addNotification('error', 'Invalid Amount', 'Repayment amount must exceed 0.');
      return { success: false, message: 'Repayment must exceed 0' };
    }

    if (amount > targetLoan.outstandingBalance) {
      const msg = `Repayment amount (${amount} USDC) exceeds outstanding balance of ${targetLoan.outstandingBalance} USDC.`;
      addNotification('error', 'Excess Repayment Blocked', msg);
      return { success: false, message: msg };
    }

    const currentUsdc = tokens.USDC?.balance || 0;
    if (currentUsdc < amount) {
      const msg = `Insufficient USDC balance: you have ${currentUsdc} USDC, cannot repay ${amount} USDC.`;
      addNotification('error', 'Insufficient Balance', msg);
      return { success: false, message: msg };
    }

    // Deduct USDC
    setTokens((prev) => ({
      ...prev,
      USDC: {
        ...prev.USDC,
        balance: Number((prev.USDC.balance - amount).toFixed(2)),
      },
    }));

    const updatedBalance = Number((targetLoan.outstandingBalance - amount).toFixed(2));
    const isFullyPaid = updatedBalance <= 0;

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              outstandingBalance: updatedBalance,
              status: isFullyPaid ? 'REPAID' : 'ACTIVE',
              lastRepaymentDate: new Date().toISOString(),
            }
          : l
      )
    );

    const txRecord: TransactionRecord = {
      id: `tx_${Date.now()}`,
      type: 'LOAN_REPAYMENT',
      title: `${isFullyPaid ? 'Full' : 'Partial'} Loan Repayment: ${amount} USDC`,
      tokenIn: 'USDC',
      amountIn: amount,
      fee: 0,
      timestamp: new Date().toISOString(),
      status: 'CONFIRMED',
      source: workspaceMode === 'USER_WORKSPACE' ? 'SUPABASE' : 'DEMO',
      details: {
        loanId,
        amountPaid: `${amount} USDC`,
        remainingDebt: `${updatedBalance} USDC`,
        status: isFullyPaid ? 'Fully Settled' : 'Active Remaining',
      },
    };

    setTransactions((prev) => [txRecord, ...prev]);

    addNotification(
      'success',
      isFullyPaid ? 'Loan Fully Settled!' : 'Repayment Recorded',
      `Paid ${amount} USDC towards loan ${loanId}. Remaining balance: ${updatedBalance} USDC.`
    );

    return { success: true, message: 'Repayment successful' };
  };

  const resetDemoData = () => {
    setTokens(INITIAL_DEMO_TOKENS);
    setLoans(INITIAL_DEMO_LOANS);
    setTransactions(INITIAL_DEMO_TRANSACTIONS);
    setPlannedTransactions([]);
    setCreditInputs(DEFAULT_USER_CREDIT_INPUTS);
    setTimeMachineInputs(DEFAULT_USER_TIME_MACHINE_INPUTS);
    localStorage.removeItem('EXIDO_DEMO_TOKENS');
    localStorage.removeItem('EXIDO_DEMO_LOANS');
    localStorage.removeItem('EXIDO_DEMO_TRANSACTIONS');
    addNotification('info', 'Demo Data Reset', 'Restored default hackathon sample data.');
  };

  // Scenario Lab Loader for Cases A - H
  const loadScenarioPreset = (caseId: 'CASE_A' | 'CASE_B' | 'CASE_C' | 'CASE_D' | 'CASE_E' | 'CASE_F' | 'CASE_G' | 'CASE_H') => {
    setWorkspaceMode('DEMO_MODE');
    switch (caseId) {
      case 'CASE_A':
        setTimeMachineInputs({
          startingUsdc: 1000,
          plannedSwapToken: 'ETH',
          plannedSwapAmount: 200,
          feePercent: 0.3,
          priceShockPercent: 0,
          expectedIncome: 0,
          repaymentAmount: 300,
          repaymentDueDays: 7,
          otherExpenses: 0,
          simulationDays: 7,
          volatileHoldingSymbol: 'ETH',
          volatileHoldingAmount: 0.5,
          volatileHoldingPriceUsd: 3000,
        });
        addNotification('info', 'Loaded Case A: Safe Swap', 'Simulating 200 USDC swap with 300 USDC loan obligation. Safe reserve buffer confirmed.');
        break;

      case 'CASE_B':
        setTimeMachineInputs({
          startingUsdc: 1000,
          plannedSwapToken: 'ETH',
          plannedSwapAmount: 800,
          feePercent: 0.3,
          priceShockPercent: 0,
          expectedIncome: 0,
          repaymentAmount: 300,
          repaymentDueDays: 7,
          otherExpenses: 0,
          simulationDays: 7,
          volatileHoldingSymbol: 'ETH',
          volatileHoldingAmount: 0.5,
          volatileHoldingPriceUsd: 3000,
        });
        addNotification('warning', 'Loaded Case B: Repayment Risk', 'Simulating 800 USDC swap with 300 USDC loan obligation. 102.40 USDC shortfall flagged.');
        break;

      case 'CASE_C':
        setTimeMachineInputs((prev) => ({
          ...prev,
          priceShockPercent: -20,
        }));
        addNotification('info', 'Loaded Case C: Falling Token Price', 'Applied -20% price shock to volatile tokens. Liquid stablecoins remain unimpacted.');
        break;

      case 'CASE_D':
        setCreditInputs((prev) => ({
          ...prev,
          repaymentCompletedOnTime: true,
          repaymentOverdue: false,
          repaymentConsistencyPercent: 96,
        }));
        addNotification('success', 'Loaded Case D: Repayment Improvement', 'Switched repayment status to 100% on-time. Credit score recalculated upwards.');
        break;

      case 'CASE_E':
        setCreditInputs((prev) => ({
          ...prev,
          availableLiquidBalance: 400,
          requestedLoanAmount: 1400,
        }));
        addNotification('warning', 'Loaded Case E: Excessive Loan Request', 'Requested 1,400 USDC with limited liquidity. Restriction enforcement displayed.');
        break;

      case 'CASE_F':
        if (activeLoan) {
          repayLoan({ loanId: activeLoan.id, amount: 50 });
        } else {
          addNotification('info', 'Notice', 'No active loan to repay. Created demo loan first.');
        }
        break;

      case 'CASE_G':
        addNotification('info', 'Loaded Case G: Insufficient Swap Balance', 'Testing validation error when swapping 1,500 USDC with 1,000 USDC available balance.');
        break;

      case 'CASE_H':
        setTimeMachineInputs({
          startingUsdc: 1200,
          plannedSwapToken: 'WBTC',
          plannedSwapAmount: 450,
          feePercent: 0.3,
          priceShockPercent: -15,
          expectedIncome: 350,
          repaymentAmount: 400,
          repaymentDueDays: 14,
          otherExpenses: 50,
          simulationDays: 14,
          volatileHoldingSymbol: 'ETH',
          volatileHoldingAmount: 0.8,
          volatileHoldingPriceUsd: 3000,
        });
        setCreditInputs({
          repaymentCompletedOnTime: true,
          repaymentOverdue: false,
          availableLiquidBalance: 1200,
          outstandingLoanAmount: 400,
          walletActivityTxCount: 22,
          walletAgeMonths: 14,
          repaymentConsistencyPercent: 92,
          requestedLoanAmount: 600,
        });
        addNotification('info', 'Loaded Case H: Multi-Parameter Stress Test', 'Simulated synchronized changes across swap, repayment, liquidity, and token shocks.');
        break;
    }
  };

  return (
    <AppContext.Provider
      value={{
        workspaceMode,
        setWorkspaceMode,
        activeScenarioId,
        savedScenarios,
        isCloudSynced,
        isSaving,
        tokens,
        loans,
        transactions,
        plannedTransactions,
        activeLoan,
        nextRepayment,
        portfolioValueUsd,
        totalDebtUsd,
        notifications,
        addNotification,
        removeNotification,
        executeSwap,
        applyForLoan,
        repayLoan,
        creditInputs,
        setCreditInputs,
        creditAssessment,
        updateCreditInputFactor,
        resetCreditSimulator,
        timeMachineInputs,
        setTimeMachineInputs,
        timeMachineResult,
        updateStablecoinBalance,
        addOrUpdateToken,
        deleteToken,
        addPlannedTransaction,
        deletePlannedTransaction,
        addHypotheticalLoan,
        updateHypotheticalLoan,
        deleteHypotheticalLoan,
        saveCurrentFinancialProfile,
        saveCurrentAsScenario,
        loadSavedScenario,
        deleteSavedScenario,
        resetDemoData,
        loadScenarioPreset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
