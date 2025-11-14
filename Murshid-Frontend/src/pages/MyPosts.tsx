import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageAnimation } from "@/components/animations/PageAnimation";
import { ScrollAnimation } from "@/components/animations/ScrollAnimation";
import { 
  ArrowLeft, 
  MessageCircle, 
  Heart, 
  Eye, 
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Post, Answer } from '@/types/community';

export default function MyPosts() {
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'answers'>('posts');
  const { language } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserContent();
    }
  }, [user]);

  const fetchUserContent = () => {
    // Get user's posts from localStorage
    const savedPosts = localStorage.getItem('community_posts');
    const allPosts = savedPosts ? JSON.parse(savedPosts) : [];
    const myPosts = allPosts.filter((post: Post) => post.author_id === user?.id);
    setUserPosts(myPosts);

    // Get user's answers from localStorage
    const myAnswers: Answer[] = [];
    allPosts.forEach((post: Post) => {
      const savedAnswers = localStorage.getItem(`post_answers_${post.id}`);
      if (savedAnswers) {
        const postAnswers = JSON.parse(savedAnswers);
        const userPostAnswers = postAnswers.filter((answer: Answer) => answer.author_id === user?.id);
        myAnswers.push(...userPostAnswers);
      }
    });
    setUserAnswers(myAnswers);
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

  const deletePost = (postId: string) => {
    const savedPosts = localStorage.getItem('community_posts');
    if (savedPosts) {
      const allPosts = JSON.parse(savedPosts);
      const updatedPosts = allPosts.filter((post: Post) => post.id !== postId);
      localStorage.setItem('community_posts', JSON.stringify(updatedPosts));
      fetchUserContent();
    }
  };

  return (
    <PageAnimation>
      <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
        <Navbar />
        
        <div className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
            {/* Header */}
            <ScrollAnimation>
              <div className="mb-8">
                <Button
                  onClick={() => navigate('/community')}
                  variant="ghost"
                  className="mb-4 rounded-2xl px-6 py-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'العودة إلى المجتمع' : 'Back to Community'}
                </Button>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4" dir={language}>
                  {language === 'ar' ? 'منشوراتي وإجاباتي' : 'My Posts & Answers'}
                </h1>
                
              
                <div className="flex gap-4  " >
                  <Button
                    variant={activeTab === 'posts' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('posts')}
                    className={`rounded-2xl px-6 py-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      activeTab === 'posts' 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {language === 'ar' ? `منشوراتي (${userPosts.length})` : `My Posts (${userPosts.length})`}
                  </Button>
                  <Button
                    variant={activeTab === 'answers' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('answers')}
                    className={`rounded-2xl px-6 py-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      activeTab === 'answers' 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    {language === 'ar' ? `إجاباتي (${userAnswers.length})` : `My Answers (${userAnswers.length})`}
                  </Button>
                </div>
              </div>
            </ScrollAnimation>

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <ScrollAnimation key={post.id}>
                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {post.post_type === 'question' ? (language === 'ar' ? 'سؤال' : 'Question') : (language === 'ar' ? 'نقاش' : 'Discussion')}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatTimeAgo(post.created_at)}
                              </span>
                            </div>
                            
                            <h3 
                              className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 cursor-pointer hover:text-blue-600" 
                              dir={language}
                              onClick={() => navigate(`/community/post/${post.id}`)}
                            >
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
                          
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePost(post.id)}
                              className="text-red-500 hover:text-red-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </ScrollAnimation>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2" dir={language}>
                      {language === 'ar' ? 'لا توجد منشورات' : 'No Posts Yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4" dir={language}>
                      {language === 'ar' ? 'ابدأ بإنشاء منشورك الأول' : 'Start by creating your first post'}
                    </p>
                    <Button 
                      onClick={() => navigate('/community/create')}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-8 py-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      {language === 'ar' ? 'إنشاء منشور' : 'Create Post'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Answers Tab */}
            {activeTab === 'answers' && (
              <div className="space-y-6">
                {userAnswers.length > 0 ? (
                  userAnswers.map((answer) => (
                    <ScrollAnimation key={answer.id}>
                      <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-500">
                                {language === 'ar' ? 'أجبت منذ' : 'Answered'} {formatTimeAgo(answer.created_at)}
                              </span>
                              {answer.is_accepted && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {language === 'ar' ? 'مقبولة' : 'Accepted'}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" dir={language}>
                              {answer.content}
                            </p>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Heart className="w-4 h-4" />
                                <span>{answer.likes_count}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/community/post/${answer.post_id}`)}
                                className="text-blue-600 hover:text-blue-800 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                              >
                                {language === 'ar' ? 'عرض المنشور' : 'View Post'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </ScrollAnimation>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2" dir={language}>
                      {language === 'ar' ? 'لا توجد إجابات' : 'No Answers Yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300" dir={language}>
                      {language === 'ar' ? 'ابدأ بالإجابة على أسئلة المجتمع' : 'Start by answering community questions'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}