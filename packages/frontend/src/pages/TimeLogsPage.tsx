/**
 * Admin Time Logs Page Component
 * Validates: Requirements 5.1, 5.2, 5.3
 */
import { useState } from 'react';
import type { TimeEntry } from '../lib/types';

export function TimeLogsPage() {
  const [entries] = useState<TimeEntry[]>([]);
  const [filters, setFilters] = useState({
    employeeId: '',
    clientId: '',
    startDate: '',
    endDate: '',
    billable: '',
  });

  const handleExport = () => {
    // TODO: Call export API
    alert('Export functionality coming soon');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Time Logs</h1>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Export to Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee</label>
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Employees</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <select
              value={filters.clientId}
              onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Clients</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Billable</label>
            <select
              value={filters.billable}
              onChange={(e) => setFilters({ ...filters, billable: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="true">Billable</option>
              <option value="false">Non-Billable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No time entries found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.activityDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.clientId}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{entry.memo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R{entry.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                      entry.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
