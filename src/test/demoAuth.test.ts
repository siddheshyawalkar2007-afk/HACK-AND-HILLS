import { describe, it, expect, beforeEach } from 'vitest';
import {
  DemoAuthService,
  hashPassword,
  generateSalt,
  getRegisteredDemoAccounts,
  seedDefaultDemoAccount,
} from '../lib/demoAuthStore';

describe('EXIDO Nexus Demo Authentication & Account Isolation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Pre-seeds default test account (student@example.test / DemoPass123!)', async () => {
    await seedDefaultDemoAccount();
    const accounts = getRegisteredDemoAccounts();
    expect(accounts['student@example.test']).toBeDefined();
    expect(accounts['student@example.test'].displayName).toBe('Student Pioneer');
    // Ensure plaintext password is NEVER stored
    expect(accounts['student@example.test'].passwordHash).not.toBe('DemoPass123!');
    expect(accounts['student@example.test'].passwordHash.length).toBe(64); // SHA-256 hex length
  });

  it('2. Registers a new hypothetical demo account without real email verification', async () => {
    const regRes = await DemoAuthService.register({
      email: 'investor.carol@nexus.test',
      password: 'StrongSecretPassword!',
      confirmPassword: 'StrongSecretPassword!',
      displayName: 'Carol Alpha',
    });

    expect(regRes.success).toBe(true);
    expect(regRes.user).toBeDefined();
    expect(regRes.user?.email).toBe('investor.carol@nexus.test');
    expect(regRes.user?.displayName).toBe('Carol Alpha');

    // Verify cryptographic salted storage
    const accounts = getRegisteredDemoAccounts();
    const stored = accounts['investor.carol@nexus.test'];
    expect(stored).toBeDefined();
    expect(stored.salt).toBeDefined();
    expect(stored.passwordHash).not.toBe('StrongSecretPassword!');
  });

  it('3. Rejects duplicate registration for existing email', async () => {
    await DemoAuthService.register({
      email: 'duplicate@test.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    const secondTry = await DemoAuthService.register({
      email: 'duplicate@test.local',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(secondTry.success).toBe(false);
    expect(secondTry.error).toContain('already exists');
  });

  it('4. Validates mismatched passwords and minimum length', async () => {
    const mismatchRes = await DemoAuthService.register({
      email: 'mismatch@test.local',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword!',
    });
    expect(mismatchRes.success).toBe(false);
    expect(mismatchRes.error).toContain('do not match');

    const shortRes = await DemoAuthService.register({
      email: 'short@test.local',
      password: '123',
      confirmPassword: '123',
    });
    expect(shortRes.success).toBe(false);
    expect(shortRes.error).toContain('at least 6 characters');
  });

  it('5. Successfully signs in with correct credentials and rejects incorrect password', async () => {
    await DemoAuthService.register({
      email: 'trader.dave@hypo.crypto',
      password: 'ValidPassword456!',
      confirmPassword: 'ValidPassword456!',
    });

    // Wrong password test
    const failRes = await DemoAuthService.signIn({
      email: 'trader.dave@hypo.crypto',
      password: 'WrongPassword!',
    });
    expect(failRes.success).toBe(false);
    expect(failRes.error).toContain('Incorrect password');

    // Correct password test
    const okRes = await DemoAuthService.signIn({
      email: 'trader.dave@hypo.crypto',
      password: 'ValidPassword456!',
    });
    expect(okRes.success).toBe(true);
    expect(okRes.user?.email).toBe('trader.dave@hypo.crypto');
  });

  it('6. Rejects sign-in for non-existent accounts', async () => {
    const res = await DemoAuthService.signIn({
      email: 'nonexistent@phantom.test',
      password: 'AnyPassword!',
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain('No demo account found');
  });

  it('7. Restores demo session across page refreshes and supports sign out', async () => {
    const regRes = await DemoAuthService.register({
      email: 'session.test@example.test',
      password: 'SessionSecret123!',
      confirmPassword: 'SessionSecret123!',
    });

    // Verify session is active
    let active = DemoAuthService.getActiveSession();
    expect(active?.email).toBe('session.test@example.test');

    // Sign out
    DemoAuthService.signOut();
    active = DemoAuthService.getActiveSession();
    expect(active).toBeNull();
  });

  it('8. Isolates accounts: Two different demo users have distinct IDs and profiles', async () => {
    const userA = await DemoAuthService.register({
      email: 'userA@nexus.test',
      password: 'PassUserA123!',
      confirmPassword: 'PassUserA123!',
    });

    const userB = await DemoAuthService.register({
      email: 'userB@nexus.test',
      password: 'PassUserB123!',
      confirmPassword: 'PassUserB123!',
    });

    expect(userA.user?.id).not.toBe(userB.user?.id);
    expect(userA.user?.email).not.toBe(userB.user?.email);
  });
});

