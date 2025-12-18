/**
 * My Timesheet Page Component
 * Validates: Requirements 1.1-1.8, 2.1-2.4, 3.1-3.4
 */
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import type { TimeEntry, Client, Service } from '../lib/types';

export function TimesheetPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'administrator';
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    clientId: '',
    billable: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, clientsRes, servicesRes] = await Promise.all([
        api.get('/time-entries'),
        api.get('/clients'),
        api.get('/services'),
      ]);
      setEntries(entriesRes.data || []);
      setClients(clientsRes.data?.data || []);
      setServices(servicesRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = (entry: TimeEntry) => {
    const createdAt = new Date(entry.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.delete(`/time-entries/${entryId}`);
      setEntries(entries.filter(e => e.id !== entryId));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      alert('Failed to delete entry. You can only delete entries within 24 hours.');
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || clientId;
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || serviceId;
  };

  const filteredEntries = entries.filter(entry => {
    if (filters.clientId && entry.clientId !== filters.clientId) return false;
    if (filters.billable === 'true' && !entry.billable) return false;
    if (filters.billable === 'false' && entry.billable) return false;
    return true;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Timesheet</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Time Entry
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
            <label className="block text-sm font-medium text-gray-700">Billable</label>
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

      {/* Summary - Amount only visible to admin */}
      <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Entries</p>
          <p className="text-2xl font-semibold">{filteredEntries.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Hours</p>
          <p className="text-2xl font-semibold">{filteredEntries.reduce((sum, e) => sum + e.duration, 0).toFixed(1)}h</p>
        </div>
        {isAdmin && (
          <div className="bg-blue-50 shadow rounded-lg p-4">
            <p className="text-sm text-blue-700">Total Amount</p>
            <p className="text-2xl font-semibold text-blue-800">R{filteredEntries.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Time Entries Table - Amount column only visible to admin */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-6 py-8 text-center text-gray-500">
                    No time entries found. Click "Add Time Entry" to create one.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.activityDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {getClientName(entry.clientId)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {getServiceName(entry.serviceId)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">{entry.memo || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{entry.duration}h</td>
                    {isAdmin && (
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R{entry.amount.toFixed(2)}
                      </td>
                    )}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                        entry.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {canEdit(entry) && entry.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
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

      {/* Time Entry Form Modal */}
      {showForm && (
        <TimeEntryForm
          clients={clients}
          services={services}
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

interface TimeEntryFormProps {
  clients: Client[];
  services: Service[];
  onClose: () => void;
  onSave: () => void;
}

function TimeEntryForm({ clients: initialClients, services: initialServices, onClose, onSave }: TimeEntryFormProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'administrator';
  const [clients, setClients] = useState(initialClients);
  const [services, setServices] = useState(initialServices);
  const [formData, setFormData] = useState({
    activityDate: new Date().toISOString().split('T')[0],
    clientId: '',
    serviceId: '',
    memo: '',
    rate: '',
    duration: '',
    billable: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // For adding new client/service
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewService, setShowNewService] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newServiceName, setNewServiceName] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  const amount = formData.billable
    ? (parseFloat(formData.rate) || 0) * (parseFloat(formData.duration) || 0)
    : 0;

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const handleAddNewClient = async () => {
    if (!newClientName.trim()) return;
    try {
      const res = await api.post('/clients', { 
        name: newClientName.trim(),
        contactEmail: `contact@${newClientName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      });
      const newClient = res.data?.data || { id: `new-${Date.now()}`, name: newClientName.trim() };
      setClients([...clients, newClient]);
      setFormData({ ...formData, clientId: newClient.id });
      setNewClientName('');
      setShowNewClient(false);
      setClientSearch('');
    } catch (err) {
      console.error('Failed to add client:', err);
      // Still add locally for demo
      const newClient = { id: `new-${Date.now()}`, name: newClientName.trim(), contactEmail: '', contactPhone: '', address: '', active: true };
      setClients([...clients, newClient]);
      setFormData({ ...formData, clientId: newClient.id });
      setNewClientName('');
      setShowNewClient(false);
    }
  };

  const handleAddNewService = async () => {
    if (!newServiceName.trim()) return;
    try {
      const res = await api.post('/services', { name: newServiceName.trim() });
      const newService = res.data?.data || { id: `new-${Date.now()}`, name: newServiceName.trim() };
      setServices([...services, newService]);
      setFormData({ ...formData, serviceId: newService.id });
      setNewServiceName('');
      setShowNewService(false);
      setServiceSearch('');
    } catch (err) {
      console.error('Failed to add service:', err);
      // Still add locally for demo
      const newService = { id: `new-${Date.now()}`, name: newServiceName.trim(), description: '', active: true };
      setServices([...services, newService]);
      setFormData({ ...formData, serviceId: newService.id });
      setNewServiceName('');
      setShowNewService(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Use default rate of 150 for employees (admin sets actual rate)
      const rate = isAdmin ? parseFloat(formData.rate) : 150;
      
      await api.post('/time-entries', {
        activityDate: formData.activityDate,
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        memo: formData.memo,
        rate: rate,
        duration: parseFloat(formData.duration),
        billable: formData.billable,
      });
      onSave();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create time entry');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);
  const selectedService = services.find(s => s.id === formData.serviceId);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add Time Entry</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date *</label>
            <input
              type="date"
              value={formData.activityDate}
              onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              required
            />
          </div>

          {/* Client Selection with Search and Add New */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Client *</label>
            {selectedClient ? (
              <div className="mt-1 flex items-center justify-between bg-blue-50 p-2 rounded-md border">
                <span className="text-sm text-blue-900">{selectedClient.name}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, clientId: '' })}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                <input
                  type="text"
                  placeholder="Search or type client name..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
                <div className="max-h-32 overflow-y-auto border rounded-md">
                  {filteredClients.map(client => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, clientId: client.id });
                        setClientSearch('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      {client.name}
                    </button>
                  ))}
                  {clientSearch && !filteredClients.some(c => c.name.toLowerCase() === clientSearch.toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewClientName(clientSearch);
                        setShowNewClient(true);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm text-green-700 border-t"
                    >
                      + Add "{clientSearch}" as new client
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Add New Client Modal */}
          {showNewClient && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-2">Add New Client</p>
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Client name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border p-2 mb-2"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddNewClient}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Add Client
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewClient(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Service Selection with Search and Add New */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Service/Product *</label>
            {selectedService ? (
              <div className="mt-1 flex items-center justify-between bg-blue-50 p-2 rounded-md border">
                <span className="text-sm text-blue-900">{selectedService.name}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, serviceId: '' })}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                <input
                  type="text"
                  placeholder="Search or type service name..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                />
                <div className="max-h-32 overflow-y-auto border rounded-md">
                  {filteredServices.map(service => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, serviceId: service.id });
                        setServiceSearch('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      {service.name}
                    </button>
                  ))}
                  {serviceSearch && !filteredServices.some(s => s.name.toLowerCase() === serviceSearch.toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewServiceName(serviceSearch);
                        setShowNewService(true);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-green-50 text-sm text-green-700 border-t"
                    >
                      + Add "{serviceSearch}" as new service
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Add New Service Modal */}
          {showNewService && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-2">Add New Service</p>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Service name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm border p-2 mb-2"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddNewService}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Add Service
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewService(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              rows={3}
              placeholder="Describe the work performed..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            />
          </div>

          {/* Duration field - always visible */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (hrs) *</label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="1.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              required
            />
          </div>

          {/* Rate field - only visible to admin */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate (R/hr) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="150.00"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                required
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="billable"
              checked={formData.billable}
              onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="billable" className="ml-2 block text-sm text-gray-900">Billable</label>
          </div>

          {/* Amount preview - only visible to admin */}
          {isAdmin && (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                Total Amount: <span className="font-bold text-lg text-blue-900">R{amount.toFixed(2)}</span>
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Submit Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
