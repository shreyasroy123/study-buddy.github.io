import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { useRouter } from 'next/router';

interface Question {
  id: string;
  title: string;
  content: string;
  created_at: string;
  view_count: number;
  is_solved: boolean;
  author: {
    full_name: string;
    grade: string;
    section: string;
    school_name: string;
    profile_picture_url: string;
  };
  answer_count: number;
}

const QuestionsPage: NextPage = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { filter = 'latest' } = router.query;
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('questions')
          .select(`
            id,
            title,
            content,
            created_at,
            view_count,
            is_solved,
            profiles!questions_user_id_fkey (
              full_name,
              grade,
              section,
              school_name,
              profile_picture_url
            ),
            answers (count)
          `)
          .order('created_at', { ascending: false });
          
        if (filter === 'unsolved') {
          query = query.eq('is_solved', false);
        } else if (filter === 'solved') {
          query = query.eq('is_solved', true);
        } else if (filter === 'popular') {
          query = query.order('view_count', { ascending: false });
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        const formattedQuestions = data?.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          created_at: item.created_at,
          view_count: item.view_count,
          is_solved: item.is_solved,
          author: item.profiles,
          answer_count: item.answers ? item.answers.length : 0
        }));
        
        setQuestions(formattedQuestions || []);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [filter]);
  
  return (
    <>
      <Head>
        <title>Questions & Doubts | NotesBuddy</title>
        <meta name="description" content="Ask and answer questions on NotesBuddy" />
      </Head>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Questions & Doubts</h1>
          <Link
            href="/questions/ask"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ask a Question
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="flex items-center p-4 border-b">
            <span className="font-medium mr-4">Filter by:</span>
            <Link
              href="/questions?filter=latest"
              className={`px-3 py-1 rounded-md ${
                filter === 'latest' || !filter
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Latest
            </Link>
            <Link
                            href="/questions?filter=popular"
                            className={`px-3 py-1 rounded-md ml-2 ${
                              filter === 'popular'
                                ? 'bg-blue-100 text-blue-800'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Most Popular
                          </Link>
                          <Link
                            href="/questions?filter=unsolved"
                            className={`px-3 py-1 rounded-md ml-2 ${
                              filter === 'unsolved'
                                ? 'bg-blue-100 text-blue-800'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Unsolved
                          </Link>
                          <Link
                            href="/questions?filter=solved"
                            className={`px-3 py-1 rounded-md ml-2 ${
                              filter === 'solved'
                                ? 'bg-blue-100 text-blue-800'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Solved
                          </Link>
                        </div>
                      </div>
                      
                      {loading ? (
                        <div className="space-y-4">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white shadow-sm border rounded-lg p-4 animate-pulse">
                              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/3 mt-4"></div>
                            </div>
                          ))}
                        </div>
                      ) : error ? (
                        <div className="bg-red-50 p-4 rounded-md">
                          <p className="text-red-700">{error}</p>
                        </div>
                      ) : questions.length > 0 ? (
                        <div className="space-y-4">
                          {questions.map((question) => (
                            <QuestionCard key={question.id} question={question} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                          <p className="text-gray-500 mb-6">Be the first to ask a question!</p>
                          <Link
                            href="/questions/ask"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Ask a Question
                          </Link>
                        </div>
                      )}
                    </main>
                  </>
                );
              };
              
              export default QuestionsPage;