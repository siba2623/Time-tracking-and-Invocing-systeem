# Implementation Plan

- [x] 1. Project Setup and Configuration




  - [x] 1.1 Initialize monorepo structure with frontend and backend packages

    - Create root package.json with workspaces configuration
    - Set up TypeScript configuration for both packages
    - Configure ESLint and Prettier for code consistency
    - _Requirements: Technical foundation_


  - [x] 1.2 Set up backend project with Express and Prisma

    - Initialize Node.js/Express application with TypeScript
    - Install and configure Prisma ORM
    - Set up PostgreSQL database connection
    - Configure environment variables handling
    - _Requirements: Technical foundation_


  - [x] 1.3 Set up frontend project with React and Vite

    - Initialize React application with Vite and TypeScript
    - Install and configure Tailwind CSS
    - Set up shadcn/ui component library
    - Configure API client with axios
    - _Requirements: Technical foundation_


  - [x] 1.4 Set up testing infrastructure

    - Configure Vitest for both frontend and backend
    - Install fast-check for property-based testing
    - Set up test utilities and helpers
    - _Requirements: Testing Strategy_






- [x] 2. Database Schema and Core Models
  - [x] 2.1 Create Prisma schema with all data models
    - Define User, Client, Service, Rate models
    - Define TimeEntry, Invoice, InvoiceLineItem models
    - Define EmployeeAllocation, BillingRule, AuditLog models


    - Set up relationships and indexes





    - _Requirements: 1.1, 8.1, 11.1_

  - [x] 2.2 Create database migrations and seed data
    - Generate initial migration from schema
    - Create seed script with sample data for development


    - _Requirements: Technical foundation_

- [x] 3. Input Validation Layer
  - [x] 3.1 Implement validation utility functions
    - Create rate validation function (positive numeric)


    - Create duration validation function (positive, max 24)
    - Create date validation function (valid date, within 30 days)
    - Create allocation percentage validation (0-100)






    - _Requirements: 1.2, 1.5, 7.2, 14.1, 14.2, 14.3_

  - [x]* 3.2 Write property tests for validation functions
    - **Property 2: Duration Validation**


    - **Property 3: Rate Validation**
    - **Property 4: Date Validation**

    - **Property 13: Allocation Percentage Validation**
    - **Validates: Requirements 1.2, 1.5, 7.2, 14.1, 14.2, 14.3**

  - [x] 3.3 Implement form validation error handling
    - Create validation error aggregator


    - Implement field-specific error message generation








    - _Requirements: 14.4_

  - [x]* 3.4 Write property test for form validation errors


    - **Property 25: Form Validation Error Specificity**
    - **Validates: Requirements 14.4**



- [x] 4. Authentication and Authorization
  - [x] 4.1 Implement user authentication service
    - Create password hashing with bcrypt


    - Implement JWT token generation and verification
    - Create login and logout endpoints

    - _Requirements: 10.1, 10.2, 10.5_

  - [x]* 4.2 Write property test for password security
    - **Property 19: Password Storage Security**

    - **Validates: Requirements 10.5**





  - [x] 4.3 Implement role-based authorization middleware
    - Create auth middleware for JWT verification
    - Implement role-checking middleware (employee/administrator)
    - Protect routes based on role requirements
    - _Requirements: 10.3, 10.4_


  - [x]* 4.4 Write property test for role-based access
    - **Property 18: Role-Based Access Control**
    - **Validates: Requirements 10.3, 10.4**


- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.



- [x] 6. Time Entry Core Logic
  - [x] 6.1 Implement amount calculation service
    - Create calculateAmount function (rate × duration when billable)
    - Handle billable=false case (amount=0)
    - _Requirements: 1.6, 1.7_

  - [x]* 6.2 Write property test for amount calculation
    - **Property 1: Amount Calculation Correctness**
    - **Validates: Requirements 1.6, 1.7**

  - [x] 6.3 Implement rate resolution service
    - Create getEffectiveRate function
    - Implement employee-specific rate override logic
    - Fall back to default service rate
    - _Requirements: 1.4, 8.3, 8.4_

  - [x]* 6.4 Write property test for rate resolution
    - **Property 9: Service Rate Auto-Fill**
    - **Validates: Requirements 1.4, 8.3, 8.4**

  - [x] 6.5 Implement modification window checker
    - Create canModifyEntry function (24-hour window check)
    - Check entry ownership
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x]* 6.6 Write property tests for modification window
    - **Property 7: Edit Window Enforcement**
    - **Property 8: Delete Window Enforcement**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 7. Time Entry CRUD Operations
  - [x] 7.1 Implement TimeEntry service
    - Create time entry with validation and amount calculation
    - Update time entry with window check
    - Delete time entry with window check
    - Get entries for user with filters
    - _Requirements: 1.1-1.8, 3.1-3.4_

  - [x]* 7.2 Write property test for time entry persistence
    - **Property 23: Time Entry Persistence**
    - **Validates: Requirements 1.8**

  - [x] 7.3 Implement TimeEntry API routes
    - POST /api/time-entries (create)
    - PUT /api/time-entries/:id (update)
    - DELETE /api/time-entries/:id (delete)
    - GET /api/time-entries (list with filters)
    - _Requirements: 1.1-1.8, 2.1-2.4, 3.1-3.4_

- [x] 8. Filtering and Query Logic

  - [x] 8.1 Implement employee timesheet filtering

    - Filter by employee ID (required for employees)
    - Filter by date range
    - Filter by client
    - Filter by billable status
    - _Requirements: 2.1, 2.2, 2.3, 2.4_


  - [x]* 8.2 Write property test for employee filtering
    - **Property 5: Employee Timesheet Filtering**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**


  - [x] 8.3 Implement admin time logs filtering
    - Filter by employee (optional for admins)
    - Combine multiple filter criteria with AND logic

    - _Requirements: 5.1, 5.2_

  - [x]* 8.4 Write property test for admin filtering
    - **Property 6: Admin Time Logs Filtering**
    - **Validates: Requirements 5.1, 5.2**

- [x] 9. Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Audit Logging
  - [x] 10.1 Implement audit log service
    - Create audit log entry on create/update/delete
    - Capture user ID, action, entity type, entity ID
    - Store old and new values as JSON
    - _Requirements: 11.1, 11.2_

  - [x]* 10.2 Write property test for audit logging
    - **Property 20: Audit Log Completeness**
    - **Validates: Requirements 11.1, 11.2**

  - [x] 10.3 Implement audit log query API
    - GET /api/audit-logs with filters
    - Filter by date range, user, action type
    - _Requirements: 11.3_

  - [x]* 10.4 Write property test for audit log filtering
    - **Property 21: Audit Log Filtering**
    - **Validates: Requirements 11.3**

- [x] 11. Client and Rate Management
  - [x] 11.1 Implement Client service
    - Create client with name and contact info
    - Update client maintaining history
    - List active clients
    - _Requirements: 8.1, 8.2_

  - [x]* 11.2 Write property test for client CRUD
    - **Property 24: Client CRUD Consistency**
    - **Validates: Requirements 8.1, 8.2**

  - [x] 11.3 Implement Rate service
    - Set default rates per service
    - Set employee-specific rate overrides
    - Get effective rate for service/employee combination
    - _Requirements: 8.3, 8.4_

  - [x] 11.4 Implement Client and Rate API routes
    - CRUD endpoints for /api/clients
    - CRUD endpoints for /api/rates
    - CRUD endpoints for /api/services
    - _Requirements: 8.1-8.5_

  - [x] 11.5 Implement billing rules management
    - Create/update billing rules for travel, allowances
    - Store and retrieve rules for invoice generation
    - _Requirements: 8.5_

- [x] 12. Aggregation and Reporting Services
  - [x] 12.1 Implement hours aggregation functions
    - Calculate total hours per employee
    - Calculate billable vs non-billable breakdown
    - Calculate hours by client
    - _Requirements: 4.1, 4.2, 7.1, 9.1_

  - [x]* 12.2 Write property tests for hours aggregation
    - **Property 14: Hours Aggregation by Employee**
    - **Property 15: Billable vs Non-Billable Breakdown**
    - **Property 16: Hours by Client Report**
    - **Validates: Requirements 4.1, 4.2, 7.1, 9.1**

  - [x] 12.3 Implement revenue aggregation functions
    - Calculate revenue by consultant
    - Calculate monthly/quarterly summaries
    - _Requirements: 9.2, 9.3_

  - [x]* 12.4 Write property test for revenue aggregation
    - **Property 17: Revenue by Consultant Report**
    - **Validates: Requirements 9.2**

  - [x] 12.5 Implement Reports API routes
    - GET /api/reports/hours-by-client
    - GET /api/reports/revenue-by-consultant
    - GET /api/reports/summary
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Commission and Payroll
  - [x] 14.1 Implement commission calculation service
    - Calculate commission as billable amount × allocation percentage / 100
    - Get commission report for period
    - _Requirements: 7.3, 7.4_

  - [x]* 14.2 Write property test for commission calculation
    - **Property 12: Commission Calculation**
    - **Validates: Requirements 7.3**

  - [x] 14.3 Implement employee allocation management
    - Set allocation percentage for employee
    - Validate percentage is 0-100
    - _Requirements: 7.2_

  - [x] 14.4 Implement Payroll API routes
    - GET /api/payroll/breakdown
    - GET /api/payroll/commission
    - PUT /api/payroll/allocation/:employeeId
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 15. Invoice Generation
  - [x] 15.1 Implement invoice aggregation service
    - Aggregate billable entries for client and date range
    - Create line items from time entries
    - Support additional charges
    - _Requirements: 6.1, 6.2, 6.3_

  - [x]* 15.2 Write property test for invoice aggregation
    - **Property 10: Invoice Aggregation Correctness**
    - **Validates: Requirements 6.1, 6.2**

  - [x] 15.3 Implement invoice number generation
    - Generate unique sequential invoice numbers
    - Record generation timestamp
    - _Requirements: 6.5_

  - [x]* 15.4 Write property test for invoice uniqueness
    - **Property 11: Invoice Number Uniqueness**
    - **Validates: Requirements 6.5**

  - [x] 15.5 Implement PDF generation service
    - Generate PDF with invoice header and client info
    - Include line items with descriptions, hours, rates, amounts
    - Calculate and display totals
    - _Requirements: 6.4_

  - [x] 15.6 Implement Invoice API routes
    - GET /api/invoices (list)
    - POST /api/invoices/generate
    - PUT /api/invoices/:id (update additional charges)
    - GET /api/invoices/:id/pdf
    - _Requirements: 6.1-6.5_

- [x] 16. Excel Export
  - [x] 16.1 Implement Excel export service
    - Export filtered time entries to Excel format
    - Include all relevant columns
    - _Requirements: 5.3_

  - [x]* 16.2 Write property test for Excel export round-trip
    - **Property 22: Excel Export Round-Trip**
    - **Validates: Requirements 5.3**

  - [x] 16.3 Implement export API endpoint
    - GET /api/time-entries/export
    - Apply same filters as list endpoint
    - _Requirements: 5.3_

- [x] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Email Notifications
  - [x] 18.1 Implement notification service
    - Configure SendGrid integration
    - Create email templates for notifications
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 18.2 Implement notification triggers
    - Send notification on time entry submission
    - Send notification on entry approval/rejection
    - Send notification on invoice generation
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 19. Frontend - Authentication UI
  - [x] 19.1 Implement login page
    - Create login form with email/password
    - Handle authentication errors
    - Store JWT token
    - _Requirements: 10.1, 10.2_

  - [x] 19.2 Implement auth context and protected routes
    - Create auth context for user state
    - Implement route guards based on role
    - Handle session expiration
    - _Requirements: 10.3, 10.4_

- [x] 20. Frontend - Time Entry UI
  - [x] 20.1 Implement time entry form
    - Pre-fill consultant from logged-in user
    - Date picker with 30-day validation
    - Client and service dropdowns
    - Rate auto-fill on service selection
    - Duration input with validation
    - Billable toggle with amount calculation
    - _Requirements: 1.1-1.8_

  - [x] 20.2 Implement My Timesheet page
    - Display user's time entries in table
    - Implement date, client, billable filters
    - Enable edit/delete for entries within 24 hours
    - _Requirements: 2.1-2.4, 3.1-3.4_

- [x] 21. Frontend - Admin Time Logs UI
  - [x] 21.1 Implement admin time logs page
    - Display all employee entries
    - Implement combined filters (employee, client, date, billable)
    - Add Excel export button
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 22. Frontend - Dashboard UI
  - [x] 22.1 Implement admin dashboard
    - Display hours per employee summary
    - Display billable vs non-billable breakdown
    - Display upcoming invoices list
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 23. Frontend - Client Management UI
  - [x] 23.1 Implement client management page
    - List clients with search
    - Add/edit client forms
    - _Requirements: 8.1, 8.2_

  - [x] 23.2 Implement rate management
    - Set default service rates
    - Set employee-specific rates
    - Configure billing rules
    - _Requirements: 8.3, 8.4, 8.5_

- [x] 24. Frontend - Invoice UI
  - [x] 24.1 Implement invoice generation page
    - Client and date range selection
    - Preview billable entries
    - Add additional charges
    - Generate and download PDF
    - _Requirements: 6.1-6.5_

  - [x] 24.2 Implement invoice list page
    - Display generated invoices
    - Filter by status, client, date
    - Download PDF action
    - _Requirements: 6.1-6.5_

- [x] 25. Frontend - Payroll and Reports UI
  - [x] 25.1 Implement payroll page
    - Display hours breakdown per client/employee
    - Manage allocation percentages
    - Display commission calculations
    - _Requirements: 7.1-7.4_

  - [x] 25.2 Implement reports page
    - Hours by client report
    - Revenue by consultant report
    - Monthly/quarterly summary reports
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 26. Frontend - Responsive Design
  - [x] 26.1 Implement responsive layouts
    - Optimize layouts for desktop and mobile
    - Ensure touch-friendly controls on mobile
    - Test dynamic layout adaptation
    - _Requirements: 13.1, 13.2, 13.3_

- [x] 27. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.
