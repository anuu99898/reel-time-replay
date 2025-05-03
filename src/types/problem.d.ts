
export interface ProblemProps {
  id: string;
  title: string;
  description: string;
  user_id: string;
  contact_email?: string;
  contact_phone?: string;
  tags?: string[];
  questions?: string[];
  created_at: string;
  updated_at: string;
}
