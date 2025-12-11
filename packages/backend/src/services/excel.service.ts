/**
 * Excel Export Service
 * Handles exporting time entries to Excel format
 * Validates: Requirements 5.3
 */

export interface TimeEntryExport {
  id: string;
  employeeId: string;
  employeeName?: string;
  clientId: string;
  clientName?: string;
  serviceId: string;
  serviceName?: string;
  activityDate: Date;
  memo: string;
  rate: number;
  duration: number;
  billable: boolean;
  amount: number;
}

export interface ExcelColumn {
  header: string;
  key: string;
  width: number;
}

/**
 * Defines the columns for time entry export
 */
export function getTimeEntryExportColumns(): ExcelColumn[] {
  return [
    { header: 'Date', key: 'activityDate', width: 15 },
    { header: 'Employee', key: 'employeeName', width: 20 },
    { header: 'Client', key: 'clientName', width: 20 },
    { header: 'Service', key: 'serviceName', width: 20 },
    { header: 'Description', key: 'memo', width: 30 },
    { header: 'Hours', key: 'duration', width: 10 },
    { header: 'Rate', key: 'rate', width: 12 },
    { header: 'Billable', key: 'billable', width: 10 },
    { header: 'Amount', key: 'amount', width: 12 },
  ];
}

/**
 * Transforms time entries for Excel export
 * Property 22: Excel Export Round-Trip
 */
export function transformEntriesForExport(entries: TimeEntryExport[]): Record<string, unknown>[] {
  return entries.map((entry) => ({
    activityDate: entry.activityDate.toISOString().split('T')[0],
    employeeName: entry.employeeName ?? entry.employeeId,
    clientName: entry.clientName ?? entry.clientId,
    serviceName: entry.serviceName ?? entry.serviceId,
    memo: entry.memo,
    duration: entry.duration,
    rate: entry.rate,
    billable: entry.billable ? 'Yes' : 'No',
    amount: entry.amount,
  }));
}


/**
 * Parses exported Excel data back to time entries
 * Property 22: Excel Export Round-Trip
 */
export function parseExportedData(
  rows: Record<string, unknown>[]
): Partial<TimeEntryExport>[] {
  return rows.map((row) => ({
    activityDate: row.activityDate ? new Date(row.activityDate as string) : undefined,
    employeeName: row.employeeName as string | undefined,
    clientName: row.clientName as string | undefined,
    serviceName: row.serviceName as string | undefined,
    memo: row.memo as string | undefined,
    duration: typeof row.duration === 'number' ? row.duration : parseFloat(row.duration as string),
    rate: typeof row.rate === 'number' ? row.rate : parseFloat(row.rate as string),
    billable: row.billable === 'Yes' || row.billable === true,
    amount: typeof row.amount === 'number' ? row.amount : parseFloat(row.amount as string),
  }));
}

/**
 * Validates that exported and parsed data match
 * Property 22: Excel Export Round-Trip
 */
export function validateRoundTrip(
  original: TimeEntryExport[],
  parsed: Partial<TimeEntryExport>[]
): boolean {
  if (original.length !== parsed.length) {
    return false;
  }

  for (let i = 0; i < original.length; i++) {
    const orig = original[i];
    const pars = parsed[i];

    // Check key fields match
    if (orig.memo !== pars.memo) return false;
    if (Math.abs(orig.duration - (pars.duration ?? 0)) > 0.001) return false;
    if (Math.abs(orig.rate - (pars.rate ?? 0)) > 0.001) return false;
    if (orig.billable !== pars.billable) return false;
    if (Math.abs(orig.amount - (pars.amount ?? 0)) > 0.001) return false;

    // Check date matches (comparing date strings)
    const origDate = orig.activityDate.toISOString().split('T')[0];
    const parsDate = pars.activityDate?.toISOString().split('T')[0];
    if (origDate !== parsDate) return false;
  }

  return true;
}

/**
 * Generates Excel buffer (placeholder - would use ExcelJS in real implementation)
 */
export async function generateExcelBuffer(entries: TimeEntryExport[]): Promise<Buffer> {
  const columns = getTimeEntryExportColumns();
  const rows = transformEntriesForExport(entries);

  // In a real implementation, this would use ExcelJS to generate the Excel file
  // For now, return a JSON representation as a buffer
  const content = JSON.stringify({
    type: 'excel_export',
    columns: columns.map((c) => c.header),
    rowCount: rows.length,
    data: rows,
  });

  return Buffer.from(content, 'utf-8');
}
