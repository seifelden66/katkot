export interface Post {
  id: string;
  content: string;
  media_url?: string;
  created_at: string;
  user_id: string;
  category_id?: number;
  author: Profile;
  category?: Category;
  reactions_count?: number;
  comments_count?: number;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  username?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  user_id: string;
  user?: Profile;
}

export interface Reaction {
  id: string;
  type: string;
  post_id: string;
  user_id: string;
}