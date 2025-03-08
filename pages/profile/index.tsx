import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  grade: string;
  section: string;
  school_name: string;
  profile_picture_url: string;
  created_at: string;
}

interface Stats {
  questions_count: number;
  answers_count: number;
  notes_count: number;
}

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({
    questions_count: 0,
    answers_count: 0,
    notes_count: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Check auth status
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login?redirect=/profile');
          return;
        }
        
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        setProfile(profileData);
        
        // Get user stats
        // Questions count
        const { data: questionsData } = await supabase
          .from('questions')
          .select('id')
          .eq('user_id', user.id);
          
                // Answers count
                const { data: answersData } = await supabase
                .from('answers')
                .select('id')
                .eq('user_id', user.id);
                
              // Notes count
              const { data: notesData } = await supabase
                .from('notes')
                .select('id')
                .eq('user_id', user.id);
              
              setStats({
                questions_count: questionsData?.length || 0,
                answers_count: answersData?.length || 0,
                notes_count: notesData?.length || 0
              });
            } catch (error) {
              console.error('Error fetching profile data:', error);
            } finally {
              setLoading(false);
            }
          };
          
          fetchProfileData();
        }, [router]);
      
        if (loading) {
          return (
            <>
              <Head>
                <title>My Profile | NotesBuddy</title>
              </Head>
              <Navbar />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                  <p className="text-gray-500">Loading your profile...</p>
                </div>
              </div>
            </>
          );
        }
        
        if (!profile) return null;
        
        return (
          <>
            <Head>
              <title>My Profile | NotesBuddy</title>
              <meta name="description" content="Your NotesBuddy profile" />
            </Head>
            
            <Navbar />
            
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-16">
                  <div className="flex flex-col items-center">
                    {profile.profile_picture_url ? (
                      <Image
                        src={profile.profile_picture_url}
                        alt={profile.full_name}
                        width={128}
                        height={128}
                        className="rounded-full border-4 border-white"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center">
                        <span className="text-4xl text-blue-600 font-medium">
                          {profile.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h1 className="text-2xl font-bold text-white mt-4">{profile.full_name}</h1>
                    <p className="text-blue-100">{profile.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 border-b">
                  <div className="p-6 text-center border-r border-gray-200">
                    <p className="text-3xl font-bold text-gray-800">{stats.questions_count}</p>
                    <p className="text-sm text-gray-500 uppercase">Questions</p>
                  </div>
                  <div className="p-6 text-center border-r border-gray-200">
                    <p className="text-3xl font-bold text-gray-800">{stats.answers_count}</p>
                    <p className="text-sm text-gray-500 uppercase">Answers</p>
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-3xl font-bold text-gray-800">{stats.notes_count}</p>
                    <p className="text-sm text-gray-500 uppercase">Study Notes</p>
                  </div>
                </div>
                
                <div className="px-8 py-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                          <dd className="text-base text-gray-900">{profile.full_name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="text-base text-gray-900">{profile.email}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                          <dd className="text-base text-gray-900">
                            {profile.phone_number || "Not provided"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <dl className="space-y-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Grade</dt>
                          <dd className="text-base text-gray-900">{profile.grade || "Not provided"}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Section</dt>
                          <dd className="text-base text-gray-900">{profile.section || "Not provided"}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">School Name</dt>
                          <dd className="text-base text-gray-900">{profile.school_name || "Not provided"}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
                
                <div className="px-8 py-6 bg-gray-50 border-t flex justify-end">
                  <Link
                    href="/profile/edit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </main>
          </>
        );
      };
      
      export default ProfilePage;