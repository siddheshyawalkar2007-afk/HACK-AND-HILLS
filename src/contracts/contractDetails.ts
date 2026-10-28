export const EXIDO_LENDING_ABI = [
  "function owner() view returns (address)",
  "function maxLoanLimit() view returns (uint256)",
  "function minCreditScoreRequired() view returns (uint256)",
  "function applyForLoan(uint256 amount, uint256 creditScore, uint256 durationDays) returns (uint256)",
  "function repayLoan(uint256 loanId, uint256 amount)",
  "function depositLiquidity(uint256 amount)",
  "function getBorrowerLoans(address borrower) view returns (uint256[])",
  "function loans(uint256) view returns (uint256 id, address borrower, uint256 principal, uint256 outstandingBalance, uint256 interestRateBps, uint256 durationDays, uint256 dueDate, uint256 createdAt, uint8 status)",
  "event LoanDisbursed(uint256 indexed loanId, address indexed borrower, uint256 principal, uint256 dueDate)",
  "event LoanRepayment(uint256 indexed loanId, address indexed borrower, uint256 amountPaid, uint256 remainingBalance, uint8 status)"
];

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",
  "function mint(address to, uint256 value)"
];

export const CONTRACT_CONFIG = {
  lendingAddress: import.meta.env.VITE_LENDING_CONTRACT_ADDRESS || '',
  usdcAddress: import.meta.env.VITE_USDC_CONTRACT_ADDRESS || '',
  networkName: import.meta.env.VITE_NETWORK_NAME || 'Hardhat Localhost / Sepolia',
  chainId: import.meta.env.VITE_CHAIN_ID || 31337,
};

