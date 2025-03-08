import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Redirect to dashboard after login
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 p-3 text-red-700 rounded">{error}</div>}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 border rounded-md"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-3 py-2 border rounded-md"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex justify-end">
        <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </div>
      
      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
      
      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  );
};