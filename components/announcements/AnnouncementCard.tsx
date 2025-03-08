import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface AnnouncementCardProps {
  announcement: {
    id: string;
    title: string;
    content: string;
    is_important: boolean;
    created_at: string;
    author: {
      full_name: string;
      profile_picture_url: string;
    };
  };
}

export const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => {
  return (
    <div className={`bg-white shadow-sm border rounded-lg p-5 ${announcement.is_important ? 'border-red-400' : ''}`}>
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">
          <Link href={`/announcements/${announcement.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
            {announcement.title}
          </Link>
        </h3>
        {announcement.is_important && (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
            Important
          </span>
        )}
      </div>

      <div className="mt-2">
        <p className="text-gray-600 line-clamp-3">{announcement.content}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          {announcement.author.profile_picture_url ? (
            <Image
              src={announcement.author.profile_picture_url}
              alt={announcement.author.full_name}
              width={24}
              height={24}
              className="rounded-full mr-2"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <span className="text-xs text-blue-600 font-medium">
                {announcement.author.full_name.charAt(0)}
              </span>
            </div>
          )}
          <div className="text-sm text-gray-500">
            Posted by <span className="font-medium text-gray-700">{announcement.author.full_name}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(announcement.created_at))} ago
        </div>
      </div>
    </div>
  );
};