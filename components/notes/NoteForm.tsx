import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export const NoteForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check file size (max 5MB)
      const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      
      if (invalidFiles.length > 0) {
        setError('One or more files exceed the maximum size of 5MB');
        return;
      }
      
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (attachments.length === 0) {
      setError('Please upload at least one attachment');
      setLoading(false);
      return;
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('You must be logged in to share notes');
      
      // Create note
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          grade: formData.grade,
        })
        .select('id')
        .single();
      
      if (noteError) throw noteError;
      
      // Upload attachments
      for (const file of attachments) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `notes/${noteData.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Create attachment record
        const { error: attachmentError } = await supabase
          .from('attachments')
          .insert({
            user_id: user.id,
            entity_type: 'note',
            entity_id: noteData.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath,
          });
        
        if (attachmentError) throw attachmentError;
      }
      
      // Navigate to the newly created note
      router.push(`/notes/${noteData.id}`);
    } catch (err) {
      console.error('Error sharing note:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while sharing your note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-100 p-3 text-red-700 rounded">{error}</div>}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Note Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Biology Notes - Chapter 5 Photosynthesis"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.title}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Add a brief description of these notes"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g. Biology, Mathematics, History"
            value={formData.subject}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
            Grade/Class
          </label>
          <input
            id="grade"
            name="grade"
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g. 10, 11, 12"
            value={formData.grade}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Notes (Required)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
              >
                <span>Upload files</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PDF, Word, PowerPoint, Images, etc. (max 5MB each)</p>
          </div>
        </div>
      </div>
      
      {attachments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
          <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
            {attachments.map((file, index) => (
              <li key={index} className="py-2 px-4 flex justify-between items-center">
                <span className="text-sm">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Share Notes'}
        </button>
      </div>
    </form>
  );
};