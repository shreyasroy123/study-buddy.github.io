import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';

interface NotePageProps {
  note: {
    id: string;
    title: string;
    description: string;
    subject: string;
    grade: string;
    created_at: string;
    view_count: number;
    user_id: string;
    author: {
      full_name: string;
      grade: string;
      section: string;
      school_name: string;
      profile_picture_url: string;
    };
  };
  attachments: Array<{
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    storage_path: string;
  }>;
}

const NotePage: NextPage<NotePageProps> = ({ note, attachments }) => {
    useEffect(() => {
        const incrementViewCount = async () => {
          try {
            await supabase
              .from('notes')
              .update({ view_count: note.view_count + 1 })
              .eq('id', note.id);
          } catch (error) {
            console.error('Error incrementing view count:', error);
          }
        };
    
        incrementViewCount();
      }, [note.id, note.view_count]);
    
      const getFileUrl = (path: string) => {
        return supabase.storage.from('attachments').getPublicUrl(path).data.publicUrl;
      };
    
      const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) {
          return (
            <svg className="h-10 w-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          );
        } else if (fileType.includes('word') || fileType.includes('document')) {
          return (
            <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          );
        } else if (fileType.includes('sheet') || fileType.includes('excel')) {
          return (
            <svg className="h-10 w-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
            </svg>
          );
        } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
          return (
            <svg className="h-10 w-10 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          );
        } else if (fileType.includes('image')) {
          return (
            <svg className="h-10 w-10 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          );
        } else {
          return (
            <svg className="h-10 w-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
          );
        }
      };
    
      return (
        <>
          <Head>
            <title>{note.title} | NotesBuddy</title>
            <meta name="description" content={note.description || `Study notes on ${note.subject}`} />
          </Head>
          
          <Navbar />
          
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-sm border rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{note.title}</h1>
                  <div className="flex flex-wrap items-center mt-2">
                    {note.subject && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium mr-2">
                        {note.subject}
                      </span>
                    )}
                    {note.grade && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                        Grade {note.grade}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {note.description && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-700">{note.description}</p>
                </div>
              )}
              
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Files</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attachments.map((attachment) => (
                    <li key={attachment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <a 
                        href={getFileUrl(attachment.storage_path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <div className="flex-shrink-0">
                          {getFileIcon(attachment.file_type)}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-blue-600 hover:text-blue-800 truncate">
                            {attachment.file_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    {note.author.profile_picture_url ? (
                      <Image
                        src={note.author.profile_picture_url}
                        alt={note.author.full_name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-lg text-blue-600 font-medium">
                          {note.author.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{note.author.full_name}</p>
                    <div className="text-sm text-gray-500">
                      <span>{note.author.grade} {note.author.section}</span>
                      <span className="mx-1">•</span>
                      <span>{note.author.school_name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-4">
                  <p>Shared {formatDistanceToNow(new Date(note.created_at))} ago • {note.view_count} views</p>
                </div>
              </div>
            </div>
          </main>
        </>
      );
    };
    
    export const getServerSideProps: GetServerSideProps = async (context) => {
      const { id } = context.params || {};
      
      try {
        // Fetch note with author details
        const { data: noteData, error: noteError } = await supabase
          .from('notes')
          .select(`
            id,
            title,
            description,
            subject,
            grade,
            created_at,
            view_count,
            user_id,
            profiles!notes_user_id_fkey (
              full_name,
              grade,
              section,
              school_name,
              profile_picture_url
            )
          `)
          .eq('id', id)
          .single();
        
        if (noteError) throw noteError;
        
        // Fetch attachments for this note
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from('attachments')
          .select('*')
          .eq('entity_type', 'note')
          .eq('entity_id', id);
        
        if (attachmentsError) throw attachmentsError;
        
        return {
          props: {
            note: {
              ...noteData,
              author: noteData.profiles
            },
            attachments: attachmentsData
          }
        };
      } catch (error) {
        console.error('Error fetching note data:', error);
        return {
          notFound: true
        };
      }
    };
    
    export default NotePage;