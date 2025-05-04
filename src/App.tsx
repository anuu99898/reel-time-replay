
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import IdeaDetail from "@/pages/IdeaDetail";
import Profile from "@/pages/Profile";
import Upload from "@/pages/Upload";
import EditSubmission from "@/pages/EditSubmission";
import NotFound from "@/pages/NotFound";
import Notifications from "@/pages/Notifications";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/idea/:id" element={<IdeaDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/edit/:id" element={<EditSubmission />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
