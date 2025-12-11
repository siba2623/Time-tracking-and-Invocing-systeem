/**
 * In-Memory Mock Database
 * Replaces Prisma for testing without database connection
 */
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'employee' | 'administrator';
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface Rate {
  id: string;
  serviceId: string;
  employeeId: string | null;
  hourlyRate: number;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  clientId: string;
  serviceId: string;
  activityDate: Date;
  memo?: string;
  rate: number;
  duration: number;
  billable: boolean;
  amount: number;
  status: string;
  createdAt: Date;
  client?: Client;
  service?: Service;
  employee?: { id: string; name: string; email: string };
}

export interface EmployeeAllocation {
  employeeId: string;
  percentage: number;
}

// In-memory data store
class MockDatabase {
  users: User[] = [];
  clients: Client[] = [];
  services: Service[] = [];
  rates: Rate[] = [];
  timeEntries: TimeEntry[] = [];
  allocations: EmployeeAllocation[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    // Create admin user
    const adminHash = await bcrypt.hash('admin123', 4);
    this.users.push({
      id: 'user-admin',
      email: 'admin@example.com',
      passwordHash: adminHash,
      name: 'Admin User',
      role: 'administrator',
      createdAt: new Date(),
    });

    // Create employee users
    const empHash = await bcrypt.hash('employee123', 4);
    this.users.push({
      id: 'user-john',
      email: 'john@example.com',
      passwordHash: empHash,
      name: 'John Smith',
      role: 'employee',
      createdAt: new Date(),
    });

    this.users.push({
      id: 'user-jane',
      email: 'jane@example.com',
      passwordHash: empHash,
      name: 'Jane Doe',
      role: 'employee',
      createdAt: new Date(),
    });

    // Create clients
    this.clients.push({
      id: 'client-acme',
      name: 'Acme Corporation',
      contactEmail: 'contact@acme.com',
      contactPhone: '555-0100',
      address: '123 Business Ave, Suite 100',
      active: true,
    });

    this.clients.push({
      id: 'client-techstart',
      name: 'TechStart Inc',
      contactEmail: 'info@techstart.com',
      contactPhone: '555-0200',
      address: '456 Innovation Blvd',
      active: true,
    });

    // Create services
    this.services.push({
      id: 'service-consulting',
      name: 'Consulting',
      description: 'General consulting services',
      active: true,
    });

    this.services.push({
      id: 'service-development',
      name: 'Software Development',
      description: 'Custom software development',
      active: true,
    });

    this.services.push({
      id: 'service-training',
      name: 'Training',
      description: 'Technical training and workshops',
      active: true,
    });

    // Create default rates
    this.rates.push({ id: 'rate-1', serviceId: 'service-consulting', employeeId: null, hourlyRate: 150 });
    this.rates.push({ id: 'rate-2', serviceId: 'service-development', employeeId: null, hourlyRate: 175 });
    this.rates.push({ id: 'rate-3', serviceId: 'service-training', employeeId: null, hourlyRate: 125 });

    // Create allocations
    this.allocations.push({ employeeId: 'user-john', percentage: 15 });
    this.allocations.push({ employeeId: 'user-jane', percentage: 20 });

    this.initialized = true;
    console.log('Mock database initialized with seed data');
  }

  // User methods
  findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  findUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getAllUsers(): User[] {
    return this.users;
  }

  // Client methods
  getAllClients(): Client[] {
    return this.clients.filter(c => c.active);
  }

  findClientById(id: string): Client | undefined {
    return this.clients.find(c => c.id === id);
  }

  // Service methods
  getAllServices(): Service[] {
    return this.services.filter(s => s.active);
  }

  findServiceById(id: string): Service | undefined {
    return this.services.find(s => s.id === id);
  }

  // Rate methods
  getEffectiveRate(serviceId: string, employeeId?: string): number {
    // Check for employee-specific rate first
    if (employeeId) {
      const empRate = this.rates.find(r => r.serviceId === serviceId && r.employeeId === employeeId);
      if (empRate) return empRate.hourlyRate;
    }
    // Fall back to default rate
    const defaultRate = this.rates.find(r => r.serviceId === serviceId && r.employeeId === null);
    return defaultRate?.hourlyRate ?? 100;
  }

  // Time entry methods
  private entryCounter = 0;
  
  createTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt'>): TimeEntry {
    const newEntry: TimeEntry = {
      ...entry,
      id: `entry-${++this.entryCounter}`,
      createdAt: new Date(),
      client: this.findClientById(entry.clientId),
      service: this.findServiceById(entry.serviceId),
    };
    this.timeEntries.push(newEntry);
    return newEntry;
  }

  findTimeEntryById(id: string): TimeEntry | undefined {
    const entry = this.timeEntries.find(e => e.id === id);
    if (entry) {
      entry.client = this.findClientById(entry.clientId);
      entry.service = this.findServiceById(entry.serviceId);
    }
    return entry;
  }

  updateTimeEntry(id: string, data: Partial<TimeEntry>): TimeEntry | undefined {
    const index = this.timeEntries.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    this.timeEntries[index] = { ...this.timeEntries[index], ...data };
    const entry = this.timeEntries[index];
    entry.client = this.findClientById(entry.clientId);
    entry.service = this.findServiceById(entry.serviceId);
    return entry;
  }

  deleteTimeEntry(id: string): boolean {
    const index = this.timeEntries.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.timeEntries.splice(index, 1);
    return true;
  }

  getTimeEntriesForUser(userId: string, filters: {
    clientId?: string;
    startDate?: Date;
    endDate?: Date;
    billable?: boolean;
  } = {}): TimeEntry[] {
    return this.timeEntries
      .filter(e => {
        if (e.employeeId !== userId) return false;
        if (filters.clientId && e.clientId !== filters.clientId) return false;
        if (filters.startDate && e.activityDate < filters.startDate) return false;
        if (filters.endDate && e.activityDate > filters.endDate) return false;
        if (filters.billable !== undefined && e.billable !== filters.billable) return false;
        return true;
      })
      .map(e => ({
        ...e,
        client: this.findClientById(e.clientId),
        service: this.findServiceById(e.serviceId),
      }))
      .sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime());
  }

  getAllTimeEntries(filters: {
    employeeId?: string;
    clientId?: string;
    startDate?: Date;
    endDate?: Date;
    billable?: boolean;
  } = {}): TimeEntry[] {
    return this.timeEntries
      .filter(e => {
        if (filters.employeeId && e.employeeId !== filters.employeeId) return false;
        if (filters.clientId && e.clientId !== filters.clientId) return false;
        if (filters.startDate && e.activityDate < filters.startDate) return false;
        if (filters.endDate && e.activityDate > filters.endDate) return false;
        if (filters.billable !== undefined && e.billable !== filters.billable) return false;
        return true;
      })
      .map(e => {
        const user = this.findUserById(e.employeeId);
        return {
          ...e,
          client: this.findClientById(e.clientId),
          service: this.findServiceById(e.serviceId),
          employee: user ? { id: user.id, name: user.name, email: user.email } : undefined,
        };
      })
      .sort((a, b) => b.activityDate.getTime() - a.activityDate.getTime());
  }
}

export const mockDb = new MockDatabase();
