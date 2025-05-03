
export type SubmissionType = 'idea' | 'problem';
export type ContentType = 'video' | 'card';

export interface QuestionItem {
  id: string;
  text: string;
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  type: SubmissionType;
  contentType: ContentType;
  mediaUrl?: string;
  thumbnailUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  userId: string;
  tags?: string[];
  questions?: QuestionItem[];
  createdAt: string;
  updatedAt: string;
}
