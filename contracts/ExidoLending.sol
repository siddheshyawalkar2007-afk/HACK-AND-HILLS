// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ExidoLending
 * @notice Transparent credit and lending smart contract prototype for EXIDO Nexus.
 * @dev Enforces eligibility limits, records loan terms, disburses test tokens,
 * handles partial and full repayments, and tracks loan status.
 */
contract ExidoLending {
    address public owner;
    IERC20 public lendingToken; // e.g. Mock USDC

    enum LoanStatus { NONE, ACTIVE, REPAID, DEFAULTED }

    struct Loan {
        uint256 id;
        address borrower;
        uint256 principal;
        uint256 outstandingBalance;
        uint256 interestRateBps; // e.g. 450 = 4.5%
        uint256 durationDays;
        uint256 dueDate;
        uint256 createdAt;
        LoanStatus status;
    }

    uint256 public loanCount;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoanIds;
    mapping(address => uint256) public totalOutstandingByBorrower;

    // Platform limits
    uint256 public maxLoanLimit = 1500 * 10**6; // 1,500 USDC (6 decimals)
    uint256 public minCreditScoreRequired = 40;

    // Events
    event LoanDisbursed(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 dueDate
    );

    event LoanRepayment(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amountPaid,
        uint256 remainingBalance,
        LoanStatus status
    );

    event PlatformFunded(address indexed funder, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner permitted");
        _;
    }

    constructor(address _lendingToken) {
        owner = msg.sender;
        lendingToken = IERC20(_lendingToken);
    }

    /**
     * @notice Applies for and disburses a loan if borrower meets score criteria.
     * @param amount Requested loan amount in token units (e.g., 6 decimals for USDC)
     * @param creditScore Estimated credit score (0-100) verified by backend/oracle
     * @param durationDays Loan term in days (e.g., 30)
     */
    function applyForLoan(
        uint256 amount,
        uint256 creditScore,
        uint256 durationDays
    ) external returns (uint256) {
        require(amount > 0, "Loan amount must exceed 0");
        require(creditScore >= minCreditScoreRequired, "Score below minimum eligibility threshold (40)");
        require(amount <= maxLoanLimit, "Requested amount exceeds demo ceiling");
        require(
            totalOutstandingByBorrower[msg.sender] + amount <= maxLoanLimit,
            "Total debt exceeds maximum borrower exposure limit"
        );
        require(
            lendingToken.balanceOf(address(this)) >= amount,
            "Insufficient platform liquidity in lending vault"
        );

        loanCount++;
        uint256 loanId = loanCount;
        uint256 dueDate = block.timestamp + (durationDays * 1 days);

        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            principal: amount,
            outstandingBalance: amount,
            interestRateBps: 450, // 4.5% annual
            durationDays: durationDays,
            dueDate: dueDate,
            createdAt: block.timestamp,
            status: LoanStatus.ACTIVE
        });

        borrowerLoanIds[msg.sender].push(loanId);
        totalOutstandingByBorrower[msg.sender] += amount;

        // Disburse tokens to borrower
        bool success = lendingToken.transfer(msg.sender, amount);
        require(success, "Token disbursement failed");

        emit LoanDisbursed(loanId, msg.sender, amount, dueDate);
        return loanId;
    }

    /**
     * @notice Makes a partial or full loan repayment.
     * @param loanId ID of the loan being repaid
     * @param amount Amount to repay (in token units)
     */
    function repayLoan(uint256 loanId, uint256 amount) external {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.ACTIVE, "Loan is not currently active");
        require(amount > 0, "Repayment amount must exceed 0");
        require(amount <= loan.outstandingBalance, "Repayment exceeds remaining outstanding balance");

        // Transfer tokens from borrower to contract
        bool success = lendingToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Repayment transfer failed");

        loan.outstandingBalance -= amount;
        totalOutstandingByBorrower[loan.borrower] -= amount;

        if (loan.outstandingBalance == 0) {
            loan.status = LoanStatus.REPAID;
        }

        emit LoanRepayment(loanId, loan.borrower, amount, loan.outstandingBalance, loan.status);
    }

    /**
     * @notice Fund the lending vault with test tokens.
     */
    function depositLiquidity(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        bool success = lendingToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Deposit transfer failed");
        emit PlatformFunded(msg.sender, amount);
    }

    /**
     * @notice Returns all loan IDs for a borrower.
     */
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoanIds[borrower];
    }
}

