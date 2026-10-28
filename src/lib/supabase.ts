import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  LoanRecord,
  Token,
  TokenSymbol,
  TransactionRecord,
  UserFinancialProfileData,
  SavedScenarioRecord,
} from '../core/types';

// Retrieve credentials from environment or runtime config
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Allow runtime override for interactive demo testing in the UI
let runtimeUrl = localStorage.getItem('EXIDO_RUNTIME_SUPABASE_URL') || envUrl;
let runtimeAnonKey = localStorage.getItem('EXIDO_RUNTIME_SUPABASE_KEY') || envAnonKey;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    runtimeUrl &&
    runtimeAnonKey &&
    runtimeUrl.startsWith('http') &&
    runtimeAnonKey.length > 20 &&
    !runtimeUrl.includes('your-project-id')
  );
}

export function setRuntimeSupabaseConfig(url: string, key: string) {
  runtimeUrl = url.trim();
  runtimeAnonKey = key.trim();
  if (runtimeUrl && runtimeAnonKey) {
    localStorage.setItem('EXIDO_RUNTIME_SUPABASE_URL', runtimeUrl);
    localStorage.setItem('EXIDO_RUNTIME_SUPABASE_KEY', runtimeAnonKey);
  } else {
    localStorage.removeItem('EXIDO_RUNTIME_SUPABASE_URL');
    localStorage.removeItem('EXIDO_RUNTIME_SUPABASE_KEY');
  }
  // Recreate client
  supabaseInstance = createClientInstance();
}

function createClientInstance(): SupabaseClient | null {
  if (isSupabaseConfigured()) {
    try {
      return createClient(runtimeUrl, runtimeAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

let supabaseInstance: SupabaseClient | null = createClientInstance();

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance && isSupabaseConfigured()) {
    supabaseInstance = createClientInstance();
  }
  return supabaseInstance;
}

/**
 * Supabase Database Service
 * Provides typed CRUD operations associated with the authenticated user ID.
 */
export const SupabaseDb = {
  /**
   * Test database connectivity
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const sb = getSupabase();
    if (!sb) {
      return { success: false, message: 'Supabase credentials are not configured.' };
    }
    try {
      const { error } = await sb.from('profiles').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: `Database query failed: ${error.message}` };
      }
      return { success: true, message: 'Successfully connected to Supabase PostgreSQL database.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection error' };
    }
  },

  /**
   * Save or update the user's customized financial profile
   */
  async saveUserFinancialProfile(userId: string, data: UserFinancialProfileData): Promise<boolean> {
    const sb = getSupabase();
    if (!sb || !userId) return false;

    try {
      const { error } = await sb
        .from('user_financial_profiles')
        .upsert(
          {
            user_id: userId,
            profile_data: data,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      if (error) {
        console.warn('Error saving user financial profile to Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Exception saving user financial profile:', e);
      return false;
    }
  },

  /**
   * Fetch the user's customized financial profile
   */
  async getUserFinancialProfile(userId: string): Promise<UserFinancialProfileData | null> {
    const sb = getSupabase();
    if (!sb || !userId) return null;

    try {
      const { data, error } = await sb
        .from('user_financial_profiles')
        .select('profile_data')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return data.profile_data as UserFinancialProfileData;
    } catch (e) {
      console.error('Exception loading user financial profile:', e);
      return null;
    }
  },

  /**
   * Fetch all user saved scenarios
   */
  async getUserScenarios(userId: string): Promise<SavedScenarioRecord[]> {
    const sb = getSupabase();
    if (!sb || !userId) return [];

    try {
      const { data, error } = await sb
        .from('user_scenarios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description || '',
        data: row.scenario_data as UserFinancialProfileData,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (e) {
      console.error('Exception fetching user scenarios:', e);
      return [];
    }
  },

  /**
   * Save a new scenario for the user
   */
  async saveUserScenario(
    userId: string,
    name: string,
    description: string,
    data: UserFinancialProfileData
  ): Promise<SavedScenarioRecord | null> {
    const sb = getSupabase();
    if (!sb || !userId) return null;

    try {
      const { data: inserted, error } = await sb
        .from('user_scenarios')
        .insert({
          user_id: userId,
          name,
          description,
          scenario_data: data,
        })
        .select('*')
        .single();

      if (error || !inserted) {
        console.error('Error inserting user scenario:', error);
        return null;
      }

      return {
        id: inserted.id,
        userId: inserted.user_id,
        name: inserted.name,
        description: inserted.description || '',
        data: inserted.scenario_data as UserFinancialProfileData,
        createdAt: inserted.created_at,
        updatedAt: inserted.updated_at,
      };
    } catch (e) {
      console.error('Exception inserting user scenario:', e);
      return null;
    }
  },

  /**
   * Delete a user scenario
   */
  async deleteUserScenario(userId: string, scenarioId: string): Promise<boolean> {
    const sb = getSupabase();
    if (!sb || !userId) return false;

    try {
      const { error } = await sb
        .from('user_scenarios')
        .delete()
        .eq('id', scenarioId)
        .eq('user_id', userId);

      return !error;
    } catch (e) {
      console.error('Exception deleting user scenario:', e);
      return false;
    }
  },

  /**
   * Fetch user balances from Supabase
   */
  async getUserTokens(userId: string): Promise<Record<TokenSymbol, Token> | null> {
    const sb = getSupabase();
    if (!sb || !userId) return null;

    try {
      const { data, error } = await sb
        .from('token_balances')
        .select('*')
        .eq('user_id', userId);

      if (error || !data || data.length === 0) return null;

      const result: Record<string, Token> = {};
      data.forEach((row) => {
        const sym = row.symbol as string;
        result[sym] = {
          symbol: sym,
          name: sym === 'USDC' ? 'USD Coin' : sym === 'ETH' ? 'Ethereum' : sym === 'USDT' ? 'Tether USD' : sym === 'WBTC' ? 'Wrapped Bitcoin' : sym === 'NEX' ? 'Nexus Token' : `${sym} Token`,
          decimals: sym === 'ETH' || sym === 'NEX' ? 18 : sym === 'WBTC' ? 8 : 6,
          balance: Number(row.balance),
          priceUsd: sym === 'ETH' ? 3000 : sym === 'WBTC' ? 65000 : sym === 'NEX' ? 12.5 : 1.0,
          isStable: sym === 'USDC' || sym === 'USDT',
          color: sym === 'USDC' ? '#2775CA' : sym === 'ETH' ? '#627EEA' : sym === 'NEX' ? '#06B6D4' : '#F7931A',
        };
      });
      return result;
    } catch (e) {
      console.error('Error fetching tokens from Supabase:', e);
      return null;
    }
  },

  /**
   * Upsert a user token balance in Supabase
   */
  async upsertTokenBalance(userId: string, symbol: TokenSymbol, balance: number): Promise<boolean> {
    const sb = getSupabase();
    if (!sb || !userId) return false;

    try {
      const { error } = await sb
        .from('token_balances')
        .upsert(
          { user_id: userId, symbol, balance, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,symbol' }
        );
      return !error;
    } catch (e) {
      console.error('Error updating token balance in Supabase:', e);
      return false;
    }
  },

  /**
   * Fetch user loans
   */
  async getUserLoans(userId: string): Promise<LoanRecord[] | null> {
    const sb = getSupabase();
    if (!sb || !userId) return null;

    try {
      const { data, error } = await sb
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((l) => ({
        id: l.id,
        principal: Number(l.principal),
        outstandingBalance: Number(l.outstanding_balance),
        interestRatePercent: Number(l.interest_rate_percent),
        durationDays: l.duration_days,
        dueDate: l.due_date,
        dueDateTimestamp: new Date(l.due_date).getTime(),
        status: l.status,
        createdAt: l.created_at,
        source: 'SUPABASE' as const,
      }));
    } catch (e) {
      console.error('Error fetching loans from Supabase:', e);
      return null;
    }
  },

  /**
   * Create a new loan in Supabase
   */
  async createLoan(userId: string, loan: Omit<LoanRecord, 'id' | 'createdAt'>): Promise<string | null> {
    const sb = getSupabase();
    if (!sb || !userId) return null;

    try {
      const { data, error } = await sb
        .from('loans')
        .insert({
          user_id: userId,
          principal: loan.principal,
          outstanding_balance: loan.outstandingBalance,
          interest_rate_percent: loan.interestRatePercent,
          duration_days: loan.durationDays,
          due_date: loan.dueDate,
          status: loan.status,
          source: 'SUPABASE',
        })
        .select('id')
        .single();

      if (error || !data) {
        console.error('Failed to create loan in Supabase:', error);
        return null;
      }
      return data.id;
    } catch (e) {
      console.error('Exception creating loan in Supabase:', e);
      return null;
    }
  },

  /**
   * Record repayment in Supabase
   */
  async recordRepayment(
    userId: string,
    loanId: string,
    amount: number,
    newOutstandingBalance: number
  ): Promise<boolean> {
    const sb = getSupabase();
    if (!sb || !userId) return false;

    try {
      // 1. Insert repayment record
      const { error: repErr } = await sb.from('repayments').insert({
        user_id: userId,
        loan_id: loanId,
        amount,
        status: 'CONFIRMED',
      });
      if (repErr) console.warn('Repayment log failed:', repErr);

      // 2. Update loan record
      const isPaidOff = newOutstandingBalance <= 0;
      const { error: loanErr } = await sb
        .from('loans')
        .update({
          outstanding_balance: Math.max(0, newOutstandingBalance),
          status: isPaidOff ? 'REPAID' : 'ACTIVE',
          repaid_at: isPaidOff ? new Date().toISOString() : null,
        })
        .eq('id', loanId)
        .eq('user_id', userId);

      return !loanErr;
    } catch (e) {
      console.error('Exception recording repayment in Supabase:', e);
      return false;
    }
  },

  /**
   * Fetch transactions
   */
  async getUserTransactions(userId: string): Promise<TransactionRecord[] | null> {
    const sb = getSupabase();
    if (!sb || !userId) return null;

    try {
      const { data, error } = await sb
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((t) => ({
        id: t.id,
        type: t.type,
        title: t.title,
        tokenIn: t.token_in,
        tokenOut: t.token_out,
        amountIn: t.amount_in ? Number(t.amount_in) : undefined,
        amountOut: t.amount_out ? Number(t.amount_out) : undefined,
        fee: Number(t.fee || 0),
        status: t.status,
        source: t.source,
        txHash: t.tx_hash,
        timestamp: t.created_at,
        details: t.details || {},
      }));
    } catch (e) {
      console.error('Error fetching transactions from Supabase:', e);
      return null;
    }
  },

  /**
   * Record transaction
   */
  async insertTransaction(userId: string, tx: Omit<TransactionRecord, 'id' | 'timestamp'>): Promise<string | null> {
    const sb = getSupabase();
    if (!sb || !userId) return null;

    try {
      const { data, error } = await sb
        .from('transactions')
        .insert({
          user_id: userId,
          type: tx.type,
          title: tx.title,
          token_in: tx.tokenIn,
          token_out: tx.tokenOut,
          amount_in: tx.amountIn,
          amount_out: tx.amountOut,
          fee: tx.fee,
          status: tx.status,
          source: tx.source,
          tx_hash: tx.txHash,
          details: tx.details || {},
        })
        .select('id')
        .single();

      if (error || !data) return null;
      return data.id;
    } catch (e) {
      console.error('Exception inserting transaction into Supabase:', e);
      return null;
    }
  },
};
