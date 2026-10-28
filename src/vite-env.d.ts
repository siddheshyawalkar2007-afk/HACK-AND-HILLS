/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_LENDING_CONTRACT_ADDRESS?: string;
  readonly VITE_USDC_CONTRACT_ADDRESS?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_NETWORK_NAME?: string;
  readonly VITE_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

