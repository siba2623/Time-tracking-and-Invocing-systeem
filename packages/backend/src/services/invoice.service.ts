/**
 * Invoice Service
 * Handles invoice generation and management
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

export interface TimeEntry {
  id: string;
  employeeId: string;
  clientId: string;
  serviceId: string;
  activityDate: Date;
  memo: string;
  rate: number;
  duration: number;
  billable: boolean;
  amount: number;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  timeEntryId: string | null;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  type: 'time_entry' | 'additional_charge';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  startDate: Date;
  endDate: Date;
  subtotal: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
  generatedAt: Date;
  lineItems: InvoiceLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdditionalCharge {
  description: string;
  amount: number;
}

export interface GenerateInvoiceInput {
  clientId: string;
  startDate: Date;
  endDate: Date;
  additionalCharges?: AdditionalCharge[];
}


/**
 * Filters billable time entries for a client within a date range
 * Property 10: Invoice Aggregation Correctness
 * Validates: Requirements 6.1, 6.2
 */
export function getBillableEntriesForInvoice(
  entries: TimeEntry[],
  clientId: string,
  startDate: Date,
  endDate: Date
): TimeEntry[] {
  return entries.filter((entry) => {
    return (
      entry.clientId === clientId &&
      entry.billable &&
      entry.activityDate >= startDate &&
      entry.activityDate <= endDate
    );
  });
}

/**
 * Creates line items from time entries
 * Property 10: Invoice Aggregation Correctness
 */
export function createLineItemsFromEntries(
  entries: TimeEntry[],
  invoiceId: string,
  generateId: () => string = () => crypto.randomUUID()
): InvoiceLineItem[] {
  return entries.map((entry) => ({
    id: generateId(),
    invoiceId,
    timeEntryId: entry.id,
    description: entry.memo || `Service on ${entry.activityDate.toISOString().split('T')[0]}`,
    quantity: entry.duration,
    rate: entry.rate,
    amount: entry.amount,
    type: 'time_entry' as const,
  }));
}

/**
 * Creates line items from additional charges
 */
export function createLineItemsFromCharges(
  charges: AdditionalCharge[],
  invoiceId: string,
  generateId: () => string = () => crypto.randomUUID()
): InvoiceLineItem[] {
  return charges.map((charge) => ({
    id: generateId(),
    invoiceId,
    timeEntryId: null,
    description: charge.description,
    quantity: 1,
    rate: charge.amount,
    amount: charge.amount,
    type: 'additional_charge' as const,
  }));
}

/**
 * Calculates invoice totals from line items
 */
export function calculateInvoiceTotals(lineItems: InvoiceLineItem[]): {
  subtotal: number;
  total: number;
} {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  return {
    subtotal,
    total: subtotal, // Could add tax calculation here
  };
}


// Track generated invoice numbers for uniqueness
let invoiceCounter = 0;

/**
 * Generates a unique invoice number
 * Property 11: Invoice Number Uniqueness
 * Validates: Requirements 6.5
 */
export function generateInvoiceNumber(
  prefix: string = 'INV',
  existingNumbers: Set<string> = new Set()
): string {
  const year = new Date().getFullYear();
  let number: string;

  do {
    invoiceCounter++;
    number = `${prefix}-${year}-${String(invoiceCounter).padStart(6, '0')}`;
  } while (existingNumbers.has(number));

  return number;
}

/**
 * Resets the invoice counter (for testing)
 */
export function resetInvoiceCounter(): void {
  invoiceCounter = 0;
}

/**
 * Generates a complete invoice
 */
export function generateInvoice(
  input: GenerateInvoiceInput,
  entries: TimeEntry[],
  existingInvoiceNumbers: Set<string> = new Set(),
  generateId: () => string = () => crypto.randomUUID()
): Invoice {
  const invoiceId = generateId();
  const invoiceNumber = generateInvoiceNumber('INV', existingInvoiceNumbers);

  // Get billable entries for this client and date range
  const billableEntries = getBillableEntriesForInvoice(
    entries,
    input.clientId,
    input.startDate,
    input.endDate
  );

  // Create line items
  const entryLineItems = createLineItemsFromEntries(billableEntries, invoiceId, generateId);
  const chargeLineItems = input.additionalCharges
    ? createLineItemsFromCharges(input.additionalCharges, invoiceId, generateId)
    : [];

  const allLineItems = [...entryLineItems, ...chargeLineItems];
  const { subtotal, total } = calculateInvoiceTotals(allLineItems);

  const now = new Date();

  return {
    id: invoiceId,
    invoiceNumber,
    clientId: input.clientId,
    startDate: input.startDate,
    endDate: input.endDate,
    subtotal,
    total,
    status: 'draft',
    generatedAt: now,
    lineItems: allLineItems,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * PDF Generation placeholder
 * In a real implementation, this would use PDFKit to generate actual PDFs
 * Validates: Requirements 6.4
 */
export interface PDFInvoiceData {
  invoice: Invoice;
  clientName: string;
  clientAddress: string;
  companyName: string;
  companyAddress: string;
}

export function generateInvoicePDFData(
  invoice: Invoice,
  clientInfo: { name: string; address: string },
  companyInfo: { name: string; address: string }
): PDFInvoiceData {
  return {
    invoice,
    clientName: clientInfo.name,
    clientAddress: clientInfo.address,
    companyName: companyInfo.name,
    companyAddress: companyInfo.address,
  };
}

/**
 * Formats currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Generates PDF buffer (placeholder - would use PDFKit in real implementation)
 */
export async function generatePDFBuffer(data: PDFInvoiceData): Promise<Buffer> {
  // In a real implementation, this would use PDFKit to generate the PDF
  // For now, return a placeholder buffer with invoice data as JSON
  const content = JSON.stringify({
    type: 'invoice_pdf',
    invoiceNumber: data.invoice.invoiceNumber,
    clientName: data.clientName,
    total: formatCurrency(data.invoice.total),
    lineItems: data.invoice.lineItems.length,
    generatedAt: new Date().toISOString(),
  });

  return Buffer.from(content, 'utf-8');
}
