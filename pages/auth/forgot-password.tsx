import { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ForgotPasswordPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccess(true);
    } catch (err) {
      console.error('Error sending reset password email:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while sending the reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password | NotesBuddy</title>
        <meta name="description" content="Reset your NotesBuddy account password" />
      </Head>
      
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">NotesBuddy</h1>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          {success ? (
            <div className="mt-8 bg-green-50 p-6 rounded-md">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="ml-3 text-lg font-medium text-green-800">Email sent!</h3>
              </div>
              <div className="mt-4 text-sm text-green-700">
                <p>If an account exists with the email you provided, you will receive a password reset link shortly.</p>
                <p className="mt-2">Check your email and click on the link to reset your password.</p>
              </div>
              <div className="mt-6">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 p-3 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
              
              <div className="text-center">
                <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-500">
                  Return to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default ForgotPasswordPage;