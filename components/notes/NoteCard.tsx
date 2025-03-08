import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    description: string;
    subject: string;
    grade: string;
    created_at: string;
    view_count: number;
    attachment_count: number;
    author: {
      full_name: string;
      grade: string;
      section: string;
      school_name: string;
      profile_picture_url: string;
    };
  };
}

export const NoteCard = ({ note }: NoteCardProps) => {
  return (
    <div className="bg-white shadow-sm border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">
          <Link href={`/notes/${note.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
            {note.title}
          </Link>
        </h3>
        {note.subject && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            {note.subject}
          </span>
        )}
      </div>

      {note.description && (
        <div className="mt-2">
          <p className="text-gray-600 line-clamp-2">{note.description}</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          {note.author.profile_picture_url ? (
            <Image
              src={note.author.profile_picture_url}
              alt={note.author.full_name}
              width={24}
              height={24}
              className="rounded-full mr-2"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <span className="text-xs text-blue-600 font-medium">
                {note.author.full_name.charAt(0)}
              </span>
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium text-gray-700">{note.author.full_name}</span>
            <span className="text-gray-500 mx-1">•</span>
            <span className="text-gray-500">{note.author.grade} {note.author.section}</span>
            <span className="text-gray-500 mx-1">•</span>
            <span className="text-gray-500">{note.author.school_name}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <span>{formatDistanceToNow(new Date(note.created_at))} ago</span>
          <span className="mx-2">•</span>
          <span>{note.view_count} views</span>
          <span className="mx-2">•</span>
          <span>{note.attachment_count} {note.attachment_count === 1 ? 'file' : 'files'}</span>
        </div>
      </div>
    </div>
  );
};