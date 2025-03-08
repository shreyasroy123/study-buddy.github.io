import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_important: boolean;
  created_at: string;
  author: {
    full_name: string;
    profile_picture_url: string;
  };
}

const AnnouncementsPage: NextPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        
        const { data: announcementsData, error: announcementsError } = await supabase
          .from('announcements')
          .select(`
            id,
            title,
            content,
            is_important,
            created_at,
            profiles!announcements_user_id_fkey (
              full_name,
              profile_picture_url
            )
          `)
          .order('is_important', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (announcementsError) throw announcementsError;
        
        const formattedAnnouncements = announcementsData?.map(item => ({
            id: item.id,
            title: item.title,
            content: item.content,
            is_important: item.is_important,
            created_at: item.created_at,
            author: item.profiles
          }));
          
          setAnnouncements(formattedAnnouncements || []);
          
          // Check if current user is admin
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', user.id)
              .single();
              
            if (userData?.email && userData.email.endsWith('@admin.notesbuddy.com')) {
              setIsAdmin(true);
            }
          }
        } catch (err) {
          console.error('Error fetching announcements:', err);
          setError('Failed to load announcements. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchAnnouncements();
    }, []);
    
    return (
      <>
        <Head>
          <title>Announcements | NotesBuddy</title>
          <meta name="description" content="Stay updated with the latest announcements on NotesBuddy" />
        </Head>
        
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            {isAdmin && (
              <a href="/announcements/create" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Create Announcement
              </a>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white shadow-sm border rounded-lg p-5 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
              <p className="text-gray-500">
                Check back later for updates and important announcements
              </p>
            </div>
          )}
        </main>
      </>
    );
  };
  
  export default AnnouncementsPage;