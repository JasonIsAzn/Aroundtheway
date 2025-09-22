"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DynamicNav from '@/components/DynamicNav';

export default function DebugPage() {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkDbStatus();
  }, []);

  const checkDbStatus = async () => {
    try {
      const response = await fetch('/api/status/db');
      const data = await response.json();
      setDbStatus(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to check database status');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <DynamicNav />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-5">
            <h1 className="text-2xl font-light tracking-wide uppercase text-gray-900">
              Debug Tools
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Testing and debugging tools for development
            </p>
          </div>

          {/* Debug Links Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/users"
              className="group relative bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-light uppercase tracking-wide text-gray-900">User Index</h2>
                  <p className="mt-1 text-sm text-gray-500">View and manage user accounts</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/image-upload-test"
              className="group relative bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-light uppercase tracking-wide text-gray-900">Image Upload Test</h2>
                  <p className="mt-1 text-sm text-gray-500">Test image upload functionality</p>
                </div>
              </div>
            </Link>

            <div className="group relative bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-light uppercase tracking-wide text-gray-900">Database Status</h2>
                  <div className="mt-1">
                    {loading ? (
                      <p className="text-sm text-gray-500">Checking status...</p>
                    ) : error ? (
                      <p className="text-sm text-red-600">{error}</p>
                    ) : (
                      <p className="text-sm text-green-600">Database is {dbStatus?.status || 'unknown'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}