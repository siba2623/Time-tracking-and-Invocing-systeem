/**
 * Shared types for the frontend application
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'administrator';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  clientId: string;
  serviceId: string;
  activityDate: string;
  memo: string;
  rate: number;
  duration: number;
  billable: boolean;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  startDate: string;
  endDate: string;
  subtotal: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
}
