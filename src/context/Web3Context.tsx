import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { EXIDO_LENDING_ABI, ERC20_ABI, CONTRACT_CONFIG } from '../contracts/contractDetails';

interface Web3ContextType {
  mode: 'DEMO' | 'WALLET';
  setMode: (mode: 'DEMO' | 'WALLET') => void;
  account: string | null;
  chainId: number | null;
  networkName: string;
  isMetaMaskInstalled: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<{ success: boolean; error?: string }>;
  disconnectWallet: () => void;
  lendingContractAddress: string;
  usdcContractAddress: string;
  isContractConfigured: boolean;
  executeOnChainLoan: (amount: number, score: number, days: number) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  executeOnChainRepayment: (loanId: number, amount: number) => Promise<{ success: boolean; txHash?: string; error?: string }>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'DEMO' | 'WALLET'>('DEMO');
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string>('Not Connected');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const isMetaMaskInstalled = typeof window !== 'undefined' && Boolean((window as any).ethereum);
  const isContractConfigured = Boolean(
    CONTRACT_CONFIG.lendingAddress &&
    ethers.isAddress(CONTRACT_CONFIG.lendingAddress)
  );

  useEffect(() => {
    if (isMetaMaskInstalled) {
      const ethereum = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setMode('DEMO');
        }
      };

      const handleChainChanged = (_chainIdHex: string) => {
        window.location.reload();
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [isMetaMaskInstalled]);

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      return { success: false, error: 'MetaMask browser extension not detected. Running in Demo Mode.' };
    }

    try {
      setIsConnecting(true);
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
        setNetworkName(network.name === 'unknown' ? `Chain ID ${network.chainId}` : network.name);
        setMode('WALLET');
        return { success: true };
      }
      return { success: false, error: 'No account selected' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to connect MetaMask' };
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setNetworkName('Not Connected');
    setMode('DEMO');
  };

  const executeOnChainLoan = async (
    amount: number,
    score: number,
    durationDays: number
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (mode === 'DEMO') {
      return { success: false, error: 'Currently in Demo Mode. Switch to Wallet Mode for onchain transactions.' };
    }
    if (!account || !isMetaMaskInstalled) {
      return { success: false, error: 'Wallet not connected. Connect MetaMask first.' };
    }
    if (!isContractConfigured) {
      return {
        success: false,
        error: 'Lending smart contract is not configured on this network. Please set VITE_LENDING_CONTRACT_ADDRESS or use Demo Mode.',
      };
    }

    try {
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_CONFIG.lendingAddress, EXIDO_LENDING_ABI, signer);

      const parsedAmount = ethers.parseUnits(amount.toString(), 6); // USDC 6 decimals
      const tx = await contract.applyForLoan(parsedAmount, score, durationDays);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.reason || err.message || 'Onchain loan transaction failed or was rejected.',
      };
    }
  };

  const executeOnChainRepayment = async (
    loanId: number,
    amount: number
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (mode === 'DEMO') {
      return { success: false, error: 'Currently in Demo Mode. Switch to Wallet Mode for onchain transactions.' };
    }
    if (!account || !isMetaMaskInstalled) {
      return { success: false, error: 'Wallet not connected.' };
    }
    if (!isContractConfigured) {
      return {
        success: false,
        error: 'Lending smart contract is not configured on this network.',
      };
    }

    try {
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_CONFIG.lendingAddress, EXIDO_LENDING_ABI, signer);

      const parsedAmount = ethers.parseUnits(amount.toString(), 6);
      const tx = await contract.repayLoan(loanId, parsedAmount);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.reason || err.message || 'Onchain repayment transaction failed.',
      };
    }
  };

  return (
    <Web3Context.Provider
      value={{
        mode,
        setMode,
        account,
        chainId,
        networkName,
        isMetaMaskInstalled,
        isConnecting,
        isConnected: Boolean(account),
        connectWallet,
        disconnectWallet,
        lendingContractAddress: CONTRACT_CONFIG.lendingAddress,
        usdcContractAddress: CONTRACT_CONFIG.usdcAddress,
        isContractConfigured,
        executeOnChainLoan,
        executeOnChainRepayment,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used within a Web3Provider');
  return context;
};

