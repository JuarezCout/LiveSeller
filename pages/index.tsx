import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect based on user role
  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role === 'admin') {
        router.push('/dashboard');
      } else if (session?.user?.role === 'client') {
        router.push('/client/dashboard');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            WhatsApp Sales Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your live-streamed product sales with ease
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Login
          </Link>
          <Link href="/register" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Register as Client
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Streamlined e-commerce for WhatsApp live sales
          </p>
        </div>
      </div>
    </div>
  );
}