export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role: 'student' | 'specialist' | 'admin';
  author_university?: string;
  author_major?: string;
  author_academic_level?: string;
  post_type: 'question' | 'discussion' | 'announcement';
  tags: string[];
  major_tags?: string[];
  university_tags?: string[];
  likes_count: number;
  answers_count: number;
  views_count: number;
  is_solved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role: 'student' | 'specialist' | 'admin';
  author_university?: string;
  author_major?: string;
  author_academic_level?: string;
  likes_count: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  post_type: 'question' | 'discussion' | 'announcement';
  tags: string[];
  major_tags?: string[];
  university_tags?: string[];
}

export interface CreateAnswerRequest {
  post_id: string;
  content: string;
}