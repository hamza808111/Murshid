import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { PageAnimation } from "@/components/animations/PageAnimation";
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Eye, 
  CheckCircle,
  Send,
  ThumbsUp
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Post, Answer } from '@/types/community';
import { analyzeContent } from '@/lib/contentFilter';
import { toast } from 'sonner';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { language } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchPostDetails();
    }
  }, [id]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      // Get posts from localStorage
      const savedPosts = localStorage.getItem('community_posts');
      const createdPosts = savedPosts ? JSON.parse(savedPosts) : [];
      
      // Mock data
      const mockPosts = [
        {
          id: '1',
          title: 'What are the best programming languages for software engineering?',
          content: 'I am planning to study software engineering and wondering which programming languages I should focus on. I have heard about Python, Java, and JavaScript, but I am not sure which ones are most important for getting a job in Saudi Arabia.',
          author_id: '1',
          author_name: 'Ahmed Ali',
          author_role: 'student' as const,
          post_type: 'question' as const,
          tags: ['programming', 'career'],
          major_tags: ['Software Engineering'],
          university_tags: [],
          likes_count: 15,
          answers_count: 3,
          views_count: 120,
          is_solved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      const allPosts = [...createdPosts, ...mockPosts];
      const foundPost = allPosts.find(p => p.id === id);
      
      if (foundPost) {
        setPost(foundPost);
        
        // Get answers from localStorage
        const savedAnswers = localStorage.getItem(`post_answers_${id}`);
        const postAnswers = savedAnswers ? JSON.parse(savedAnswers) : [];
        
        // Add mock answer for the mock post
        if (id === '1') {
          const mockAnswers = [
            {
              id: '1',
              post_id: '1',
              content: 'Based on my experience in the Saudi tech industry, I would recommend starting with Java and Python. Java is widely used in enterprise applications, while Python is great for data science and web development.',
              author_id: '2',
              author_name: 'Dr. Sarah Ahmed',
              author_role: 'specialist' as const,
              likes_count: 8,
              is_accepted: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          setAnswers([...postAnswers, ...mockAnswers]);
        } else {
          setAnswers(postAnswers);
        }
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
      toast.error('Failed to load post details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is trying to answer their own question
    if (post && post.author_id === user.id) {
      toast.error(language === 'ar' ? 'لا يمكنك الإجابة على سؤالك الخاص' : 'You cannot answer your own question');
      return;
    }

    if (!newAnswer.trim()) {
      toast.error(language === 'ar' ? 'يرجى كتابة إجابة' : 'Please write an answer');
      return;
    }

    // Content moderation for answers
    const answerAnalysis = analyzeContent(newAnswer, language);
    
    if (!answerAnalysis.isAllowed) {
      toast.error(language === 'ar' ? 
        `إجابة غير مناسبة: ${answerAnalysis.issues.join(', ')}` :
        `Answer not allowed: ${answerAnalysis.issues.join(', ')}`
      );
      return;
    }
    
    if (answerAnalysis.severity === 'medium') {
      toast.warning(language === 'ar' ? 
        `تحذير: ${answerAnalysis.issues.join(', ')}` :
        `Warning: ${answerAnalysis.issues.join(', ')}`
      );
    }

    setSubmitting(true);
    try {
      // Create new answer
      const newAnswerObj = {
        id: Date.now().toString(),
        post_id: id!,
        content: newAnswer,
        author_id: user.id,
        author_name: user.name || 'Anonymous',
        author_role: user.role || 'student',
        author_university: user.university,
        author_major: user.major,
        author_academic_level: user.academic_level,
        likes_count: 0,
        is_accepted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Save to localStorage
      const savedAnswers = localStorage.getItem(`post_answers_${id}`);
      const existingAnswers = savedAnswers ? JSON.parse(savedAnswers) : [];
      const updatedAnswers = [newAnswerObj, ...existingAnswers];
      localStorage.setItem(`post_answers_${id}`, JSON.stringify(updatedAnswers));
      
      toast.success(language === 'ar' ? 'تم إرسال الإجابة' : 'Answer submitted');
      setNewAnswer('');
      fetchPostDetails(); // Refresh to show new answer
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error(language === 'ar' ? 'فشل في إرسال الإجابة' : 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
        <Navbar />
        <div className="py-20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
        <Navbar />
        <div className="py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {language === 'ar' ? 'المنشور غير موجود' : 'Post not found'}
          </h2>
          <Button onClick={() => navigate('/community')}>
            {language === 'ar' ? 'العودة إلى المجتمع' : 'Back to Community'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageAnimation>
      <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
        <Navbar />
        
        <div className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
            {/* Back Button */}
            <Button
              onClick={() => navigate('/community')}
              variant="ghost"
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'العودة إلى المجتمع' : 'Back to Community'}
            </Button>

            {/* Post */}
            <Card className="p-8 mb-8 card-hover">
              <div className="flex items-start gap-4 mb-6">
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
                  
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4" dir={language}>
                    {post.title}
                  </h1>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed" dir={language}>
                    {post.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
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
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes_count}</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.answers_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Answers */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6" dir={language}>
                {language === 'ar' ? `الإجابات (${answers.length})` : `Answers (${answers.length})`}
              </h2>
              
              <div className="space-y-6">
                {answers.map((answer) => (
                  <Card key={answer.id} className="p-6 card-hover">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                          {answer.author_name.charAt(0)}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {answer.author_name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {answer.author_role === 'specialist' ? (language === 'ar' ? 'مختص' : 'Specialist') : 
                             answer.author_role === 'student' ? (language === 'ar' ? 'طالب' : 'Student') : 
                             (language === 'ar' ? 'مدير' : 'Admin')}
                          </Badge>
                          {answer.author_university && (
                            <Badge variant="outline" className="text-xs">
                              🏛️ {answer.author_university}
                            </Badge>
                          )}
                          {answer.author_major && (
                            <Badge variant="outline" className="text-xs">
                              📚 {answer.author_major}
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(answer.created_at)}
                          </span>
                        </div>
                        {answer.author_academic_level && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">
                              {language === 'ar' ? 'المستوى الأكاديمي: ' : 'Academic Level: '}{answer.author_academic_level}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" dir={language}>
                          {answer.content}
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{answer.likes_count}</span>
                          </Button>
                          {answer.is_accepted && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">{language === 'ar' ? 'إجابة مقبولة' : 'Accepted'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Answer Form - Only show if user is not the post author */}
            {user && post && post.author_id !== user.id && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4" dir={language}>
                  {language === 'ar' ? 'اكتب إجابتك' : 'Write Your Answer'}
                </h3>
                
                <form onSubmit={handleSubmitAnswer}>
                  <Textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب إجابتك هنا...' : 'Write your answer here...'}
                    className="rounded-xl min-h-32 mb-4"
                    dir={language}
                    required
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submitting ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : 
                                   (language === 'ar' ? 'إرسال الإجابة' : 'Submit Answer')}
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}