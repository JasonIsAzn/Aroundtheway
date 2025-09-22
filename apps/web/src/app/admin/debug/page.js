"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DebugTools() {
  const [dbStatus, setDbStatus] = useState('Loading...');

  useEffect(() => {
    // Fetch database status
    const checkDbStatus = async () => {
      try {
        const response = await fetch('/api/status/db');
        const data = await response.json();
        setDbStatus(data.status || 'Error');
      } catch (error) {
        console.error('Failed to fetch DB status:', error);
        setDbStatus('Error');
      }
    };

    checkDbStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkDbStatus, 30000);
    return () => clearInterval(interval);
  }, []);

const debugLinks = [
    {
      title: 'Image Upload Test',
      description: 'Test single and multiple image uploads with Supabase Storage',
      href: '/test-upload.html',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      href: '/admin/users',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-2xl font-bold leading-6 text-gray-900">Debug Tools</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Testing and debugging tools for administrators
        </p>
      </div>

      {/* Database Status */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Database Status
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Current database connection status</p>
          </div>
          <div className="mt-3">
            <div className={`inline-flex items-center px-4 py-2 rounded-md ${
              dbStatus === 'Connected' 
                ? 'bg-green-100 text-green-800'
                : dbStatus === 'Loading...'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              <span className={`h-2 w-2 rounded-full mr-2 ${
                dbStatus === 'Connected'
                  ? 'bg-green-500'
                  : dbStatus === 'Loading...'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}></span>
              {dbStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Tools Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {debugLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0 text-gray-400">
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">{link.title}</p>
              <p className="text-sm text-gray-500 truncate">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>

{/* Additional Debug Info */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            System Information
          </h3>
          <div className="mt-4">
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Environment
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {process.env.NODE_ENV}
                </dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Next.js Version
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {process.env.NEXT_VERSION || 'Unknown'}
                </dd>
              </div>
              <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  API Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a href="/api/status/db" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    Check API Status →
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}