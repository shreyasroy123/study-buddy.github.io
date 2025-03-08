<span>Viewed {question.view_count} times</span>
{question.is_solved && (
  <>
    <span className="mx-2">•</span>
    <span className="text-green-600 font-medium">Solved</span>
  </>
)}
</div>
</div>

<div className="flex items-start">
<div className="flex-shrink-0 mr-4">
{question.author.profile_picture_url ? (
  <Image
    src={question.author.profile_picture_url}
    alt={question.author.full_name}
    width={48}
    height={48}
    className="rounded-full"
  />
) : (
  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
    <span className="text-xl text-blue-600 font-medium">
      {question.author.full_name.charAt(0)}
    </span>
  </div>
)}
</div>

<div className="flex-1">
<div className="text-gray-700 prose max-w-none" dangerouslySetInnerHTML={renderMarkdown(question.content)} />

{/* Question attachments */}
{attachments.length > 0 && (
  <div className="mt-6 border-t pt-4">
    <h3 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h3>
    <ul className="space-y-2">
      {attachments.map((attachment) => (
        <li key={attachment.id} className="flex items-center">
          <span className="text-blue-600 mr-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          </span>
          <a 
            href={getFileUrl(attachment.storage_path)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {attachment.file_name} ({(attachment.file_size / 1024 / 1024).toFixed(2)} MB)
          </a>
        </li>
      ))}
    </ul>
  </div>
)}

<div className="mt-4 text-sm">
  <div className="flex items-center text-gray-500">
    <span className="font-medium text-gray-700">{question.author.full_name}</span>
    <span className="mx-1">•</span>
    <span>{question.author.grade} {question.author.section}</span>
    <span className="mx-1">•</span>
    <span>{question.author.school_name}</span>
  </div>
</div>
</div>
</div>
</div>

{/* Answers */}
<div className="mb-8">
<h2 className="text-xl font-bold text-gray-900 mb-4">
{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
</h2>

{answers.length > 0 ? (
<div className="space-y-6">
{answers.map((answer) => (
  <div 
    key={answer.id} 
    className={`bg-white shadow-sm border rounded-lg p-6 ${
      answer.is_accepted ? 'border-green-500' : ''
    }`}
  >
    {answer.is_accepted && (
      <div className="flex items-center mb-4 bg-green-50 text-green-700 px-3 py-2 rounded-md">
        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Accepted Solution</span>
      </div>
    )}
    
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <button
          onClick={() => handleVote(answer.id, 1)}
          className={`p-2 rounded-full ${
            answer.votes.user_vote === 1 
              ? 'text-blue-600' 
              : 'text-gray-400 hover:text-gray-500'
          }`}
          aria-label="Upvote"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="font-medium text-gray-700">
          {answer.votes.upvotes - answer.votes.downvotes}
        </span>
        <button
          onClick={() => handleVote(answer.id, -1)}
          className={`p-2 rounded-full ${
            answer.votes.user_vote === -1 
              ? 'text-red-600' 
              : 'text-gray-400 hover:text-gray-500'
          }`}
          aria-label="Downvote"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1">
        <div className="text-gray-700 prose max-w-none" dangerouslySetInnerHTML={renderMarkdown(answer.content)} />
        
        {/* Answer attachments */}
        {answer.attachments.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h3>
            <ul className="space-y-2">
              {answer.attachments.map((attachment) => (
                <li key={attachment.id} className="flex items-center">
                  <span className="text-blue-600 mr-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <a 
                    href={getFileUrl(attachment.storage_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {attachment.file_name} ({(attachment.file_size / 1024 / 1024).toFixed(2)} MB)
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm">
            <div className="flex items-center text-gray-500">
              <span className="font-medium text-gray-700">{answer.author.full_name}</span>
              <span className="mx-1">•</span>
              <span>{answer.author.grade} {answer.author.section}</span>
              <span className="mx-1">•</span>
              <span>{answer.author.school_name}</span>
            </div>
            <div className="text-gray-500 mt-1">
              Answered {formatDistanceToNow(new Date(answer.created_at))} ago
            </div>
          </div>
          
          {currentUser && currentUser.id === question.user_id && !question.is_solved && (
            <button
              onClick={() => markAsSolution(answer.id)}
              className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200"
            >
              Mark as Solution
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
))}
</div>
) : (
<div className="bg-white shadow-sm border rounded-lg p-6 text-center">
<p className="text-gray-500">No answers yet. Be the first to answer!</p>
</div>
)}
</div>

{/* Post an answer */}
<div className="bg-white shadow-sm border rounded-lg p-6">
<h2 className="text-xl font-bold text-gray-900 mb-4">Your Answer</h2>

{!currentUser ? (
<div className="text-center py-6">
<p className="text-gray-500 mb-4">You need to be logged in to answer this question.</p>
<a 
  href={`/auth/login?redirect=/questions/${question.id}`}
  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
>
  Log in to answer
</a>
</div>
) : (
<form onSubmit={handleAnswerSubmit} className="space-y-4">
{error && <div className="bg-red-100 p-3 text-red-700 rounded">{error}</div>}

<div>
  <label htmlFor="answer" className="sr-only">Your answer</label>
  <textarea
    id="answer"
    name="answer"
    rows={6}
    required
    placeholder="Write your answer here..."
    className="w-full px-3 py-2 border rounded-md"
    value={answerContent}
    onChange={(e) => setAnswerContent(e.target.value)}
  />
  <p className="mt-1 text-sm text-gray-500">
    You can use markdown for formatting your answer.
  </p>
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

{answerFiles.length > 0 && (
  <div>
    <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
    <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
      {answerFiles.map((file, index) => (
        <li key={index} className="py-2 px-4 flex justify-between items-center">
          <span className="text-sm">
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </span>
          <button
            type="button"
            onClick={() => removeFile(index)}
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
      disabled={isSubmitting}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {isSubmitting ? 'Submitting...' : 'Post Your Answer'}
    </button>
  </div>
</form>
)}
</div>
</main>
</>
);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
const { id } = context.params || {};

try {
// Fetch question with author details
const { data: questionData, error: questionError } = await supabase
.from('questions')
.select(`
id,
title,
content,
created_at,
updated_at,
view_count,
is_solved,
user_id,
profiles!questions_user_id_fkey (
full_name,
grade,
section,
school_name,
profile_picture_url
)
`)
.eq('id', id)
.single();

if (questionError) throw questionError;

// Fetch answers with authors and vote counts
const { data: answersData, error: answersError } = await supabase
.from('answers')
.select(`
id,
content,
created_at,
user_id,
is_accepted,
profiles!answers_user_id_fkey (
full_name,
grade,
section,
school_name,
profile_picture_url
)
`)
.eq('question_id', id)
.order('created_at', { ascending: true });

if (answersError) throw answersError;

// Fetch vote counts for each answer
const formattedAnswers = await Promise.all(
answersData.map(async (answer) => {
// Get upvotes
const { data: upvotes } = await supabase
.from('votes')
.select('id')
.eq('answer_id', answer.id)
.eq('vote_type', 1);

// Get downvotes
const { data: downvotes } = await supabase
.from('votes')
.select('id')
.eq('answer_id', answer.id)
.eq('vote_type', -1);

// Get attachments for this answer
const { data: attachmentsData } = await supabase
.from('attachments')
.select('*')
.eq('entity_type', 'answer')
.eq('entity_id', answer.id);

return {
...answer,
author: answer.profiles,
votes: {
upvotes: upvotes?.length || 0,
downvotes: downvotes?.length || 0
},
attachments: attachmentsData || []
};
})
);

// Get attachments for the question
const { data: questionAttachments } = await supabase
.from('attachments')
.select('*')
.eq('entity_type', 'question')
.eq('entity_id', id);

return {
props: {
question: {
...questionData,
author: questionData.profiles
},
answers: formattedAnswers,
attachments: questionAttachments || []
}
};
} catch (error) {
console.error('Error fetching question data:', error);
return {
notFound: true
};
}
};

export default QuestionPage;