/**
 * EXIDO Nexus Demo Authentication Store
 * 
 * Provides local cryptographic authentication for hackathon demonstrations.
 * Supports multiple hypothetical test accounts without requiring external email verification.
 * 
 * Security Note:
 * This demo auth store uses SHA-256 with a unique random salt per user via the Web Crypto API
 * so plaintext passwords are never stored in localStorage.
 * However, this client-side store is designed strictly for local evaluation and prototype demonstrations,
 * not for production deployments where authentication must be verified by a backend service.
 */

export interface DemoAccount {
  id: string;
  email: string;
  displayName: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
  authProvider: 'DEMO';
}

export interface DemoSessionUser {
  id: string;
  email: string;
  displayName: string;
  authProvider: 'DEMO';
  createdAt: string;
}

const STORAGE_KEY_ACCOUNTS = 'EXIDO_DEMO_ACCOUNTS_VAULT';
const STORAGE_KEY_ACTIVE_SESSION = 'EXIDO_ACTIVE_DEMO_SESSION';

// In-memory fallback for test environments or private browser contexts
const memoryStore: Record<string, string> = {};

function getStorage(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (e) {
    // Fallback to memory
  }
  return memoryStore[key] || null;
}

function setStorage(key: string, val: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    }
  } catch (e) {
    // Fallback to memory
  }
  memoryStore[key] = val;
}

function removeStorage(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (e) {
    // Fallback to memory
  }
  delete memoryStore[key];
}

export function clearDemoAuthStoreForTesting(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  } catch (e) {
    // Fallback to memory
  }
  for (const k in memoryStore) {
    delete memoryStore[k];
  }
}

/**
 * Derives a cryptographic SHA-256 hash from password + salt
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a cryptographically random salt
 */
export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Retrieves all registered demo accounts
 */
export function getRegisteredDemoAccounts(): Record<string, DemoAccount> {
  try {
    const raw = getStorage(STORAGE_KEY_ACCOUNTS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse demo accounts store:', e);
    return {};
  }
}

/**
 * Saves all demo accounts
 */
function saveDemoAccounts(accounts: Record<string, DemoAccount>): void {
  setStorage(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
}

/**
 * Pre-seeds the example credentials specified in the prompt:
 * Email: "student@example.test"
 * Password: "DemoPass123!"
 */
export async function seedDefaultDemoAccount(): Promise<void> {
  const accounts = getRegisteredDemoAccounts();
  const defaultEmail = 'student@example.test';

  if (!accounts[defaultEmail]) {
    const salt = generateSalt();
    const passwordHash = await hashPassword('DemoPass123!', salt);
    accounts[defaultEmail] = {
      id: 'demo_user_student_seed',
      email: defaultEmail,
      displayName: 'Student Pioneer',
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      authProvider: 'DEMO',
    };
    saveDemoAccounts(accounts);
  }
}

export const DemoAuthService = {
  /**
   * Registers a new hypothetical demo account
   */
  async register(params: {
    email: string;
    password: string;
    confirmPassword: string;
    displayName?: string;
  }): Promise<{ success: boolean; user?: DemoSessionUser; error?: string }> {
    const { email, password, confirmPassword, displayName } = params;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Validation
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid hypothetical email address (e.g. name@example.test).' };
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match. Please re-enter confirm password.' };
    }

    const accounts = getRegisteredDemoAccounts();

    // 2. Duplicate Account Check
    if (accounts[cleanEmail]) {
      return { success: false, error: `An account already exists for "${cleanEmail}". Please sign in instead.` };
    }

    // 3. Cryptographic Salting & Hashing
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const userId = `demo_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const finalDisplayName = displayName?.trim() || cleanEmail.split('@')[0];

    const newAccount: DemoAccount = {
      id: userId,
      email: cleanEmail,
      displayName: finalDisplayName,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      authProvider: 'DEMO',
    };

    accounts[cleanEmail] = newAccount;
    saveDemoAccounts(accounts);

    const sessionUser: DemoSessionUser = {
      id: userId,
      email: cleanEmail,
      displayName: finalDisplayName,
      authProvider: 'DEMO',
      createdAt: newAccount.createdAt,
    };

    // Automatically set active demo session
    this.setActiveSession(sessionUser);

    return { success: true, user: sessionUser };
  },

  /**
   * Signs in using email and password
   */
  async signIn(params: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; user?: DemoSessionUser; error?: string }> {
    const { email, password } = params;
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered email address.' };
    }

    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Ensure seed account exists
    await seedDefaultDemoAccount();

    const accounts = getRegisteredDemoAccounts();
    const account = accounts[cleanEmail];

    if (!account) {
      return {
        success: false,
        error: `No demo account found for "${cleanEmail}". Please register this hypothetical email first.`,
      };
    }

    // Verify cryptographic password hash
    const inputHash = await hashPassword(password, account.salt);
    if (inputHash !== account.passwordHash) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your credentials.',
      };
    }

    const sessionUser: DemoSessionUser = {
      id: account.id,
      email: account.email,
      displayName: account.displayName,
      authProvider: 'DEMO',
      createdAt: account.createdAt,
    };

    this.setActiveSession(sessionUser);

    return { success: true, user: sessionUser };
  },

  /**
   * Restores active demo session across page refreshes
   */
  getActiveSession(): DemoSessionUser | null {
    try {
      const raw = getStorage(STORAGE_KEY_ACTIVE_SESSION);
      if (!raw) return null;

      const user = JSON.parse(raw) as DemoSessionUser;
      // Verify account still exists in accounts store
      const accounts = getRegisteredDemoAccounts();
      if (accounts[user.email] && accounts[user.email].id === user.id) {
        return user;
      }
      return null;
    } catch (e) {
      console.error('Failed to read active demo session:', e);
      return null;
    }
  },

  /**
   * Sets active demo session
   */
  setActiveSession(user: DemoSessionUser): void {
    setStorage(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(user));
  },

  /**
   * Clears active demo session
   */
  signOut(): void {
    removeStorage(STORAGE_KEY_ACTIVE_SESSION);
  },

  /**
   * Lists all registered demo account emails for quick selection in demo UI
   */
  listRegisteredEmails(): string[] {
    const accounts = getRegisteredDemoAccounts();
    return Object.keys(accounts);
  },
};
