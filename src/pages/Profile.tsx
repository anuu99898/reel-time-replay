
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { Edit, Trash2, Eye, ArrowLeftRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfileAndSubmissions = async () => {
      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileError) throw profileError;
        setProfile(profileData);
        
        // Fetch all submissions (both ideas and problems)
        const { data: ideasData, error: ideasError } = await supabase
          .from("ideas")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
          
        if (ideasError) throw ideasError;
        setSubmissions(ideasData || []);
        
      } catch (error: any) {
        console.error("Error fetching profile data:", error.message);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileAndSubmissions();
  }, [user, navigate]);

  const handleDelete = async () => {
    if (!submissionToDelete) return;
    
    try {
      const { error } = await supabase
        .from("ideas")
        .delete()
        .eq("id", submissionToDelete);
        
      if (error) throw error;
      
      setSubmissions(submissions.filter(item => item.id !== submissionToDelete));
      toast.success("Submission deleted successfully");
    } catch (error: any) {
      console.error("Error deleting submission:", error.message);
      toast.error("Failed to delete submission");
    } finally {
      setSubmissionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (id: string) => {
    setSubmissionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const filterSubmissions = () => {
    if (activeTab === "all") return submissions;
    if (activeTab === "ideas") return submissions.filter(s => s.idea_type === "idea");
    if (activeTab === "problems") return submissions.filter(s => s.idea_type === "problem");
    return submissions;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-24 max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-24 max-w-4xl mx-auto px-4 pb-20">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
          <Avatar className="w-24 h-24 border-2 border-yellow-400">
            <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
            <AvatarFallback>{profile?.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{profile?.username || "User"}</h1>
            <p className="text-gray-400">{profile?.full_name || ""}</p>
            <p className="text-gray-400 mt-1">{user?.email}</p>
            {profile?.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
            
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => navigate("/upload")}
              >
                Add New Submission
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Edit profile coming soon!")}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
        
        {/* Submissions Tabs */}
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="bg-gray-900 mb-6">
            <TabsTrigger value="all">All Submissions</TabsTrigger>
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <SubmissionsList 
              submissions={filterSubmissions()} 
              onEdit={(id) => navigate(`/edit/${id}`)} 
              onDelete={confirmDelete}
              onView={(id) => navigate(`/idea/${id}`)}
            />
          </TabsContent>
          
          <TabsContent value="ideas" className="mt-0">
            <SubmissionsList 
              submissions={filterSubmissions()} 
              onEdit={(id) => navigate(`/edit/${id}`)} 
              onDelete={confirmDelete}
              onView={(id) => navigate(`/idea/${id}`)}
            />
          </TabsContent>
          
          <TabsContent value="problems" className="mt-0">
            <SubmissionsList 
              submissions={filterSubmissions()} 
              onEdit={(id) => navigate(`/edit/${id}`)} 
              onDelete={confirmDelete}
              onView={(id) => navigate(`/idea/${id}`)}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this submission. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface SubmissionsListProps {
  submissions: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const SubmissionsList: React.FC<SubmissionsListProps> = ({ submissions, onEdit, onDelete, onView }) => {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg">
        <p className="text-gray-400">No submissions found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    submission.idea_type === "idea" ? "bg-yellow-400 text-black" : "bg-blue-400 text-black"
                  }`}>
                    {submission.idea_type === "idea" ? "Idea" : "Problem"}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    submission.content_type === "video" ? "bg-green-400 text-black" : "bg-purple-400 text-black"
                  }`}>
                    {submission.content_type === "video" ? "Video" : "Card"}
                  </span>
                </div>
                <h3 className="text-lg font-bold truncate" title={submission.title}>
                  {submission.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mt-1">{submission.description}</p>
                
                <div className="flex flex-wrap mt-2 gap-1">
                  {submission.tags && submission.tags.slice(0, 3).map((tag: string, idx: number) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-gray-800 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(submission.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {submission.thumbnail_url || submission.media_url ? (
                <div className="w-20 h-20 rounded overflow-hidden ml-3">
                  <img 
                    src={submission.thumbnail_url || submission.media_url} 
                    alt={submission.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=No+Image";
                    }}
                  />
                </div>
              ) : null}
            </div>
            
            <div className="flex justify-end gap-2 mt-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onView(submission.id)}
                title="View"
              >
                <Eye size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(submission.id)}
                title="Edit"
              >
                <Edit size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(submission.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-900/20"
                title="Delete"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Profile;
