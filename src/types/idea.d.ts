
import { User, Comment } from "@/data/ideas";

export interface IdeaProps {
  id: string;
  type: "video" | "image" | "text";
  title: string;
  description: string;
  media?: string;
  thumbnailUrl?: string;
  user: User;
  likes: number;
  comments: Comment[];
  shares: number;
  timestamp: string;
  createdAt?: string; // Add this to support both timestamp and createdAt
  tags: string[];
  ratings?: {
    practicality: number;
    innovation: number;
    impact: number;
  };
  questions?: Array<string | Record<string, any>>; // Support different question formats
}

export interface IdeaFeedProps {
  ideas: IdeaProps[];
  className?: string;
}
