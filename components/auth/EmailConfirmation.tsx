import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const EmailConfirmation = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const { access_token, refresh_token, type } = router.query;
    
    if (!access_token || !refresh_token || !type) {
      return;
    }

    const confirmEmail = async () => {
      try {
        setLoading(true);
        
        const { error } = await supabase.auth.setSession({
          access_token: access_token as string,
          refresh_token: refresh_token as string
        });
        
        if (error) throw error;
        
        setConfirmed(true);
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } catch (err) {
        console.error('Error confirming email:', err);
        setError(err instanceof Error ? err.message : 'An error occurred during email confirmation');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [router]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Email Confirmation</h1>
      
      {loading && <p className="text-center">Verifying your email...</p>}
      
      {error && (
        <div className="bg-red-100 p-4 rounded-md mb-4">
          <p className="text-red-700">{error}</p>
          <p className="mt-2">
            Please try again or{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              request a new confirmation link
            </Link>
          </p>
        </div>
      )}
      
      {confirmed && (
        <div className="bg-green-100 p-4 rounded-md">
          <p className="text-green-700 font-medium text-center">
            Your email has been successfully confirmed!
          </p>
          <p className="text-center mt-2">
            Redirecting to login page in a few seconds...
          </p>
          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Click here if you're not redirected automatically
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};