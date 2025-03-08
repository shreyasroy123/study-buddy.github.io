import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

const SignupPage: NextPage = () => {
  const router = useRouter();
  const { redirect } = router.query;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    section: '',
    school_name: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        router.push(typeof redirect === 'string' ? redirect : '/dashboard');
      }
    };
    
    checkUser();
  }, [redirect, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords don't match");
      }
      
      // Create user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile in profiles table
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: formData.full_name,
          email: formData.email,
          grade: formData.grade || null,
          section: formData.section || null,
          school_name: formData.school_name || null,
        });
        
        if (profileError) throw profileError;
        
        // Show success message
        setSuccess(true);
      }
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up | NotesBuddy</title>
        <meta name="description" content="Create a new NotesBuddy account" />
      </Head>
      
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">NotesBuddy</h1>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Create an Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link href={`/auth/login${redirect ? `?redirect=${redirect}` : ''}`} className="text-blue-600 hover:text-blue-500">
                Log in
              </Link>
            </p>
          </div>
          
          {success ? (
            <div className="mt-8 bg-green-50 p-6 rounded-md">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="ml-3 text-lg font-medium text-green-800">Registration successful!</h3>
              </div>
              <div className="mt-4 text-sm text-green-700">
                <p>Please check your email to verify your account. After verification, you'll be able to log in.</p>
              </div>
              <div className="mt-6">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  Go to Log In
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
              
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="full_name" className="sr-only">Full Name</label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="grade" className="sr-only">Grade</label>
                  <input
                    id="grade"
                    name="grade"
                    type="text"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Grade (optional)"
                    value={formData.grade}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="section" className="sr-only">Section</label>
                  <input
                    id="section"
                    name="section"
                    type="text"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Section (optional)"
                    value={formData.section}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="school_name" className="sr-only">School Name</label>
                  <input
                    id="school_name"
                    name="school_name"
                    type="text"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="School Name (optional)"
                    value={formData.school_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default SignupPage;