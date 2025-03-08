export interface Question {
    id: string;
    user_id: string;
    title: string;
    content: string;
    attachments: Attachment[];
    created_at: string;
    updated_at: string;
    author: {
      full_name: string;
      grade: string;
      section: string;
      school_name: string;
      profile_picture_url: string;
    };
  }
  
  export interface Answer {
    id: string;
    question_id: string;
    user_id: string;
    content: string;
    attachments: Attachment[];
    created_at: string;
    updated_at: string;
    author: {
      full_name: string;
      grade: string;
      section: string;
      school_name: string;
      profile_picture_url: string;
    };
  }
  
  export interface Attachment {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number; // in bytes
    file_url: string;
  }