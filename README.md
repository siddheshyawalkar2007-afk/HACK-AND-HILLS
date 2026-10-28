# EXIDO Nexus — Onchain Credit, Trading & Financial Resilience Platform

**Tagline:** *Trade Smarter. Borrow Transparently. Stay Financially Prepared.*  
Built for the **Hack in Hills ’26 Hackathon**.

---

## 1. Executive Summary & Core Concept

**EXIDO Nexus** is a Web3 financial resilience terminal combining decentralized trading simulation, predictive cash flow forecasting, personalized financial profile management, and an explainable credit underwriting engine.

Unlike traditional static DeFi dashboards, **EXIDO Nexus is completely user-driven**:
- **Personal Financial Studio:** Every registered user can sign in, input their own hypothetical token holdings, customize valuations, register debt obligations, schedule cash flows, and adjust behavioral credit inputs.
- **Multi-Scenario Manager:** Users can snapshot, name, switch between, and delete different hypothetical financial scenarios (e.g. *"Conservative Cash Runway"*, *"Bull Market Aggressive Swaps"*, *"Debt Consolidation Strategy"*).
- **Global Simulation Binding:** All modules—ClearSwap, Financial Time Machine, Credit Flight Simulator, and Lending Manager—dynamically bind to the user's customized parameters rather than fixed sample values.
- **Zero-Friction Demo Mode:** Pre-loaded hackathon demo presets and the 8-case Scenario Lab remain available as a separate toggleable workspace.

---

## 2. Platform Architecture & Modules

### Personal Financial Studio ("My Financial Profile")
A dedicated workspace allowing users to manage their hypothetical financial data:
1. **Liquid Balances & Token Holdings:**
   - Primary stablecoin (USDC) balance adjuster.
   - Add, edit, and delete custom tokens (Symbol, Name, Quantity, Hypothetical Price in USD, and Stablecoin toggle).
   - Real-time portfolio valuation calculation.
2. **Planned Swaps & Cash Flows:**
   - Schedule future income inflows, planned expense outflows, and token swaps with expected arrival days (Day 1 – 30).
3. **Hypothetical Debt Facilities:**
   - Register active loans, principal amounts, interest rates, durations, and due dates.
   - Dynamic status tracking (`ACTIVE`, `REPAID`, `OVERDUE`).
4. **Credit Underwriting Parameters:**
   - Fine-tune behavioral inputs: Repayment Consistency (35%), Available Liquidity (25%), Debt Exposure (20%), Transaction Activity (10%), and Wallet Age (10%).
   - Toggles for on-time repayments and delinquency flags.
5. **Scenario Manager:**
   - Snapshot any custom setup into a named scenario.
   - 1-click loading and deletion of scenarios.
   - Visual indicators for Supabase Cloud Sync or Local Workspace isolation.

### Module A — ClearSwap
- **Deterministic AMM & Router:** Swaps across [USDC, USDT, ETH, WBTC, NEX] and any user-added custom tokens.
- **Fee & Slippage Rules:** 0.3% protocol fee, adjustable slippage tolerance (0.1%, 0.5%, 1.0%), and guaranteed minimum received.
- **Balance Protection:** Strict validation blocks orders exceeding available holdings (Case G).
- **Auditable Receipts:** Generates cryptographic-style receipts with unique ID, fees, and timestamps upon confirmation.

### Module B — Financial Time Machine
- **Predictive Horizon:** 7, 14, and 30-day balance projections.
- **Shortfall Detection:** Automatically checks if planned swaps + trading fees create a deficit relative to scheduled loan repayments and expenses.
- **Prominent Alert:** Displays `Potential repayment shortfall detected.` with exact deficit figures and actionable recommendations.
- **Price Shock Testing:** Selectable scenarios (Optimistic +25%, Neutral 0%, Pessimistic -20%, and Custom slider) affecting volatile assets while preserving stablecoin reserves.
- **Interactive Charts:** Recharts visualization tracking daily liquid USDC reserves against loan obligation due dates.

### Module C — Credit Flight Simulator
- **Explainable Weighted Model (0–100 Score):**
  - *Repayment Consistency (35%)*
  - *Available Liquidity (25%)*
  - *Debt Exposure (20%)*
  - *Wallet Activity (10%)*
  - *Wallet Age (10%)*
- **Eligibility Tiers:** Prime Resilient (80–100), Standard (60–79), Restricted (40–59), and Ineligible (< 40).
- **Plain-Language Explainability:** Generates clear explanations of why loans are approved, restricted, or capped, detailing positive signals and risk constraints.

### Module D — Lending & Loan Management
- **Underwritten Drawdowns:** Request loans up to approved headroom; funds disburse directly to liquid wallet balances.
- **Repayment Facilities:** Supports partial payments (e.g., 50 USDC - Case F) or full settlements.
- **Balance Validation:** Blocks repayments exceeding outstanding debt.
- **Smart Contracts:** Backed by `ExidoLending.sol` and `MockERC20.sol` for EVM networks.

### Module E — Transaction History
- **Auditable Ledger:** Filterable by transaction type (`SWAP`, `LOAN_DISBURSEMENT`, `LOAN_REPAYMENT`) and source (`DEMO`, `SIMULATION`, `SUPABASE`, `ONCHAIN`).
- **Integrity Guarantee:** Never fabricates fake hashes or falsified explorer links; external block explorer links appear only when an actual onchain hash is present.

### Scenario Lab (Cases A through H)
A dedicated, one-click evaluation panel pre-loaded with reproducible test cases for hackathon judges:
- **Case A — Safe Swap:** 1,000 USDC start, 200 USDC swap, 300 USDC repayment, 0.3% fee $\rightarrow$ 799.40 USDC remaining, 499.40 USDC reserve buffer.
- **Case B — Repayment Risk:** 1,000 USDC start, 800 USDC swap, 300 USDC repayment, 0.3% fee $\rightarrow$ 197.60 USDC remaining, 102.40 USDC shortfall flagged.
- **Case C — Falling Token Price:** -20% price drop on volatile tokens (0.5 ETH drops from $1,500 to $1,200), stablecoins remain strictly unaffected.
- **Case D — Better Repayment Behaviour:** Switching repayment status to on-time recalculates score upwards and explains factor attribution.
- **Case E — Excessive Loan Request:** Requesting 1,400 USDC with only 400 USDC liquidity triggers transparent restriction/rejection.
- **Case F — Partial Repayment:** Outstanding loan of 200 USDC paid down by 50 USDC $\rightarrow$ balance becomes exactly 150 USDC.
- **Case G — Insufficient Swap Balance:** Attempting to swap 1,500 USDC when holding 1,000 USDC is blocked with validation error.
- **Case H — Multi-Parameter Stress Test:** Synchronous changes across swap, debt, price shock, and liquidity update simultaneously without reload.

---

## 3. Demo Mode vs. User Workspace

| Feature | User Workspace (Default when Signed In) | Demo Presets Mode |
|---|---|---|
| **Data Ownership** | User-customized hypothetical inputs | Fixed hackathon test benchmarks |
| **Custom Tokens** | Add, edit, and delete any token & price | Pre-seeded USDC, ETH, USDT, WBTC, NEX |
| **Cash Flows & Debt** | Add/delete planned inflows, expenses, loans | 1 default test loan (200 USDC) |
| **Multi-Scenario Saving** | Save, load, and delete named scenarios | 8 fixed test cases (Cases A – H) |
| **Supabase Cloud Sync** | Syncs to PostgreSQL via user-isolated RLS | In-memory & local simulation |

---

## 4. Supabase Backend Integration (PostgreSQL + Auth + RLS)

### Authentication
- User Sign-Up, Sign-In, Sign-Out, and persistent sessions.
- Fast 1-click **Demo User Profile** for zero-friction evaluations.

### Tables & Schema
- `public.profiles`: Stores display names, wallet addresses, and credit scores.
- `public.token_balances`: User token holdings with foreign keys to `auth.users(id)`.
- `public.user_financial_profiles`: User custom workspace state (tokens, loans, cash flows).
- `public.user_scenarios`: Stored named scenarios per user.
- `public.loans`: Principal, outstanding balance, interest rate, duration, and status.
- `public.repayments`: Repayment timestamps, amounts, and loan foreign keys.
- `public.transactions`: Swaps, drawdowns, and settlement event records.

### Row Level Security (RLS)
Every table has RLS enabled with policies ensuring authenticated users can **only** read and write their own records:
```sql
CREATE POLICY "Users can manage own financial profile" 
ON public.user_financial_profiles FOR ALL USING (auth.uid() = user_id);
```

### Migration Files
- `supabase/migrations/20260228_initial_schema.sql`
- `supabase/migrations/20260228_user_financial_profiles.sql`

---

## 5. Quickstart & Verification Commands

### 1. Run Automated Calculation Tests
```bash
npm test
```
*Executes all 8 unit tests in Vitest verifying Cases A through H, fee formulas, and shortfall calculations.*

### 2. Run Production Build
```bash
npm run build
```
*Compiles TypeScript and bundles via Vite with 0 errors.*

### 3. Launch Development Server
```bash
npm run dev
```
*Terminal UI is available at `http://localhost:5173`.*
