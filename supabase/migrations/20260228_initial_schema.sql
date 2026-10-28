-- ==============================================================================
-- EXIDO Nexus Database Schema & Row Level Security (RLS) Policies
-- Migration: 20260228_initial_schema.sql
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT,
    display_name TEXT DEFAULT 'Nexus Trader',
    estimated_credit_score INTEGER DEFAULT 68,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Token Balances Table
CREATE TABLE IF NOT EXISTS public.token_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    balance NUMERIC(28, 8) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- 3. Loan Records Table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    principal NUMERIC(18, 4) NOT NULL,
    outstanding_balance NUMERIC(18, 4) NOT NULL,
    interest_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 4.50,
    duration_days INTEGER NOT NULL DEFAULT 30,
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REPAID', 'OVERDUE')),
    source TEXT NOT NULL DEFAULT 'SUPABASE' CHECK (source IN ('SUPABASE', 'ONCHAIN', 'DEMO')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    repaid_at TIMESTAMPTZ
);

-- 4. Repayments Table
CREATE TABLE IF NOT EXISTS public.repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    amount NUMERIC(18, 4) NOT NULL,
    repayment_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'PENDING', 'FAILED')),
    tx_hash TEXT
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('SWAP', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'DEPOSIT')),
    title TEXT NOT NULL,
    token_in TEXT,
    token_out TEXT,
    amount_in NUMERIC(28, 8),
    amount_out NUMERIC(28, 8),
    fee NUMERIC(18, 6) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'PENDING', 'FAILED')),
    source TEXT NOT NULL DEFAULT 'SUPABASE' CHECK (source IN ('SIMULATION', 'DEMO', 'SUPABASE', 'ONCHAIN')),
    tx_hash TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Saved Scenarios Table
CREATE TABLE IF NOT EXISTS public.saved_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    scenario_type TEXT NOT NULL CHECK (scenario_type IN ('TIME_MACHINE', 'CREDIT_SIMULATOR')),
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scenarios ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES (Users access ONLY their own authenticated records)
-- ==============================================================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Token Balances
CREATE POLICY "Users can view own token balances" ON public.token_balances
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own token balances" ON public.token_balances
    FOR ALL USING (auth.uid() = user_id);

-- Loans
CREATE POLICY "Users can view own loans" ON public.loans
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loans" ON public.loans
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loans" ON public.loans
    FOR UPDATE USING (auth.uid() = user_id);

-- Repayments
CREATE POLICY "Users can view own repayments" ON public.repayments
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own repayments" ON public.repayments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Saved Scenarios
CREATE POLICY "Users can view own saved scenarios" ON public.saved_scenarios
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved scenarios" ON public.saved_scenarios
    FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- PROFILE TRIGGER FOR NEW SIGNUPS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, estimated_credit_score)
  VALUES (new.id, split_part(new.email, '@', 1), 68);

  -- Seed initial tokens for demo/testing
  INSERT INTO public.token_balances (user_id, symbol, balance) VALUES
    (new.id, 'USDC', 1000.00),
    (new.id, 'ETH', 0.50),
    (new.id, 'USDT', 350.00),
    (new.id, 'NEX', 200.00);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

