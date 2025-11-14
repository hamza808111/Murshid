import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Assessment from "./pages/Assessment";
import Majors from "./pages/Majors";
import Universities from "./pages/Universities";
import MajorDetail from "./pages/MajorDetail";
import UniversityDetail from "./pages/UniversityDetail";
import Bookmarks from "./pages/Bookmarks";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUniversities from "./pages/AdminUniversities";
import AdminMajors from "./pages/AdminMajors";
import AdminUniversityMajors from "./pages/AdminUniversityMajors";
import Community from "./pages/Community";
import Suspended from "./pages/Suspended";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <I18nProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/majors" element={<Majors />} />
              <Route path="/majors/:id" element={<MajorDetail />} />
              <Route path="/universities" element={<Universities />} />
              <Route path="/universities/:id" element={<UniversityDetail />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/universities" element={<ProtectedRoute><AdminUniversities /></ProtectedRoute>} />
              <Route path="/admin/majors" element={<ProtectedRoute><AdminMajors /></ProtectedRoute>} />
              <Route path="/admin/university-majors" element={<ProtectedRoute><AdminUniversityMajors /></ProtectedRoute>} />
              <Route path="/community" element={<Community />} />
              <Route path="/suspended" element={<Suspended />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        <Analytics />
      </I18nProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
