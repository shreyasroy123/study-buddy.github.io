import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/layout/Navbar';
import { NoteForm } from '@/components/notes/NoteForm';
import { supabase } from '@/lib/supabase';

const ShareNotePage: NextPage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect unauthenticated users to login
      router.push('/auth/login?redirect=/notes/share');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <>
        <Head>
          <title>Share Notes | NotesBuddy</title>
        </Head>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            <p className="text-gray-500">Checking authentication...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Share Notes | NotesBuddy</title>
        <meta name="description" content="Share your study notes with other students on NotesBuddy" />
      </Head>
      
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Share Study Notes</h1>
          <p className="mt-2 text-gray-600">
            Help other students by sharing your notes, summaries, diagrams, or other study materials.
          </p>
        </div>
        
        <div className="bg-white shadow-sm border rounded-lg p-6">
          <NoteForm />
        </div>
      </main>
    </>
  );
};

export default ShareNotePage;