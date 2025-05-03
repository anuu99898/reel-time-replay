
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import IdeaDetail from "./pages/IdeaDetail";
import Profile from "./pages/Profile";
import EditSubmission from "./pages/EditSubmission";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { AuthProvider } from "./providers/AuthProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipPrimitive.Provider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner position="top-center" expand={true} closeButton={true} />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/idea/:id" element={<IdeaDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit/:id" element={<EditSubmission />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipPrimitive.Provider>
  </QueryClientProvider>
);

export default App;
