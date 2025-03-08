import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
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
}

const EditProfilePage: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [profileImgUrl, setProfileImgUrl] = useState<string>('');
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    full_name: '',
    email: '',
    phone_number: '',
    grade: '',
    section: '',
    school_name: '',
    profile_picture_url: '',
  });
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check auth status
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login?redirect=/profile/edit');
          return;
        }
        
        // Get user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setFormData(data);
        if (data.profile_picture_url) {
          setProfileImgUrl(data.profile_picture_url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size exceeds 5MB limit');
        return;
      }
      
      setProfileImg(file);
      setProfileImgUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    
    try {
      // Upload new profile picture if changed
      if (profileImg) {
        const fileExt = profileImg.name.split('.').pop();
        const fileName = `${formData.id}-${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, profileImg);
        
        if (uploadError) throw uploadError;
        
        // Get public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);
        
        // Update profile picture URL in formData
        formData.profile_picture_url = publicUrl;
      }
      
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          grade: formData.grade,
          section: formData.section,
          school_name: formData.school_name,
          profile_picture_url: formData.profile_picture_url,
        })
        .eq('id', formData.id);
      
      if (updateError) throw updateError;
      
      // Redirect to profile page
      router.push('/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Edit Profile | NotesBuddy</title>
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
  
  return (
    <>
      <Head>
        <title>Edit Profile | NotesBuddy</title>
        <meta name="description" content="Edit your NotesBuddy profile" />
      </Head>
      
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="mt-2 text-gray-600">
            Update your profile information and settings.
          </p>
        </div>
        
        <div className="bg-white shadow-sm border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-100 p-3 text-red-700 rounded">{error}</div>}
            
            <div className="flex justify-center">
              <div className="relative">
                {profileImgUrl ? (
                  <Image
                    src={profileImgUrl}
                    alt={formData.full_name}
                    width={128}
                    height={128}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-4xl text-blue-600 font-medium">
                      {formData.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    id="profile-picture"
                    name="profile-picture"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            
            <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (Read-only)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                readOnly
                className="w-full px-3 py-2 border rounded-md bg-gray-50"
                value={formData.email}
              />
            </div>
            
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.phone_number || ''}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <input
                  id="grade"
                  name="grade"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.grade || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <input
                  id="section"
                  name="section"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.section || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="school_name" className="block text-sm font-medium text-gray-700 mb-1">
                  School Name
                </label>
                <input
                  id="school_name"
                  name="school_name"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.school_name || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default EditProfilePage;