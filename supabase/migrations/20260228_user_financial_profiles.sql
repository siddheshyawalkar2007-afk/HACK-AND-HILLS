-- ==============================================================================
-- EXIDO Nexus User Financial Profiles & Scenarios Migration
-- Migration: 20260228_user_financial_profiles.sql
-- ==============================================================================

-- 1. User Financial Profiles Table (stores user's customized personal workspace)
CREATE TABLE IF NOT EXISTS public.user_financial_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Scenarios Table (stores multiple named scenarios per user)
CREATE TABLE IF NOT EXISTS public.user_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    scenario_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users only access their own private records
CREATE POLICY "Users can manage own financial profile" ON public.user_financial_profiles
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own scenarios" ON public.user_scenarios
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_financial_profiles_updated_at ON public.user_financial_profiles;
CREATE TRIGGER update_user_financial_profiles_updated_at
    BEFORE UPDATE ON public.user_financial_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_scenarios_updated_at ON public.user_scenarios;
CREATE TRIGGER update_user_scenarios_updated_at
    BEFORE UPDATE ON public.user_scenarios
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

