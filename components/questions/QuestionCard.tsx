import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface QuestionCardProps {
  question: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    view_count: number;
    is_solved: boolean;
    answer_count?: number;
    author: {
      full_name: string;
      grade: string;
      section: string;
      school_name: string;
      profile_picture_url: string;
    };
  };
}

export const QuestionCard = ({ question }: QuestionCardProps) => {
    return (
      <div className="bg-white shadow-sm border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">
            <Link href={`/questions/${question.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
              {question.title}
            </Link>
          </h3>
          {question.is_solved && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              Solved
            </span>
          )}
        </div>
  
        <div className="mt-2">
          <p className="text-gray-600 line-clamp-2">{question.content}</p>
        </div>
  
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            {question.author.profile_picture_url ? (
              <Image
                src={question.author.profile_picture_url}
                alt={question.author.full_name}
                width={24}
                height={24}
                className="rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <span className="text-xs text-blue-600 font-medium">
                  {question.author.full_name.charAt(0)}
                </span>
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium text-gray-700">{question.author.full_name}</span>
              <span className="text-gray-500 mx-1">•</span>
              <span className="text-gray-500">{question.author.grade} {question.author.section}</span>
              <span className="text-gray-500 mx-1">•</span>
              <span className="text-gray-500">{question.author.school_name}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            <span>{formatDistanceToNow(new Date(question.created_at))} ago</span>
            <span className="mx-2">•</span>
            <span>{question.view_count} views</span>
            <span className="mx-2">•</span>
            <span>{question.answer_count || 0} answers</span>
          </div>
        </div>
      </div>
    );
  };