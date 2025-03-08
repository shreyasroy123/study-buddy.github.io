import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

interface AnnouncementPageProps {
  announcement: {
    id: string;
    title: string;
    content: string;
    is_important: boolean;
    created_at: string;
    updated_at: string;
    author: {
      full_name: string;
      profile_picture_url: string;
    };
  };
}

const AnnouncementPage: NextPage<AnnouncementPageProps> = ({ announcement }) => {
  // Helper function to sanitize and render markdown content
  const renderMarkdown = (content: string) => {
    const rawHtml = marked(content);
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    return { __html: sanitizedHtml };
  };

  return (
    <>
      <Head>
        <title>{announcement.title} | NotesBuddy</title>
        <meta name="description" content={`${announcement.content.substring(0, 160)}...`} />
      </Head>
      
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`bg-white shadow-md rounded-lg overflow-hidden ${announcement.is_important ? 'border border-red-400' : ''}`}>
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{announcement.title}</h1>
              
              {announcement.is_important && (
                <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-medium">
                  Important
                </span>
              )}
            </div>
            
            <div className="mt-6 prose max-w-none text-gray-700" dangerouslySetInnerHTML={renderMarkdown(announcement.content)} />
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center">
              {announcement.author.profile_picture_url ? (
                <Image
                  src={announcement.author.profile_picture_url}
                  alt={announcement.author.full_name}
                  width={32}
                  height={32}
                  className="rounded-full mr-3"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-sm text-blue-600 font-medium">
                    {announcement.author.full_name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Posted by {announcement.author.full_name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(announcement.created_at))} ago
                  {announcement.created_at !== announcement.updated_at && 
                    ` (Updated ${formatDistanceToNow(new Date(announcement.updated_at))} ago)`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a href="/announcements" className="text-blue-600 hover:underline">
            ← Back to announcements
          </a>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};
  
  try {
    // Fetch announcement with author details
    const { data: announcementData, error: announcementError } = await supabase
      .from('announcements')
      .select(`
        id,
        title,
        content,
        is_important,
        created_at,
        updated_at,
        profiles!announcements_user_id_fkey (
          full_name,
          profile_picture_url
        )
      `)
      .eq('id', id)
      .single();
    
    if (announcementError) throw announcementError;
    
    return {
      props: {
        announcement: {
          ...announcementData,
          author: announcementData.profiles
        }
      }
    };
  } catch (error) {
    console.error('Error fetching announcement data:', error);
    return {
      notFound: true
    };
  }
};

export default AnnouncementPage;