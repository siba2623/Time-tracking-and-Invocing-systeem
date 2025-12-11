/**
 * Client Service
 * Handles client CRUD operations
 * Validates: Requirements 8.1, 8.2
 */

export interface Client {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientInput {
  name: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
}

export interface UpdateClientInput {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  active?: boolean;
}

/**
 * Creates a new client with the provided data
 * Property 24: Client CRUD Consistency
 */
export function createClient(
  input: CreateClientInput,
  generateId: () => string = () => crypto.randomUUID()
): Client {
  const now = new Date();
  return {
    id: generateId(),
    name: input.name,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone ?? '',
    address: input.address ?? '',
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Updates an existing client with new values
 * Property 24: Client CRUD Consistency
 */
export function updateClient(client: Client, updates: UpdateClientInput): Client {
  return {
    ...client,
    name: updates.name ?? client.name,
    contactEmail: updates.contactEmail ?? client.contactEmail,
    contactPhone: updates.contactPhone ?? client.contactPhone,
    address: updates.address ?? client.address,
    active: updates.active ?? client.active,
    updatedAt: new Date(),
  };
}


/**
 * Validates client input data
 */
export function validateClientInput(input: CreateClientInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push('Client name is required');
  }

  if (!input.contactEmail || input.contactEmail.trim().length === 0) {
    errors.push('Contact email is required');
  } else if (!isValidEmail(input.contactEmail)) {
    errors.push('Contact email is invalid');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Filters active clients from a list
 */
export function getActiveClients(clients: Client[]): Client[] {
  return clients.filter((client) => client.active);
}

/**
 * Finds a client by ID
 */
export function findClientById(clients: Client[], id: string): Client | undefined {
  return clients.find((client) => client.id === id);
}
