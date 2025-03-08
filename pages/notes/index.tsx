import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { NoteCard } from '@/components/notes/NoteCard';
import { useRouter } from 'next/router';

interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  created_at: string;
  view_count: number;
  author: {
    full_name: string;
    grade: string;
    section: string;
    school_name: string;
    profile_picture_url: string;
  };
  attachment_count: number;
}

const NotesPage: NextPage = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  
  const { subject, grade } = router.query;
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('notes')
          .select(`
            id,
            title,
            description,
            subject,
            grade,
            created_at,
            view_count,
            profiles!notes_user_id_fkey (
              full_name,
              grade,
              section,
              school_name,
              profile_picture_url
            ),
            attachments!inner (count)
          `)
          .order('created_at', { ascending: false });
          
        if (subject && typeof subject === 'string') {
          query = query.eq('subject', subject);
        }
        
        if (grade && typeof grade === 'string') {
          query = query.eq('grade', grade);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Extract unique subjects and grades for filters
        const uniqueSubjects = new Set<string>();
        const uniqueGrades = new Set<string>();
        
        const formattedNotes = data?.map(item => {
          // Add to subject and grade sets for filters
          if (item.subject) uniqueSubjects.add(item.subject);
          if (item.grade) uniqueGrades.add(item.grade);
          
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            subject: item.subject,
            grade: item.grade,
            created_at: item.created_at,
            view_count: item.view_count,
            author: item.profiles,
            attachment_count: item.attachments[0].count
          };
        });
        
        setNotes(formattedNotes || []);
        setSubjects(Array.from(uniqueSubjects).sort());
        setGrades(Array.from(uniqueGrades).sort());
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to load notes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, [subject, grade]);
  
  return (
    <>
      <Head>
        <title>Study Notes | NotesBuddy</title>
        <meta name="description" content="Share and access study notes on NotesBuddy" />
      </Head>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Study Notes</h1>
          <Link
            href="/notes/share"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Share Notes
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-64 bg-white shadow rounded-lg p-4">
            <h2 className="font-medium text-gray-800 mb-4">Filters</h2>
            
            {subjects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Subjects</h3>
                <ul className="space-y-1">
                  {subject && (
                    <li>
                      <Link 
                        href={`/notes${grade ? `?grade=${grade}` : ''}`}
                        className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                      >
                        {subject}
                        <span className="ml-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      </Link>
                    </li>
                  )}
                  {!subject && subjects.map((subj) => (
                    <li key={subj}>
                      <Link
                        href={`/notes?subject=${subj}${grade ? `&grade=${grade}` : ''}`}
                        className="text-blue-600 hover:underline"
                      >
                        {subj}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {grades.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Grades</h3>
                <ul className="space-y-1">
                  {grade && (
                    <li>
                      <Link 
                        href={`/notes${subject ? `?subject=${subject}` : ''}`}
                        className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                      >
                        Grade {grade}
                        <span className="ml-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      </Link>
                    </li>
                  )}
                  {!grade && grades.map((g) => (
                    <li key={g}>
                      <Link
                        href={`/notes?grade=${g}${subject ? `&subject=${subject}` : ''}`}
                        className="text-blue-600 hover:underline"
                      >
                        Grade {g}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex-1">
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
            ) : notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white shadow-sm border rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                <p className="text-gray-500 mb-6">Be the first to share study notes!</p>
                <Link
                  href="/notes/share"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Share Notes
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default NotesPage;