import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/layout/Navbar';
import { QuestionForm } from '@/components/questions/QuestionForm';
import { supabase } from '@/lib/supabase';

const AskQuestionPage: NextPage = () => {
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
      router.push('/auth/login?redirect=/questions/ask');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <>
        <Head>
          <title>Ask a Question | NotesBuddy</title>
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
        <title>Ask a Question | NotesBuddy</title>
        <meta name="description" content="Ask a new question on NotesBuddy" />
      </Head>
      
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
          <p className="mt-2 text-gray-600">
            Get help from other students by asking a clear, detailed question.
          </p>
        </div>
        
        <div className="bg-white shadow-sm border rounded-lg p-6">
          <QuestionForm />
        </div>
      </main>
    </>
  );
};

export default AskQuestionPage;