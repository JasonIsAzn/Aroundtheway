"use client";

import { useState, useEffect } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-8">
          <div className="pb-5 border-b border-gray-200">
            <h3 className="text-2xl font-light tracking-wide uppercase text-gray-900">User Management</h3>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="ml-3 text-sm text-gray-600">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-8">
          <div className="pb-5 border-b border-gray-200">
            <h3 className="text-2xl font-light tracking-wide uppercase text-gray-900">User Management</h3>
          </div>
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-light uppercase tracking-wide text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 space-y-8">
        {/* Page header */}
        <div className="pb-5 border-b border-gray-200">
          <h3 className="text-2xl font-light tracking-wide uppercase">User Management</h3>
          <p className="mt-2 text-sm text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white border border-gray-200 overflow-hidden rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Total Users</dt>
                  <dd className="text-2xl font-light text-gray-900">{users.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-500"
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Admins</dt>
                  <dd className="text-2xl font-light text-gray-900"
                    {users.filter(user => user.isAdmin).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-500"
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">Google OAuth</dt>
                  <dd className="text-2xl font-light text-gray-900"
                    {users.filter(user => user.googleSub).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-200 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg tracking-wide uppercase font-light text-gray-900">Users</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            A list of all users including their email, role, and registration date.
          </p>
        </div>
        <ul className="divide-y divide-border">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                <span className="text-xs uppercase tracking-wide text-gray-900">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-xs uppercase tracking-wide text-black">{user.email}</p>
                        {user.isAdmin && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs uppercase tracking-wide bg-black text-white">
                            Admin
                          </span>
                        )}
                        {user.googleSub && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs uppercase tracking-wide bg-gray-900 text-white">
                            Google
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="truncate max-w-xs">{user.address}</p>
                      </div>
                    </div>
                  </div>
                    <div className="flex items-center text-sm text-gray-600">
                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p>Joined {formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={async () => {
            try {
              const response = await fetch('/api/admin/users/export', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              if (!response.ok) throw new Error('Failed to export users');
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'users-export.csv';
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error('Failed to export users:', err);
              setError('Failed to export users');
            }
          }}
className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm uppercase tracking-wider font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Export Users
        </button>
        <button
          type="button"
          onClick={async () => {
            const email = prompt('Enter user email:');
            const password = prompt('Enter user password:');
            if (!email || !password) return;
            
            try {
              const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
              });
              
              if (!response.ok) throw new Error('Failed to create user');
              
              // Refresh user list
              const updatedResponse = await fetch('/api/admin/users');
              if (!updatedResponse.ok) throw new Error('Failed to fetch users');
              const updatedData = await updatedResponse.json();
              setUsers(updatedData);
            } catch (err) {
              console.error('Failed to create user:', err);
              setError('Failed to create user');
            }
          }}
className="inline-flex items-center px-4 py-2 border border-transparent text-sm uppercase tracking-wider font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
        >
          Add User
        </button>
      </div>
    </div>
  );
}