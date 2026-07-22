// Shared blog post interface between client and server
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  updated: string;
  description: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  excerpt: string;
  content: string;
  coverImage?: string;
}
