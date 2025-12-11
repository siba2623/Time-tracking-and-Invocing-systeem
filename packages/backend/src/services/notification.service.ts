/**
 * Notification Service
 * Handles email notifications for system events
 * Validates: Requirements 12.1, 12.2, 12.3
 */

export interface TimeEntry {
  id: string;
  employeeId: string;
  clientId: string;
  activityDate: Date;
  memo: string;
  duration: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  total: number;
}

export interface NotificationRecipient {
  email: string;
  name: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

/**
 * Generates email template for time entry submission
 * Validates: Requirements 12.1
 */
export function generateTimeEntrySubmittedTemplate(
  entry: TimeEntry,
  employeeName: string
): EmailTemplate {
  return {
    subject: `Time Entry Submitted - ${entry.activityDate.toISOString().split('T')[0]}`,
    body: `
A new time entry has been submitted.

Employee: ${employeeName}
Date: ${entry.activityDate.toISOString().split('T')[0]}
Duration: ${entry.duration} hours
Amount: $${entry.amount.toFixed(2)}
Description: ${entry.memo || 'N/A'}

This entry is pending approval.
    `.trim(),
  };
}

/**
 * Generates email template for time entry approval/rejection
 * Validates: Requirements 12.2
 */
export function generateTimeEntryApprovalTemplate(
  entry: TimeEntry,
  approved: boolean,
  employeeName: string
): EmailTemplate {
  const status = approved ? 'Approved' : 'Rejected';
  return {
    subject: `Time Entry ${status} - ${entry.activityDate.toISOString().split('T')[0]}`,
    body: `
Your time entry has been ${status.toLowerCase()}.

Date: ${entry.activityDate.toISOString().split('T')[0]}
Duration: ${entry.duration} hours
Amount: $${entry.amount.toFixed(2)}
Description: ${entry.memo || 'N/A'}

Status: ${status}
    `.trim(),
  };
}


/**
 * Generates email template for invoice generation
 * Validates: Requirements 12.3
 */
export function generateInvoiceGeneratedTemplate(
  invoice: Invoice,
  clientName: string
): EmailTemplate {
  return {
    subject: `Invoice Generated - ${invoice.invoiceNumber}`,
    body: `
A new invoice has been generated.

Invoice Number: ${invoice.invoiceNumber}
Client: ${clientName}
Total: $${invoice.total.toFixed(2)}

The invoice is ready for review and sending.
    `.trim(),
  };
}

/**
 * Email sending interface (placeholder for SendGrid integration)
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends an email notification
 * In a real implementation, this would use SendGrid
 */
export async function sendEmail(
  to: NotificationRecipient,
  template: EmailTemplate
): Promise<EmailSendResult> {
  // Placeholder implementation
  // In production, this would integrate with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({ to: to.email, from: 'noreply@company.com', subject: template.subject, text: template.body });

  console.log(`[Email] To: ${to.email}, Subject: ${template.subject}`);

  return {
    success: true,
    messageId: `msg_${Date.now()}`,
  };
}

/**
 * Sends time entry submission notification
 */
export async function sendTimeEntrySubmittedNotification(
  entry: TimeEntry,
  employeeName: string,
  adminRecipients: NotificationRecipient[]
): Promise<EmailSendResult[]> {
  const template = generateTimeEntrySubmittedTemplate(entry, employeeName);
  const results: EmailSendResult[] = [];

  for (const recipient of adminRecipients) {
    const result = await sendEmail(recipient, template);
    results.push(result);
  }

  return results;
}

/**
 * Sends time entry approval/rejection notification
 */
export async function sendTimeEntryApprovalNotification(
  entry: TimeEntry,
  approved: boolean,
  employeeName: string,
  employeeRecipient: NotificationRecipient
): Promise<EmailSendResult> {
  const template = generateTimeEntryApprovalTemplate(entry, approved, employeeName);
  return sendEmail(employeeRecipient, template);
}

/**
 * Sends invoice generated notification
 */
export async function sendInvoiceGeneratedNotification(
  invoice: Invoice,
  clientName: string,
  adminRecipients: NotificationRecipient[]
): Promise<EmailSendResult[]> {
  const template = generateInvoiceGeneratedTemplate(invoice, clientName);
  const results: EmailSendResult[] = [];

  for (const recipient of adminRecipients) {
    const result = await sendEmail(recipient, template);
    results.push(result);
  }

  return results;
}
