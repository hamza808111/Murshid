import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageAnimation } from "@/components/animations/PageAnimation";
import { ScrollAnimation } from "@/components/animations/ScrollAnimation";
import { 
  Search, 
  Plus, 
  MessageCircle, 
  Heart, 
  Eye, 
  CheckCircle,
  Filter,
  TrendingUp
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Post } from '@/types/community';
import { toast } from 'sonner';
import { getCommunityPosts } from '@/lib/communityApi';

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'questions' | 'discussions'>('all');
  const [loading, setLoading] = useState(true);
  const { language } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [selectedFilter, searchQuery]);

  // Refresh posts when component mounts (e.g., returning from create post)
  useEffect(() => {
    const handleFocus = () => {
      fetchPosts();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await getCommunityPosts({
        type: selectedFilter,
        search: searchQuery.trim() || undefined,
      });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error(language === 'ar' ? 'فشل تحميل المشاركات' : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/community/create');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return language === 'ar' ? 'منذ قليل' : 'Just now';
    if (diffInHours < 24) return language === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return language === 'ar' ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`;
  };

  return (
    <PageAnimation>
      <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
        <Navbar />
        
        <div className="py-20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10">
            {/* Header */}
            <ScrollAnimation>
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4" dir={language}>
                  {language === 'ar' ? 'المجتمع الأكاديمي' : 'Academic Community'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8" dir={language}>
                  {language === 'ar'
                    ? 'شارك الأسئلة والخبرات مع الطلاب والمختصين'
                    : 'Share questions and experiences with students and specialists'}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleCreatePost}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-8 py-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {language === 'ar' ? 'إنشاء منشور' : 'Create Post'}
                  </Button>
                  {user && (
                    <Button
                      onClick={() => navigate('/community/my-posts')}
                      variant="outline"
                      className="rounded-2xl px-8 py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      {language === 'ar' ? 'منشوراتي' : 'My Posts'}
                    </Button>
                  )}
                </div>
              </div>
            </ScrollAnimation>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto mb-12 space-y-4">
              <div className="relative">
                <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <Input
                  type="text"
                  placeholder={language === 'ar' ? 'ابحث في المنشورات...' : 'Search posts...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${language === 'ar' ? 'pr-12' : 'pl-12'} py-6 rounded-2xl border-0 bg-white dark:bg-gray-800 shadow-md`}
                  dir={language}
                />
              </div>

              <div className="flex gap-4 justify-center">
                {[
                  { id: 'all', label: language === 'ar' ? 'الكل' : 'All' },
                  { id: 'questions', label: language === 'ar' ? 'الأسئلة' : 'Questions' },
                  { id: 'discussions', label: language === 'ar' ? 'النقاشات' : 'Discussions' }
                ].map((filter) => (
                  <Button
                    key={filter.id}
                    variant={selectedFilter === filter.id ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter(filter.id as any)}
                    className={`rounded-2xl px-6 py-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      selectedFilter === filter.id 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Posts List */}
            <div className="max-w-4xl mx-auto space-y-6">
              {posts.map((post) => (
                <ScrollAnimation key={post.id}>
                  <Card 
                    className="p-6 card-hover cursor-pointer animate-pulse-glow"
                    onClick={() => navigate(`/community/post/${post.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {post.author_name.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {post.author_name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {post.author_role === 'specialist' ? (language === 'ar' ? 'مختص' : 'Specialist') : 
                             post.author_role === 'student' ? (language === 'ar' ? 'طالب' : 'Student') : 
                             (language === 'ar' ? 'مدير' : 'Admin')}
                          </Badge>
                          {post.author_university && (
                            <Badge variant="outline" className="text-xs">
                              🏛️ {post.author_university}
                            </Badge>
                          )}
                          {post.author_major && (
                            <Badge variant="outline" className="text-xs">
                              📚 {post.author_major}
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                        {post.author_academic_level && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">
                              {language === 'ar' ? 'المستوى الأكاديمي: ' : 'Academic Level: '}{post.author_academic_level}
                            </span>
                          </div>
                        )}
                        
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2" dir={language}>
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2" dir={language}>
                          {post.content}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.major_tags?.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              📚 {tag}
                            </Badge>
                          ))}
                          {post.university_tags?.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              🏛️ {tag}
                            </Badge>
                          ))}
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.answers_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views_count}</span>
                          </div>
                          {post.is_solved && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>{language === 'ar' ? 'محلول' : 'Solved'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}
