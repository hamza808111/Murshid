import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageAnimation } from "@/components/animations/PageAnimation";
import {
  ArrowLeft,
  MessageCircle,
  Eye,
  CheckCircle,
  Send,
  Edit2,
  Trash2,
  MoreVertical,
  Check,
  Heart
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Post, Answer } from '@/types/community';
import { analyzeContent } from '@/lib/contentFilter';
import { toast } from 'sonner';
import {
  getCommunityPostById,
  getPostAnswers,
  createCommunityAnswer,
  incrementPostViews,
  getUserPostLike,
  getUserAnswerLike,
  likePost,
  unlikePost,
  likeAnswer,
  unlikeAnswer,
  acceptAnswer,
  unacceptAnswer,
  deleteCommunityAnswer
} from '@/lib/communityApi';
import { LikeButton } from '@/components/community/LikeButton';
import { CommentSection } from '@/components/community/CommentSection';
import { EditPostModal } from '@/components/community/EditPostModal';
import { EditAnswerModal } from '@/components/community/EditAnswerModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import ReportButton from '@/components/community/ReportButton';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [answerLikes, setAnswerLikes] = useState<Record<string, boolean>>({});
  const [editingPost, setEditingPost] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);
  const [showAnswerFormInline, setShowAnswerFormInline] = useState(false);
  const [deleteAnswerId, setDeleteAnswerId] = useState<string | null>(null);
  const answerFormRef = useRef<HTMLDivElement>(null);
  const answerTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { language } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isProfileComplete = user && (user.is_admin || (user.role && user.gender));
  const isPostAuthor = user && post && post.author_id === user.id;

  useEffect(() => {
    if (id) {
      fetchPostDetails();
      // Increment view count
      incrementPostViews(id).catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    // Load like status for post
    if (user && post) {
      getUserPostLike(post.id, user.id).then(setIsPostLiked).catch(() => setIsPostLiked(false));
    }
  }, [user, post?.id]);

  useEffect(() => {
    // Load like statuses for answers
    if (user && answers.length > 0) {
      Promise.all(
        answers.map(answer => getUserAnswerLike(answer.id, user.id))
      ).then(likes => {
        const likesMap: Record<string, boolean> = {};
        answers.forEach((answer, idx) => {
          likesMap[answer.id] = likes[idx];
        });
        setAnswerLikes(likesMap);
      }).catch(() => {
        // On error, set all to false
        setAnswerLikes({});
      });
    }
  }, [user, answers]);

  const fetchPostDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [fetchedPost, fetchedAnswers] = await Promise.all([
        getCommunityPostById(id),
        getPostAnswers(id)
      ]);

      if (!fetchedPost) {
        toast.error(language === 'ar' ? 'المنشور غير موجود' : 'Post not found');
        navigate('/community');
        return;
      }

      setPost(fetchedPost);
      setAnswers(fetchedAnswers);
    } catch (error) {
      console.error('Error fetching post details:', error);
      toast.error(language === 'ar' ? 'فشل تحميل تفاصيل المنشور' : 'Failed to load post details');
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

    if (!isProfileComplete) {
      toast.error(
        language === 'ar'
          ? 'الرجاء إكمال ملفك الشخصي قبل الإجابة'
          : 'Please complete your profile before answering'
      );
      return;
    }

    if (post && post.author_id === user.id) {
      toast.error(language === 'ar' ? 'لا يمكنك الإجابة على سؤالك الخاص' : 'You cannot answer your own question');
      return;
    }

    if (!newAnswer.trim()) {
      toast.error(language === 'ar' ? 'الرجاء كتابة إجابة' : 'Please write an answer');
      return;
    }

    const answerAnalysis = analyzeContent(newAnswer, language);

    if (!answerAnalysis.isAllowed) {
      toast.error(language === 'ar' ?
        `الإجابة غير مسموح بها: ${answerAnalysis.issues.join(', ')}` :
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
      const createdAnswer = await createCommunityAnswer(
        { post_id: id!, content: newAnswer },
        {
          id: user.id,
          name: user.name || user.email,
          role: user.role,
          establishment_name: user.establishment_name,
          track: user.track,
          level: user.level,
          university_id: user.university_id,
          avatar_url: user.avatar_url,
          is_admin: user.is_admin,
        }
      );

      toast.success(language === 'ar' ? 'تم إرسال الإجابة' : 'Answer submitted');
      setNewAnswer('');

      // Update both answers array and post count
      setAnswers(prev => [createdAnswer, ...prev]);
      setPost(prev => prev ? { ...prev, answers_count: (prev.answers_count || 0) + 1 } : prev);
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      const message = error?.message || (language === 'ar' ? 'فشل إرسال الإجابة' : 'Failed to submit answer');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string, currentlyAccepted: boolean) => {
    if (!post) return;

    try {
      if (currentlyAccepted) {
        await unacceptAnswer(post.id, answerId);
        toast.success(language === 'ar' ? 'تم إلغاء قبول الإجابة' : 'Answer unaccepted');
      } else {
        await acceptAnswer(post.id, answerId);
        toast.success(language === 'ar' ? 'تم قبول الإجابة' : 'Answer accepted');
      }

      // Refresh post and answers
      await fetchPostDetails();
    } catch (error) {
      console.error('Error accepting/unaccepting answer:', error);
      toast.error(language === 'ar' ? 'فشل تحديث حالة الإجابة' : 'Failed to update answer status');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    setDeleteAnswerId(answerId);
  };

  const confirmDeleteAnswer = async () => {
    if (!deleteAnswerId || !user) return;

    try {
      await deleteCommunityAnswer(deleteAnswerId, user.id, "User deleted");
      toast.success(language === 'ar' ? 'تم حذف الإجابة' : 'Answer deleted');
      setAnswers(prev => prev.filter(a => a.id !== deleteAnswerId));
      setPost(prev => prev ? { ...prev, answers_count: Math.max(0, (prev.answers_count || 0) - 1) } : prev);
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast.error(language === 'ar' ? 'فشل حذف الإجابة' : 'Failed to delete answer');
    } finally {
      setDeleteAnswerId(null);
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
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
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
          <Button onClick={() => navigate(-1)}>
            {language === 'ar' ? 'رجوع' : 'Back'}
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
              onClick={() => navigate(-1)}
              variant="ghost"
              className="mb-6"
            >
              <ArrowLeft className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {language === 'ar' ? 'رجوع' : 'Back'}
            </Button>

            {/* Post */}
            <Card className={`p-8 mb-8 card-hover ${isPostAuthor ? '!border-2 !border-blue-500 dark:!border-blue-400' : ''}`}>
              <div className="flex items-start gap-4 mb-6">
                <Avatar 
                  className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  onClick={() => navigate(`/user/${post.author_id}`)}
                >
                  <AvatarImage src={post.author_avatar} alt={post.author_name} />
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold">
                    {post.author_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => navigate(`/user/${post.author_id}`)}
                      >
                        {post.author_name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {post.author_role === 'specialist' ? (language === 'ar' ? 'متخصص' : 'Specialist') :
                         post.author_role === 'student' ? (language === 'ar' ? 'طالب' : 'Student') :
                         (language === 'ar' ? 'مشرف' : 'Admin')}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(post.created_at)}
                      </span>
                      {post.is_solved && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {language === 'ar' ? 'محلولة' : 'Solved'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isPostAuthor && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPost(true)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {!isPostAuthor && user && !user.is_admin && (
                        <ReportButton
                          contentType="post"
                          contentId={post.id}
                          contentTitle={post.title}
                        />
                      )}
                    </div>
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

                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed whitespace-pre-wrap" dir={language}>
                    {post.content}
                  </p>

                  {((post.major_tags && post.major_tags.length > 0) || (post.university_tags && post.university_tags.length > 0) || (post.tags && post.tags.length > 0)) && (
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
                  )}

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    {user && user.is_admin ? (
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes_count || 0}</span>
                      </div>
                    ) : (
                      <LikeButton
                        itemId={post.id}
                        itemType="post"
                        initialLikesCount={post.likes_count || 0}
                        initialIsLiked={isPostLiked}
                        onLike={likePost}
                        onUnlike={unlikePost}
                        disabled={!isProfileComplete}
                        onLikeChange={(_, newCount) => {
                          setPost(prev => prev ? { ...prev, likes_count: newCount } : prev);
                        }}
                      />
                    )}
                    {user && user.is_admin ? (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{answers.length}</span>
                      </div>
                    ) : (
                      <>
                        {user && !user.is_admin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAnswerFormInline(!showAnswerFormInline);
                              if (!showAnswerFormInline) {
                                setTimeout(() => answerTextareaRef.current?.focus(), 100);
                              }
                            }}
                            className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{answers.length}</span>
                          </Button>
                        )}
                        {!user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAnswerFormInline(!showAnswerFormInline);
                              if (!showAnswerFormInline) {
                                setTimeout(() => answerTextareaRef.current?.focus(), 100);
                              }
                            }}
                            className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{answers.length}</span>
                          </Button>
                        )}
                      </>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Inline Answer Form (appears below post when comment button clicked) */}
            {showAnswerFormInline && user && post && post.author_id !== user.id && !user.is_admin && (
              <Card className="p-6 mt-4 border-2 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100" dir={language}>
                    {language === 'ar' ? 'اكتب إجابتك' : 'Write Your Answer'}
                  </h3>
                  
                </div>

                {!isProfileComplete ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-center">
                    <p className="text-amber-700 dark:text-amber-300 mb-3">
                      {language === 'ar'
                        ? 'الرجاء إكمال ملفك الشخصي قبل الإجابة'
                        : 'Please complete your profile before answering'}
                    </p>
                    <Button onClick={() => navigate('/profile-setup')} size="sm">
                      {language === 'ar' ? 'إكمال الملف الشخصي' : 'Complete Profile'}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    handleSubmitAnswer(e);
                    setShowAnswerFormInline(false);
                  }}>
                    <Textarea
                      ref={answerTextareaRef}
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب إجابتك هنا...' : 'Write your answer here...'}
                      className="rounded-xl min-h-32 mb-4"
                      dir={language}
                      required
                    />

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAnswerFormInline(false)}
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="rounded-xl bg-blue-500 hover:bg-blue-600"
                      >
                        <Send className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {submitting ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') :
                                     (language === 'ar' ? 'إرسال الإجابة' : 'Submit Answer')}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            )}

            {/* Answers */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6" dir={language}>
                {language === 'ar' ? `الإجابات (${answers.length})` : `Answers (${answers.length})`}
              </h2>

              <div className="space-y-6">
                {answers.map((answer) => {
                  const isAnswerAuthor = user && answer.author_id === user.id;
                  const canAccept = isPostAuthor && !isAnswerAuthor;
                  const canModify = isAnswerAuthor || user?.is_admin;

                  return (
                    <Card key={answer.id} className={`p-6 card-hover ${
                      isAnswerAuthor ? '!border-2 !border-blue-500 dark:!border-blue-400' : ''
                    }`}>
                      <div className="flex items-start gap-4">
                        <Avatar 
                          className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                          onClick={() => navigate(`/user/${answer.author_id}`)}
                        >
                          <AvatarImage src={answer.author_avatar} alt={answer.author_name} />
                          <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-semibold text-sm">
                            {answer.author_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span 
                                className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                onClick={() => navigate(`/user/${answer.author_id}`)}
                              >
                                {answer.author_name}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {answer.author_role === 'specialist' ? (language === 'ar' ? 'متخصص' : 'Specialist') :
                                 answer.author_role === 'student' ? (language === 'ar' ? 'طالب' : 'Student') :
                                 (language === 'ar' ? 'مشرف' : 'Admin')}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatTimeAgo(answer.created_at)}
                              </span>
                              {answer.is_accepted && (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {language === 'ar' ? 'مقبولة' : 'Accepted'}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {canModify && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {isAnswerAuthor && (
                                      <DropdownMenuItem onClick={() => setEditingAnswer(answer)}>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        {language === 'ar' ? 'تعديل' : 'Edit'}
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteAnswer(answer.id)}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      {language === 'ar' ? 'حذف' : 'Delete'}
                                    </DropdownMenuItem>
                                    {!isAnswerAuthor && user && !user.is_admin && (
                                      <DropdownMenuItem asChild>
                                        <div>
                                          <ReportButton
                                            contentType="answer"
                                            contentId={answer.id}
                                            asMenuItem={true}
                                          />
                                        </div>
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                              {!canModify && !isAnswerAuthor && user && !user.is_admin && (
                                <ReportButton
                                  contentType="answer"
                                  contentId={answer.id}
                                />
                              )}
                            </div>
                          </div>
                          {answer.author_academic_level && (
                            <div className="mb-2">
                              <span className="text-xs text-gray-500">
                                {language === 'ar' ? 'المستوى الأكاديمي: ' : 'Academic Level: '}{answer.author_academic_level}
                              </span>
                            </div>
                          )}

                          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap" dir={language}>
                            {answer.content}
                          </p>

                          <div className="flex items-center gap-4">
                            <LikeButton
                              itemId={answer.id}
                              itemType="answer"
                              initialLikesCount={answer.likes_count || 0}
                              initialIsLiked={answerLikes[answer.id] || false}
                              onLike={likeAnswer}
                              onUnlike={unlikeAnswer}
                              disabled={!isProfileComplete}
                              onLikeChange={(answerId, newCount) => {
                                setAnswers(prev => prev.map(a =>
                                  a.id === answerId ? { ...a, likes_count: newCount } : a
                                ));
                              }}
                            />
                            {canAccept && (
                              <Button
                                variant={answer.is_accepted ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleAcceptAnswer(answer.id, answer.is_accepted)}
                                className={answer.is_accepted ? "bg-green-600 hover:bg-green-700" : ""}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                {answer.is_accepted
                                  ? (language === 'ar' ? 'مقبولة' : 'Accepted')
                                  : (language === 'ar' ? 'قبول الإجابة' : 'Accept Answer')}
                              </Button>
                            )}
                          </div>

                          {/* Comments Section */}
                          <CommentSection answerId={answer.id} />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Answer Form */}
            {user && post && post.author_id !== user.id && !user.is_admin && (
              <Card ref={answerFormRef} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4" dir={language}>
                  {language === 'ar' ? 'اكتب إجابتك' : 'Write Your Answer'}
                </h3>

                {!isProfileComplete ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-center">
                    <p className="text-amber-700 dark:text-amber-300 mb-3">
                      {language === 'ar'
                        ? 'الرجاء إكمال ملفك الشخصي قبل الإجابة'
                        : 'Please complete your profile before answering'}
                    </p>
                    <Button onClick={() => navigate('/profile-setup')} size="sm">
                      {language === 'ar' ? 'إكمال الملف الشخصي' : 'Complete Profile'}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitAnswer}>
                    <Textarea
                      ref={answerTextareaRef}
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
                        <Send className={`w-4 h-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                        {submitting ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') :
                                     (language === 'ar' ? 'إرسال الإجابة' : 'Submit Answer')}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      {post && editingPost && (
        <EditPostModal
          post={post}
          isOpen={editingPost}
          onClose={() => setEditingPost(false)}
          onSuccess={(updatedPost) => {
            setPost(updatedPost);
            setEditingPost(false);
          }}
        />
      )}

      {editingAnswer && (
        <EditAnswerModal
          answer={editingAnswer}
          isOpen={!!editingAnswer}
          onClose={() => setEditingAnswer(null)}
          onSuccess={(updatedAnswer) => {
            setAnswers(prev => prev.map(a => a.id === updatedAnswer.id ? updatedAnswer : a));
            setEditingAnswer(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteAnswerId}
        onOpenChange={(open) => !open && setDeleteAnswerId(null)}
        onConfirm={confirmDeleteAnswer}
        title={language === 'ar' ? 'حذف الإجابة' : 'Delete Answer'}
        description={language === 'ar' ? 'هل أنت متأكد من حذف هذه الإجابة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this answer? This action cannot be undone.'}
        confirmText={language === 'ar' ? 'حذف' : 'Delete'}
        destructive={true}
      />
    </PageAnimation>
  );
}
