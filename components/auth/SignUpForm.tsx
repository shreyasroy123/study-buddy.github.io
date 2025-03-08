import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

export const SignUpForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    grade: '',
    section: '',
    schoolName: '',
    profilePicture: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === 'profilePicture' && files && files.length > 0) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Profile picture must be less than 5MB');
        return;
      }
      setFormData({ ...formData, profilePicture: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validatePassword = (password: string): boolean => {
    // Password must contain at least one letter, one number, and one special character
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!validatePassword(formData.password)) {
        throw new Error('Password must contain at least one letter, one number, and one special character, and be at least 8 characters long');
      }
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            full_name: formData.fullName,
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData?.user) {
        // Upload profile picture if provided
        let profilePictureUrl = null;
        
        if (formData.profilePicture) {
          const fileExt = formData.profilePicture.name.split('.').pop();
          const fileName = `${authData.user.id}-${Math.random()}.${fileExt}`;
          
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, formData.profilePicture);
            
          if (uploadError) throw uploadError;
          
          profilePictureUrl = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName).data.publicUrl;
        }
        
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: formData.fullName,
            email: formData.email,
            phone_number: formData.phone,
            grade: formData.grade,
            section: formData.section,
            school_name: formData.schoolName,
            profile_picture_url: profilePictureUrl,
          });
          
        if (profileError) throw profileError;
        
        // Redirect to confirmation instructions page
        router.push('/auth/check-email');
      }
    } catch (err) {
      console.error('Error during sign up:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 p-3 text-red-700 rounded">{error}</div>}
      
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          className="w-full px-3 py-2 border rounded-md"
          value={formData.fullName}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 border rounded-md"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-3 py-2 border rounded-md"
          value={formData.password}
          onChange={handleChange}
        />
        <p className="text-xs mt-1 text-gray-500">
          Password must contain at least one letter, one number, and one special character
        </p>
      </div>
      
      <div>
        <label htmlFor="grade" className="block text-sm font-medium">Grade</label>
        <input
          id="grade"
          name="grade"
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.grade}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="section" className="block text-sm font-medium">Section</label>
        <input
          id="section"
          name="section"
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.section}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="schoolName" className="block text-sm font-medium">School Name</label>
        <input
          id="schoolName"
          name="schoolName"
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.schoolName}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="profilePicture" className="block text-sm font-medium">Profile Picture</label>
        <input
                   id="profilePicture"
                   name="profilePicture"
                   type="file"
                   accept="image/*"
                   className="w-full px-3 py-2 border rounded-md"
                   onChange={handleChange}
                 />
                 <p className="text-xs mt-1 text-gray-500">
                   Maximum file size: 5MB
                 </p>
               </div>
               
               <button 
                 type="submit" 
                 className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                 disabled={loading}
               >
                 {loading ? 'Signing up...' : 'Sign Up'}
               </button>
             </form>
           );
         };