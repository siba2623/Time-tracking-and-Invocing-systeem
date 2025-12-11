import { vi } from 'vitest';

// Mock Prisma client for testing
export const mockPrismaClient = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  timeEntry: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  client: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  service: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  rate: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  invoice: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  auditLog: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  employeeAllocation: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrismaClient)),
};

// Test data generators
export function createTestUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'employee' as const,
    passwordHash: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestTimeEntry(overrides = {}) {
  return {
    id: 'test-entry-id',
    employeeId: 'test-user-id',
    clientId: 'test-client-id',
    serviceId: 'test-service-id',
    activityDate: new Date(),
    memo: 'Test memo',
    rate: 100,
    duration: 2,
    billable: true,
    amount: 200,
    status: 'pending' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestClient(overrides = {}) {
  return {
    id: 'test-client-id',
    name: 'Test Client',
    contactEmail: 'client@example.com',
    contactPhone: '555-1234',
    address: '123 Test St',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
