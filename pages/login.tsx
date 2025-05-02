import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const [loginType, setLoginType] = useState<'admin' | 'client'>('client');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn(
        loginType === 'admin' ? 'admin-credentials' : 'client-credentials',
        {
          redirect: false,
          [loginType === 'admin' ? 'username' : 'email']: loginType === 'admin' ? username : email,
          password,
        }
      );

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        // Redirect based on user type
        router.push(loginType === 'admin' ? '/dashboard' : '/client/dashboard');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        <div className="flex border rounded overflow-hidden mt-4">
          <button
            type="button"
            className={`w-1/2 py-2 text-sm font-medium ${
              loginType === 'client'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700'
            }`}
            onClick={() => setLoginType('client')}
          >
            Client
          </button>
          <button
            type="button"
            className={`w-1/2 py-2 text-sm font-medium ${
              loginType === 'admin'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700'
            }`}
            onClick={() => setLoginType('admin')}
          >
            Admin
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {loginType === 'admin' ? (
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {loginType === 'client' && (
          <div className="text-sm text-center mt-4">
            <p>
              Don't have an account?{' '}
              <Link href="/register" className="text-indigo-600 hover:text-indigo-500">
                Register now
              </Link>
            </p>
          </div>
        )}

        <div className="text-sm text-center mt-4">
          <Link href="/" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}