/**
 * Admin Time Logs Page Component
 * Shows all employee time entries with approval workflow
 * Validates: Requirements 5.1, 5.2, 5.3
 */
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { TimeEntry, Client, Service } from '../lib/types';

interface Employee {
  id: string;
  name: string;
  email: string;
}

export function TimeLogsPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employeeId: '',
    clientId: '',
    startDate: '',
    endDate: '',
    billable: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, employeesRes, clientsRes, servicesRes] = await Promise.all([
        api.get('/time-entries'),
        api.get('/users/employees'),
        api.get('/clients'),
        api.get('/services'),
      ]);
      setEntries(entriesRes.data || []);
      setEmployees(employeesRes.data?.data || []);
      setClients(clientsRes.data?.data || []);
      setServices(servicesRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (entryId: string) => {
    try {
      await api.patch(`/time-entries/${entryId}/status`, { status: 'approved' });
      setEntries(entries.map(e => e.id === entryId ? { ...e, status: 'approved' } : e));
    } catch (error) {
      console.error('Failed to approve entry:', error);
      alert('Failed to approve entry');
    }
  };

  const handleReject = async (entryId: string) => {
    try {
      await api.patch(`/time-entries/${entryId}/status`, { status: 'rejected' });
      setEntries(entries.map(e => e.id === entryId ? { ...e, status: 'rejected' } : e));
    } catch (error) {
      console.error('Failed to reject entry:', error);
      alert('Failed to reject entry');
    }
  };

  const handleExport = () => {
    alert('Export functionality coming soon');
  };

  const filteredEntries = entries.filter(entry => {
    if (filters.employeeId && entry.employeeId !== filters.employeeId) return false;
    if (filters.clientId && entry.clientId !== filters.clientId) return false;
    if (filters.billable === 'true' && !entry.billable) return false;
    if (filters.billable === 'false' && entry.billable) return false;
    return true;
  });

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp?.name || employeeId;
  };

  const getEmployeeEmail = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp?.email || '';
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || clientId;
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || serviceId;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Time Logs - Admin Review</h1>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <select
              value={filters.clientId}
              onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.billable}
              onChange={(e) => setFilters({ ...filters, billable: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            >
              <option value="">All</option>
              <option value="true">Billable</option>
              <option value="false">Non-Billable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Entries</p>
          <p className="text-2xl font-semibold">{filteredEntries.length}</p>
        </div>
        <div className="bg-yellow-50 shadow rounded-lg p-4">
          <p className="text-sm text-yellow-700">Pending Approval</p>
          <p className="text-2xl font-semibold text-yellow-800">
            {filteredEntries.filter(e => e.status === 'pending').length}
          </p>
        </div>
        <div className="bg-green-50 shadow rounded-lg p-4">
          <p className="text-sm text-green-700">Approved</p>
          <p className="text-2xl font-semibold text-green-800">
            {filteredEntries.filter(e => e.status === 'approved').length}
          </p>
        </div>
        <div className="bg-blue-50 shadow rounded-lg p-4">
          <p className="text-sm text-blue-700">Total Amount</p>
          <p className="text-2xl font-semibold text-blue-800">
            R{filteredEntries.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    No time entries found. Entries submitted by employees will appear here for approval.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.activityDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getEmployeeName(entry.employeeId)}</div>
                      <div className="text-xs text-gray-500">{getEmployeeEmail(entry.employeeId)}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {getClientName(entry.clientId)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {getServiceName(entry.serviceId)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">{entry.memo || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{entry.duration}h</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">R{entry.rate}/hr</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R{entry.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                        entry.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {entry.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(entry.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(entry.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {entry.status !== 'pending' && (
                        <button
                          onClick={() => handleApprove(entry.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Reset to Pending
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
