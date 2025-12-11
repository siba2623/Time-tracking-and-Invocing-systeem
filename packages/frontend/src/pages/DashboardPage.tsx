/**
 * Dashboard Page Component
 * Validates: Requirements 4.1, 4.2, 4.3
 */
import { useAuthStore } from '../lib/auth-store';

export function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'administrator';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Hours Summary Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xl">⏱</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Hours This Week
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">0.0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Billable Hours Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xl">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Billable Hours
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">0.0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Entries Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-yellow-500 flex items-center justify-center">
                  <span className="text-white text-xl">📋</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Entries
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Hours by Employee</h3>
              <p className="mt-2 text-sm text-gray-400">No data available</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Upcoming Invoices</h3>
              <p className="mt-2 text-sm text-gray-400">No invoices pending</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
