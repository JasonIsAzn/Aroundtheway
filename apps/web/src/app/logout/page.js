"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth.client';
import DynamicNav from '@/components/DynamicNav';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <DynamicNav />
      <main className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-light tracking-wide uppercase text-gray-900">
            Signing Out
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we sign you out...
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </main>
    </div>
  );
}