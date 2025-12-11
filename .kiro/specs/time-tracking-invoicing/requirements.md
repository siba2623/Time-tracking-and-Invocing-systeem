# Requirements Document

## Introduction

This document specifies the requirements for a Time Tracking and Invoicing System designed to replace manual Excel-based tracking for a consulting/HR services company. The system enables employees to log their time against clients and services, while administrators can review entries, generate invoices, track payroll/commissions, and manage clients and rates. The goal is a clean, intuitive system that reduces errors and speeds up invoicing.

## Glossary

- **Time_Entry**: A record of work performed by an employee, including date, client, service, duration, and billing information
- **Employee**: A user with basic access who can log and view their own time entries
- **Administrator**: A user with full system access including invoice generation, payroll tracking, and client management
- **Billable_Hours**: Time entries marked as chargeable to a client
- **Non_Billable_Hours**: Time entries not charged to clients (internal work, training, etc.)
- **Rate**: The hourly charge for a specific service or employee-service combination
- **Invoice**: A generated document summarizing billable work for a client over a date range
- **Commission**: Calculated payment to employees based on billable hours and allocation percentages
- **Audit_Log**: A record tracking all data modifications with user and timestamp information
- **Client**: A customer organization that receives services and is billed for work

## Requirements

### Requirement 1: Time Entry Creation

**User Story:** As an employee, I want to log my daily activities with all relevant details, so that my work is accurately recorded for billing and payroll purposes.

#### Acceptance Criteria

1. WHEN an employee opens the time entry form THEN the System SHALL pre-fill the Consultant field with the logged-in user's name
2. WHEN an employee selects an Activity Date THEN the System SHALL provide a calendar picker interface and validate the date is not more than 30 days in the past
3. WHEN an employee selects a Customer THEN the System SHALL display a dropdown populated from the active client list
4. WHEN an employee selects a Product/Service THEN the System SHALL display a dropdown with available services and auto-fill the Rate field based on the selected service
5. WHEN an employee enters a Duration THEN the System SHALL accept decimal values representing hours and validate the value is a positive number not exceeding 24
6. WHEN an employee toggles Billable to Yes THEN the System SHALL calculate and display the Amount as Rate multiplied by Duration
7. WHEN an employee toggles Billable to No THEN the System SHALL set the Amount to zero and disable the Amount field
8. WHEN an employee submits a time entry with all required fields completed THEN the System SHALL save the entry immediately and flag it for admin review

### Requirement 2: Employee Timesheet View

**User Story:** As an employee, I want to view my own time entries in a filterable table, so that I can track my logged hours and verify accuracy.

#### Acceptance Criteria

1. WHEN an employee accesses the My Timesheet view THEN the System SHALL display only that employee's time entries in a tabular format
2. WHEN an employee applies a date filter THEN the System SHALL display only entries within the specified date range
3. WHEN an employee applies a client filter THEN the System SHALL display only entries for the selected client
4. WHEN an employee applies a billable status filter THEN the System SHALL display only entries matching the selected billable status

### Requirement 3: Time Entry Modification

**User Story:** As an employee, I want to edit or delete my own time entries within a limited period, so that I can correct mistakes promptly.

#### Acceptance Criteria

1. WHEN an employee attempts to edit a time entry created within 24 hours THEN the System SHALL allow the modification and update the entry
2. WHEN an employee attempts to edit a time entry created more than 24 hours ago THEN the System SHALL reject the modification and display an error message indicating the edit window has expired
3. WHEN an employee attempts to delete a time entry created within 24 hours THEN the System SHALL remove the entry from the active records
4. WHEN an employee attempts to delete a time entry created more than 24 hours ago THEN the System SHALL reject the deletion and display an error message indicating the delete window has expired

### Requirement 4: Administrator Dashboard

**User Story:** As an administrator, I want to see an overview of time tracking metrics, so that I can monitor team productivity and billing status.

#### Acceptance Criteria

1. WHEN an administrator accesses the dashboard THEN the System SHALL display total hours logged per employee for the current period
2. WHEN an administrator accesses the dashboard THEN the System SHALL display a breakdown of billable versus non-billable hours
3. WHEN an administrator accesses the dashboard THEN the System SHALL display a list of upcoming invoices with due dates

### Requirement 5: Administrator Time Logs Management

**User Story:** As an administrator, I want to view and filter all employee time entries, so that I can review work performed and prepare for invoicing.

#### Acceptance Criteria

1. WHEN an administrator accesses the Time Logs view THEN the System SHALL display all employee entries in a tabular format
2. WHEN an administrator applies filters for employee, client, date range, or billable status THEN the System SHALL display only entries matching all applied filter criteria
3. WHEN an administrator requests an Excel export THEN the System SHALL generate a downloadable Excel file containing the currently filtered time entries

### Requirement 6: Invoice Generation

**User Story:** As an administrator, I want to generate invoices for clients based on billable hours, so that I can bill clients accurately and efficiently.

#### Acceptance Criteria

1. WHEN an administrator selects a client and date range for invoicing THEN the System SHALL aggregate all billable time entries for that client within the specified period
2. WHEN an administrator generates an invoice THEN the System SHALL include line items for each billable entry with service description, hours, rate, and amount
3. WHEN an administrator adds travel or other charges to an invoice THEN the System SHALL include these as separate editable line items
4. WHEN an administrator finalizes an invoice THEN the System SHALL generate a PDF document with a complete breakdown of all charges
5. WHEN an invoice is generated THEN the System SHALL assign a unique invoice number and record the generation timestamp

### Requirement 7: Payroll and Commission Tracking

**User Story:** As an administrator, I want to track payroll breakdown and calculate commissions automatically, so that employee compensation is accurate and transparent.

#### Acceptance Criteria

1. WHEN an administrator accesses the payroll view THEN the System SHALL display hours breakdown per client for each employee
2. WHEN an administrator sets allocation percentages for employees THEN the System SHALL store values between 0 and 100 percent
3. WHEN billable hours are recorded THEN the System SHALL calculate commission as billable amount multiplied by the employee's allocation percentage
4. WHEN an administrator views commission reports THEN the System SHALL display calculated commission amounts per employee for the selected period

### Requirement 8: Client and Rate Management

**User Story:** As an administrator, I want to manage clients and their associated rates, so that billing is consistent and configurable.

#### Acceptance Criteria

1. WHEN an administrator adds a new client THEN the System SHALL create a client record with name and contact information
2. WHEN an administrator edits a client THEN the System SHALL update the client record and maintain historical data integrity
3. WHEN an administrator sets default rates per service THEN the System SHALL store the rate and apply it automatically to new time entries for that service
4. WHEN an administrator sets employee-specific rates THEN the System SHALL override default service rates for that employee-service combination
5. WHEN an administrator configures billing rules for travel or allowances THEN the System SHALL store these rules and apply them during invoice generation

### Requirement 9: Reporting

**User Story:** As an administrator, I want to generate reports on hours and revenue, so that I can analyze business performance.

#### Acceptance Criteria

1. WHEN an administrator requests a hours-by-client report THEN the System SHALL display total hours worked for each client in the selected period
2. WHEN an administrator requests a revenue-by-consultant report THEN the System SHALL display total billable revenue attributed to each employee
3. WHEN an administrator requests a summary report THEN the System SHALL provide monthly and quarterly aggregations of hours and revenue

### Requirement 10: User Authentication and Authorization

**User Story:** As a system user, I want secure login with role-based access, so that my data is protected and I see only relevant features.

#### Acceptance Criteria

1. WHEN a user attempts to login with valid credentials THEN the System SHALL authenticate the user and establish a session
2. WHEN a user attempts to login with invalid credentials THEN the System SHALL reject the login and display an error message without revealing which credential was incorrect
3. WHEN an authenticated employee accesses the system THEN the System SHALL display only employee-level features and restrict access to administrator functions
4. WHEN an authenticated administrator accesses the system THEN the System SHALL display all system features including management and reporting functions
5. WHEN storing user credentials THEN the System SHALL encrypt passwords using a secure hashing algorithm

### Requirement 11: Audit Logging

**User Story:** As an administrator, I want to track all data modifications, so that I can maintain accountability and investigate discrepancies.

#### Acceptance Criteria

1. WHEN any user creates, updates, or deletes a time entry THEN the System SHALL record the action, user identifier, timestamp, and changed values in the audit log
2. WHEN any user modifies client or rate data THEN the System SHALL record the modification details in the audit log
3. WHEN an administrator queries the audit log THEN the System SHALL display entries filtered by date range, user, or action type

### Requirement 12: Notifications

**User Story:** As a system user, I want to receive email notifications for important events, so that I stay informed about time submissions and invoice approvals.

#### Acceptance Criteria

1. WHEN an employee submits time entries THEN the System SHALL send an email notification to the designated administrator
2. WHEN an administrator approves or rejects time entries THEN the System SHALL send an email notification to the affected employee
3. WHEN an invoice is generated and sent THEN the System SHALL send a confirmation email to the administrator

### Requirement 13: Responsive Design

**User Story:** As a system user, I want to access the system from desktop and mobile devices, so that I can log time and review data from anywhere.

#### Acceptance Criteria

1. WHEN a user accesses the system from a desktop browser THEN the System SHALL render a full-featured interface optimized for larger screens
2. WHEN a user accesses the system from a mobile device THEN the System SHALL render a responsive interface with touch-friendly controls and readable text
3. WHEN screen size changes THEN the System SHALL adapt the layout dynamically without requiring page reload

### Requirement 14: Data Validation

**User Story:** As a system user, I want the system to validate my inputs, so that data integrity is maintained and errors are prevented.

#### Acceptance Criteria

1. WHEN a user enters a rate value THEN the System SHALL validate the input is a positive numeric value
2. WHEN a user enters a duration value THEN the System SHALL validate the input is a positive numeric value not exceeding 24 hours
3. WHEN a user enters a date THEN the System SHALL validate the date format and ensure it represents a valid calendar date
4. IF a user submits a form with invalid data THEN the System SHALL display specific error messages for each invalid field and prevent submission
