import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  grade: string;
  section: string;
  school_name: string;
  profile_picture_url: string;
}

interface RecentQuestion {
  id: string;
  title: string;
  created_at: string;
  is_solved: boolean;
  answer_count: number;
}

interface RecentNote {
  id: string;
  title: string;
  subject: string;
  created_at: string;
}

interface RecentAnnouncement {
  id: string;
  title: string;
  is_important: boolean;
  created_at: string;
}

const Dashboard: NextPage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentQuestions, setRecentQuestions] = useState<RecentQuestion[]>([]);
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [announcements, setAnnouncements] = useState<RecentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check auth status
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login?redirect=/dashboard');
          return;
        }
        
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        setProfile(profileData);
        
        // Get recent questions
        const { data: questionsData } = await supabase
          .from('questions')
          .select(`
            id,
            title,
            created_at,
            is_solved,
            answers (count)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        setRecentQuestions(
          questionsData?.map(q => ({
            ...q,
            answer_count: q.answers[0].count
          })) || []
        );
        
        // Get recent notes
        const { data: notesData } = await supabase
          .from('notes')
          .select('id, title, subject, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
          
        setRecentNotes(notesData || []);
        
        // Get recent announcements
        const { data: announcementsData } = await supabase
          .from('announcements')
          .select('id, title, is_important, created_at')
          .order('is_important', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(3);
          
        setAnnouncements(announcementsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Dashboard | NotesBuddy</title>
        </Head>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>Dashboard | NotesBuddy</title>
        <meta name="description" content="Your NotesBuddy dashboard" />
      </Head>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="bg-white shadow-sm border rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              {profile?.profile_picture_url ? (
                <Image
                  src={profile.profile_picture_url}
                  alt={profile.full_name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl text-blue-600 font-medium">
                    {profile?.full_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name}!
              </h1>
              <p className="text-gray-600">
                {profile?.grade} {profile?.section} | {profile?.school_name}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick actions */}
          <div className="bg-white shadow-sm border rounded-lg p-6 col-span-1">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link 
                href="/questions/ask" 
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ask a Question
              </Link>
              <Link 
                href="/notes/share" 
                className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
              >
                Share Study Notes
              </Link>
              <Link 
                href="/profile" 
                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                View Profile
              </Link>
            </div>
          </div>
          
          {/* Recent questions and notes */}
          <div className="col-span-1 md:col-span-2 space-y-8">
            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="bg-white shadow-sm border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Recent Announcements</h2>
                  <Link href="/announcements" className="text-sm text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <Link 
                      key={announcement.id} 
                      href={`/announcements/${announcement.id}`}
                      className={`block p-4 rounded-lg border ${
                        announcement.is_important 
                          ? 'bg-red-50 border-red-200' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className={`font-medium ${announcement.is_important ? 'text-red-800' : 'text-gray-900'}`}>
                          {announcement.title}
                        </h3>
                        {announcement.is_important && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Important
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Posted {formatDistanceToNow(new Date(announcement.created_at))} ago
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent questions */}
            <div className="bg-white shadow-sm border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Questions</h2>
                <Link href="/questions" className="text-sm text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
              
              {recentQuestions.length > 0 ? (
                <div className="space-y-4">
                  {recentQuestions.map((question) => (
                    <Link
                      key={question.id}
                      href={`/questions/${question.id}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <h3 className="font-medium text-gray-900">{question.title}</h3>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>{formatDistanceToNow(new Date(question.created_at))} ago</span>
                        <span className="mx-2">•</span>
                        <span>{question.answer_count} {question.answer_count === 1 ? 'answer' : 'answers'}</span>
                        {question.is_solved && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-green-600">Solved</span>
                          </>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No questions yet</p>
              )}
            </div>
            
            {/* Recent notes */}
            <div className="bg-white shadow-sm border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Study Notes</h2>
                <Link href="/notes" className="text-sm text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
              
              {recentNotes.length > 0 ? (
                <div className="space-y-4">
                  {recentNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notes/${note.id}`}
                      className="block p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <h3 className="font-medium text-gray-900">{note.title}</h3>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>{note.subject}</span>
                        <span className="mx-2">•</span>
                        <span>Shared {formatDistanceToNow(new Date(note.created_at))} ago</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No study notes yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;