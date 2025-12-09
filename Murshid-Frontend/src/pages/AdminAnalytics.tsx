import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, RefreshCw, TrendingUp, Activity, Heart, Eye, Award, UserPlus, Users, MessageSquare, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/contexts/I18nContext";
import { PageAnimation } from "@/components/animations/PageAnimation";
import { ScrollAnimation } from "@/components/animations/ScrollAnimation";

const AdminAnalytics = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    totalAnswers: 0,
    totalComments: 0,
    totalLikes: 0,
    totalViews: 0,
    activeUsers: 0,
    newUsersLast7Days: 0,
    newUsersLast30Days: 0,
    pendingSpecialists: 0,
    suspendedUsers: 0,
    engagementActivity: [] as { date: string; posts: number; answers: number; comments: number }[],
    userRoleDistribution: { students: 0, specialists: 0, admins: 0 },
    topContributors: [] as { id: string; name: string; posts: number; answers: number; points: number }[],
    loading: true,
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (user.is_admin === false) {
      toast.error(t("admin.dashboard.toast.accessDenied"));
      navigate("/");
      return;
    }

    if (user.is_admin === true) {
      fetchAnalytics();
    }
  }, [user, authLoading, navigate]);

  const fetchAnalytics = async () => {
    try {
      setAnalytics(prev => ({ ...prev, loading: true }));
      
      // Fetch community stats with error handling
      const [postsResult, answersResult, commentsResult, profilesResult] = await Promise.allSettled([
        supabase.from("community_posts").select("id, likes_count, views_count, created_at, is_deleted, author_id").eq("is_deleted", false),
        supabase.from("community_answers").select("id, likes_count, created_at, is_deleted, author_id").eq("is_deleted", false),
        supabase.from("community_comments").select("id, created_at, is_deleted").eq("is_deleted", false),
        supabase.from("profiles").select("id, created_at, is_suspended, role, points, total_posts, total_answers, name").not("id", "is", null),
      ]);

      const posts = postsResult.status === 'fulfilled' && !postsResult.value.error ? (postsResult.value.data || []) : [];
      const answers = answersResult.status === 'fulfilled' && !answersResult.value.error ? (answersResult.value.data || []) : [];
      const comments = commentsResult.status === 'fulfilled' && !commentsResult.value.error ? (commentsResult.value.data || []) : [];
      const profiles = profilesResult.status === 'fulfilled' && !profilesResult.value.error ? (profilesResult.value.data || []) : [];

      // Calculate totals
      const totalLikes = posts.reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0) + 
                        answers.reduce((sum: number, a: any) => sum + (a.likes_count || 0), 0);
      const totalViews = posts.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0);

      // Engagement activity (last 7 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const engagementActivity: { date: string; posts: number; answers: number; comments: number }[] = [];
      
      // Helper function to normalize date to YYYY-MM-DD
      const normalizeDate = (date: Date | string): string => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = normalizeDate(date);
        
        const dayPosts = posts.filter((p: any) => {
          if (!p.created_at) return false;
          try {
            const createdStr = normalizeDate(p.created_at);
            return createdStr === dateStr;
          } catch {
            return false;
          }
        }).length;
        
        const dayAnswers = answers.filter((a: any) => {
          if (!a.created_at) return false;
          try {
            const createdStr = normalizeDate(a.created_at);
            return createdStr === dateStr;
          } catch {
            return false;
          }
        }).length;
        
        const dayComments = comments.filter((c: any) => {
          if (!c.created_at) return false;
          try {
            const createdStr = normalizeDate(c.created_at);
            return createdStr === dateStr;
          } catch {
            return false;
          }
        }).length;
        
        engagementActivity.push({ date: dateStr, posts: dayPosts, answers: dayAnswers, comments: dayComments });
      }

      // User role distribution
      const userRoleDistribution = {
        students: profiles.filter((p: any) => (p.role === "Student" || p.role === "student") && !p.is_suspended).length,
        specialists: profiles.filter((p: any) => (p.role === "Specialist" || p.role === "specialist") && !p.is_suspended).length,
        admins: profiles.filter((p: any) => p.is_admin === true).length,
      };

      // New users in last 7 and 30 days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newUsersLast7Days = profiles.filter((p: any) => {
        if (!p.created_at) return false;
        return new Date(p.created_at) >= sevenDaysAgo;
      }).length;
      const newUsersLast30Days = profiles.filter((p: any) => {
        if (!p.created_at) return false;
        return new Date(p.created_at) >= thirtyDaysAgo;
      }).length;

      // Active users (users who created posts/answers in last 30 days)
      const activeUserIds = new Set([
        ...posts.filter((p: any) => new Date(p.created_at) >= thirtyDaysAgo && p.author_id).map((p: any) => p.author_id),
        ...answers.filter((a: any) => new Date(a.created_at) >= thirtyDaysAgo && a.author_id).map((a: any) => a.author_id),
      ]);

      // Pending and suspended users
      const pendingSpecialists = profiles.filter((p: any) => 
        p.is_suspended === true && 
        (p.role === "Specialist" || p.role === "specialist")
      ).length;
      const suspendedUsers = profiles.filter((p: any) => p.is_suspended === true).length;

      // Top contributors (by posts and answers)
      const contributorMap = new Map<string, { posts: number; answers: number; points: number; name: string }>();
      
      posts.forEach((post: any) => {
        const profile = profiles.find((p: any) => p.id === post.author_id);
        if (profile) {
          const existing = contributorMap.get(post.author_id) || { posts: 0, answers: 0, points: (profile as any).points || 0, name: (profile as any).name || "Unknown" };
          existing.posts++;
          contributorMap.set(post.author_id, existing);
        }
      });

      answers.forEach((answer: any) => {
        const profile = profiles.find((p: any) => p.id === answer.author_id);
        if (profile) {
          const existing = contributorMap.get(answer.author_id) || { posts: 0, answers: 0, points: (profile as any).points || 0, name: (profile as any).name || "Unknown" };
          existing.answers++;
          contributorMap.set(answer.author_id, existing);
        }
      });

      const topContributors = Array.from(contributorMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => (b.posts + b.answers) - (a.posts + a.answers))
        .slice(0, 5);

      console.log("Analytics data:", {
        postsCount: posts.length,
        answersCount: answers.length,
        commentsCount: comments.length,
        engagementActivity,
        userRoleDistribution,
        profilesCount: profiles.length
      });

      setAnalytics({
        totalPosts: posts.length,
        totalAnswers: answers.length,
        totalComments: comments.length,
        totalLikes,
        totalViews,
        activeUsers: activeUserIds.size,
        newUsersLast7Days,
        newUsersLast30Days,
        pendingSpecialists,
        suspendedUsers,
        engagementActivity,
        userRoleDistribution,
        topContributors,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics(prev => ({ ...prev, loading: false }));
    }
  };

  if (!user || user.is_admin !== true) {
    return null;
  }

  return (
    <PageAnimation>
      <div className="admin-layout min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5" dir={language}>
        <Navbar />
        
        <ScrollAnimation>
          <div className="max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-10 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold flex items-center gap-3">
                    <BarChart3 className="w-10 h-10 text-primary" />
                    {t("admin.dashboard.analytics.title")}
                  </h1>
                  <p className="text-muted-foreground mt-2">{t("admin.dashboard.analytics.subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={fetchAnalytics} 
                    variant="outline" 
                    className="rounded-2xl px-6 py-3 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 gap-2"
                    disabled={analytics.loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${analytics.loading ? 'animate-spin' : ''}`} />
                    {t("admin.dashboard.refresh")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {t("admin.dashboard.analytics.newUsers30Days")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.newUsersLast30Days}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.newUsersLast7Days} {t("admin.dashboard.analytics.newThisWeek")}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    {t("admin.dashboard.analytics.totalPosts")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{analytics.totalPosts}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.totalAnswers} {t("admin.dashboard.analytics.answers")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                    {t("admin.dashboard.analytics.activeUsers")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.activeUsers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("admin.dashboard.analytics.last30Days")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 border-pink-200 dark:border-pink-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    {t("admin.dashboard.analytics.totalEngagement")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{analytics.totalLikes.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.totalViews.toLocaleString()} {t("admin.dashboard.analytics.views")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {t("admin.dashboard.analytics.postsLast7Days")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.loading ? (
                    <div className="flex items-center justify-center h-16">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {analytics.engagementActivity && analytics.engagementActivity.length > 0
                          ? analytics.engagementActivity.reduce((sum, d) => sum + (d.posts || 0), 0)
                          : 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analytics.engagementActivity && analytics.engagementActivity.length > 0
                          ? (analytics.engagementActivity[analytics.engagementActivity.length - 1]?.posts || 0)
                          : 0} {t("admin.dashboard.analytics.today")}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {t("admin.dashboard.analytics.answersLast7Days")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.loading ? (
                    <div className="flex items-center justify-center h-16">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {analytics.engagementActivity && analytics.engagementActivity.length > 0
                          ? analytics.engagementActivity.reduce((sum, d) => sum + (d.answers || 0), 0)
                          : 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analytics.engagementActivity && analytics.engagementActivity.length > 0
                          ? (analytics.engagementActivity[analytics.engagementActivity.length - 1]?.answers || 0)
                          : 0} {t("admin.dashboard.analytics.today")}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {t("admin.dashboard.analytics.commentsLast7Days")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.loading ? (
                    <div className="flex items-center justify-center h-16">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {analytics.engagementActivity && analytics.engagementActivity.length > 0
                          ? analytics.engagementActivity.reduce((sum, d) => sum + (d.comments || 0), 0)
                          : 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analytics.engagementActivity && analytics.engagementActivity.length > 0
                          ? (analytics.engagementActivity[analytics.engagementActivity.length - 1]?.comments || 0)
                          : 0} {t("admin.dashboard.analytics.today")}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {t("admin.dashboard.analytics.avgEngagement")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.loading ? (
                    <div className="flex items-center justify-center h-16">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {analytics.engagementActivity && analytics.engagementActivity.length > 0
                          ? Math.round(
                              analytics.engagementActivity.reduce((sum, d) => sum + (d.posts || 0) + (d.answers || 0) + (d.comments || 0), 0) / 
                              analytics.engagementActivity.length
                            )
                          : 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("admin.dashboard.analytics.perDay")}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* User Role Distribution - Simple Cards */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("admin.dashboard.analytics.userRoleDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.loading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">{t("admin.dashboard.stats.students")}</span>
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      </div>
                      <div className="text-3xl font-bold text-primary mb-1">
                        {analytics.userRoleDistribution.students}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {analytics.userRoleDistribution.students + analytics.userRoleDistribution.specialists > 0
                          ? Math.round((analytics.userRoleDistribution.students / (analytics.userRoleDistribution.students + analytics.userRoleDistribution.specialists)) * 100)
                          : 0}% {t("admin.dashboard.analytics.ofTotal")}
                      </div>
                    </div>

                    <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">{t("admin.dashboard.stats.specialists")}</span>
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      </div>
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        {analytics.userRoleDistribution.specialists}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {analytics.userRoleDistribution.students + analytics.userRoleDistribution.specialists > 0
                          ? Math.round((analytics.userRoleDistribution.specialists / (analytics.userRoleDistribution.students + analytics.userRoleDistribution.specialists)) * 100)
                          : 0}% {t("admin.dashboard.analytics.ofTotal")}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {t("admin.dashboard.analytics.totalViews")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {t("admin.dashboard.analytics.totalComments")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalComments}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {t("admin.dashboard.analytics.pendingSpecialists")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.pendingSpecialists}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    {t("admin.dashboard.analytics.newUsers")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.newUsersLast7Days}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t("admin.dashboard.analytics.thisWeek")}</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Contributors */}
            {analytics.topContributors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {t("admin.dashboard.analytics.topContributors")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.loading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analytics.topContributors.map((contributor, idx) => (
                        <div key={contributor.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                              idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                              idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                              idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                              'bg-gradient-to-br from-primary to-primary/70'
                            }`}>
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-semibold">{contributor.name || "Unknown User"}</p>
                              <p className="text-xs text-muted-foreground">
                                {contributor.posts} {t("admin.dashboard.analytics.posts")} • {contributor.answers} {t("admin.dashboard.analytics.answers")}
                              </p>
                            </div>
                          </div>
                          {contributor.points > 0 && (
                            <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                              <Award className="w-4 h-4" />
                              {contributor.points}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollAnimation>
      </div>
    </PageAnimation>
  );
};

export default AdminAnalytics;

