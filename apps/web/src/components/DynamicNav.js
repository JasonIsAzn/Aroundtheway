"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMe } from '@/lib/auth.client';

export default function DynamicNav() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.log('Not logged in');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Don't show anything while checking auth status
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-light tracking-wide uppercase text-gray-900">
                Aroundtheway
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user ? (
                <>
                  <Link
                    href="/admin"
                    className="inline-flex items-center px-1 pt-1 text-sm font-light uppercase tracking-wide text-gray-500 hover:text-gray-700"
                  >
                    Admin Index
                  </Link>
                  <Link
                    href="/admin/debug"
                    className="inline-flex items-center px-1 pt-1 text-sm font-light uppercase tracking-wide text-gray-500 hover:text-gray-700"
                  >
                    Debug Tools
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await logout();
                        window.location.href = '/login';
                      } catch (error) {
                        console.error('Logout failed:', error);
                      }
                    }}
                    className="inline-flex items-center px-1 pt-1 text-sm font-light uppercase tracking-wide text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center px-1 pt-1 text-sm font-light uppercase tracking-wide text-gray-500 hover:text-gray-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}