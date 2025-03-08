import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase';

const CreateAnnouncementPage: NextPage = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isImportant: false
  });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Check if current user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login?redirect=/announcements/create');
          return;
        }
        
        const { data: userData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();
          
        if (userData?.email && userData.email.endsWith('@admin.notesbuddy.com')) {
          setIsAdmin(true);
        } else {
          // Redirect non-admin users
          router.push('/announcements');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('You must be logged in to create an announcement');
      
      // Create announcement
      const { error: announcementError } = await supabase
        .from('announcements')
        .insert({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          is_important: formData.isImportant,
        });
      
      if (announcementError) throw announcementError;
      
      // Redirect to announcements page
      router.push('/announcements');
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Create Announcement | NotesBuddy</title>
        </Head>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            <p className="text-gray-500">Checking permissions...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return null; // Router will handle redirect
  }

  return (
    <>
      <Head>
        <title>Create Announcement | NotesBuddy</title>
        <meta name="description" content="Create a new announcement for NotesBuddy" />
      </Head>
      
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Announcement</h1>
          <p className="mt-2 text-gray-600">
            Create a new announcement to share important information with all users.
          </p>
        </div>
        
        <div className="bg-white shadow-sm border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-100 p-3 text-red-700 rounded">{error}</div>}
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={10}
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.content}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                You can use markdown for formatting.
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                id="isImportant"
                name="isImportant"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={formData.isImportant}
                onChange={handleChange}
              />
              <label htmlFor="isImportant" className="ml-2 block text-sm text-gray-900">
                Mark as important
              </label>
            </div>
            
            <div className="flex justify-end">
            <button
                type="button"
                onClick={() => router.push('/announcements')}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Announcement'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default CreateAnnouncementPage;