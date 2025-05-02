
import { User, Comment } from "@/data/ideas";

export interface IdeaProps {
  id: string;
  type: "video" | "image" | "text";
  title: string;
  description: string;
  media?: string;
  thumbnail: string;
  user: User;
  likes: number;
  comments: Comment[];
  shares: number;
  timestamp: string;
  tags: string[];
  ratings: {
    practicality: number;
    innovation: number;
    impact: number;
  };
}

export interface IdeaFeedProps {
  ideas: IdeaProps[];
  onIdeaClick?: (ideaId: string) => void;
}
