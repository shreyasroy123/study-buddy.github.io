import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export const QuestionForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('You must be logged in to post a question');
      
      // Create question
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
        })
        .select('id')
        .single();
      
      if (questionError) throw questionError;
      
      // Upload attachments if any
      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
          const filePath = `questions/${questionData.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(filePath, file);
          
          if (uploadError) throw uploadError;
          
          // Create attachment record
          const { error: attachmentError } = await supabase
            .from('attachments')
            .insert({
              user_id: user.id,
              entity_type: 'question',
              entity_id: questionData.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              storage_path: filePath,
            });
          
          if (attachmentError) throw attachmentError;
        }
      }
      
      // Navigate to the newly created question
      router.push(`/questions/${questionData.id}`);
    } catch (err) {
      console.error('Error creating question:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating your question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-100 p-3 text-red-700 rounded">{error}</div>}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Question Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. How do I solve this quadratic equation?"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.title}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Question Details
        </label>
        <textarea
          id="content"
          name="content"
          rows={6}
          required
          placeholder="Describe your question in detail. Include any relevant information that would help others understand your problem."
          className="w-full px-3 py-2 border rounded-md"
          value={formData.content}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Attachments (Optional)
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
                <span>Upload a file</span>
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
            <p className="text-xs text-gray-500">File size limit: 5MB</p>
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
          {loading ? 'Posting...' : 'Post Question'}
        </button>
      </div>
    </form>
  );
};