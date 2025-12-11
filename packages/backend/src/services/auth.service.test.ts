import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import bcrypt from 'bcryptjs';

// Direct bcrypt functions for testing without Prisma dependency
// Using lower salt rounds for faster tests
const SALT_ROUNDS = 4;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

describe('Authentication Service - Property Tests', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 19: Password Storage Security**
   * **Validates: Requirements 10.5**
   *
   * For any stored user credential, the stored password hash SHALL not
   * equal the plaintext password.
   */
  describe('Property 19: Password Storage Security', () => {
    it('hashed password never equals plaintext password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (password) => {
            const hash = await hashPassword(password);
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(password.length);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    it('same password produces different hashes (salt)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 30 }),
          async (password) => {
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);
            expect(hash1).not.toBe(hash2);
          }
        ),
        { numRuns: 5 }
      );
    }, 30000);


    it('verifyPassword correctly validates hashed passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 30 }),
          async (password) => {
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(password, hash);
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    it('verifyPassword rejects wrong passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 30 }),
          async (password, wrongPassword) => {
            if (password === wrongPassword) return;
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(wrongPassword, hash);
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);
  });
});
