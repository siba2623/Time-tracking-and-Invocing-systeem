/**
 * Reports Page Component
 * Validates: Requirements 9.1, 9.2, 9.3
 */
import { useState } from 'react';

export function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>

      {/* Date Range Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Generate Reports
            </button>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Hours by Client */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Hours by Client</h2>
          <div className="text-center text-gray-500 py-8">
            Select a date range to view report
          </div>
        </div>

        {/* Revenue by Consultant */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue by Consultant</h2>
          <div className="text-center text-gray-500 py-8">
            Select a date range to view report
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Billable Hours</p>
              <p className="text-2xl font-semibold text-green-600">0</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Non-Billable Hours</p>
              <p className="text-2xl font-semibold text-gray-600">0</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-blue-600">R0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
