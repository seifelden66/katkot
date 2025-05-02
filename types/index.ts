export interface Category {
  id: number;
  name: string;
}

export interface Store {
  id: number;
  name: string;
}

export interface UserProfile {
  region_id?: number;
}

export interface Author {
  full_name: string;
  avatar_url: string | null;
}

export interface Region {
  name: string;
  code: string;
}

export interface Post {
  id: number;
  author: Author;
  category: { name: string };
  region: Region;
  created_at: string;
  title?: string;
  content?: string;
  media_url?: string;
  affiliate_link?: string;
  description?: string;
  store_id?: number;
  category_id?: number;
  region_id?: number;
  user_id?: string;
  [key: string]: string | number | Author | Region | { name: string } | undefined;
}

export interface Comment {
  id: number;
  post_id: number;
  content: string;
  created_at: string;
  user_id: string;
  author: Author;
}

export interface Reaction {
  id: number;
  post_id: number;
  user_id: string;
  type: string;
  created_at: string;
}

