import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageAnimation } from "@/components/animations/PageAnimation";
import { ArrowLeft, X, Plus, Search } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import type { CreatePostRequest } from '@/types/community';
import type { University, Major } from '@/types/database';
import { getUniversities } from '@/lib/universitiesApi';
import { getMajors } from '@/lib/majorsApi';
import { searchWithFuzzy } from '@/lib/fuzzySearch';
import { analyzeContent } from '@/lib/contentFilter';
import { toast } from 'sonner';
import { createCommunityPost } from '@/lib/communityApi';

export default function CreatePost() {
  const [formData, setFormData] = useState<CreatePostRequest>({
    title: '',
    content: '',
    post_type: 'question',
    tags: [],
    major_tags: [],
    university_tags: []
  });
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [universitySearch, setUniversitySearch] = useState('');
  const [majorSearch, setMajorSearch] = useState('');
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const { language } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if profile is complete
  const isProfileComplete = user && user.role && user.gender;

  const normalizedRole = user?.role?.toLowerCase?.();
  const canSelectPostType = user?.is_admin || normalizedRole === 'specialist';
  const postTypes = canSelectPostType
    ? [
        { id: 'question', label: language === 'ar' ? 'سؤال' : 'Question' },
        { id: 'discussion', label: language === 'ar' ? 'مناقشة' : 'Discussion' }
      ]
    : [{ id: 'question', label: language === 'ar' ? 'سؤال' : 'Question' }];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [universitiesData, majorsData] = await Promise.all([
          getUniversities({}),
          getMajors({})
        ]);
        setUniversities(universitiesData);
        setMajors(majorsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error(language === 'ar' ? 'Please fill all required fields' : 'Please fill all required fields');
      return;
    }

    // Content moderation
    const titleAnalysis = analyzeContent(formData.title, language);
    const contentAnalysis = analyzeContent(formData.content, language);

    if (!titleAnalysis.isAllowed) {
      toast.error(language === 'ar' ? 
        `Title not allowed: ${titleAnalysis.issues.join(', ')}` :
        `Title not allowed: ${titleAnalysis.issues.join(', ')}`
      );
      return;
    }

    if (!contentAnalysis.isAllowed) {
      toast.error(language === 'ar' ? 
        `Content not allowed: ${contentAnalysis.issues.join(', ')}` :
        `Content not allowed: ${contentAnalysis.issues.join(', ')}`
      );
      return;
    }

    // Show warnings for medium severity issues
    if (titleAnalysis.severity === 'medium' || contentAnalysis.severity === 'medium') {
      const allIssues = [...titleAnalysis.issues, ...contentAnalysis.issues];
      toast.warning(language === 'ar' ? 
        `Warning: ${allIssues.join(', ')}` :
        `Warning: ${allIssues.join(', ')}`
      );
    }

    setLoading(true);
    try {
      const safePostType = canSelectPostType ? formData.post_type : 'question';
      if (!canSelectPostType && formData.post_type !== 'question') {
        toast.info(language === 'ar' ? 'الطلاب يمكنهم نشر الأسئلة فقط' : 'Students can only create questions');
      }

      await createCommunityPost(
        {
          ...formData,
          post_type: safePostType,
        },
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

      toast.success(language === 'ar' ? 'Post created successfully' : 'Post created successfully');
      navigate('/community');
    } catch (error: any) {
      console.error('Error creating post:', error);
      const message = error?.message || (language === 'ar' ? 'Failed to create post' : 'Failed to create post');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const removeTag = (type: 'major_tags' | 'university_tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type]!.filter((_, i) => i !== index)
    }));
  };

  const addUniversity = (university: University) => {
    const universityName = language === 'ar' && university.name_ar ? university.name_ar : university.name;
    if (!formData.university_tags?.includes(universityName)) {
      setFormData(prev => ({
        ...prev,
        university_tags: [...(prev.university_tags || []), universityName]
      }));
    }
    setUniversitySearch('');
    setShowUniversityDropdown(false);
  };

  const addMajor = (major: Major) => {
    const majorName = language === 'ar' && major.name_ar ? major.name_ar : major.name;
    if (!formData.major_tags?.includes(majorName)) {
      setFormData(prev => ({
        ...prev,
        major_tags: [...(prev.major_tags || []), majorName]
      }));
    }
    setMajorSearch('');
    setShowMajorDropdown(false);
  };

  const filteredUniversities = searchWithFuzzy(
    universities,
    universitySearch,
    (uni) => {
      const name = language === 'ar' && uni.name_ar ? uni.name_ar : uni.name;
      return name;
    },
    5
  );

  const filteredMajors = searchWithFuzzy(
    majors,
    majorSearch,
    (major) => {
      const name = language === 'ar' && major.name_ar ? major.name_ar : major.name;
      return name;
    },
    5
  );

  return (
    <PageAnimation>
      <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
        <Navbar />
        
        <div className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
            {/* Header */}
            <div className="mb-8">
              <Button
                onClick={() => navigate('/community')}
                variant="ghost"
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'العودة إلى المجتمع' : 'Back to Community'}
              </Button>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100" dir={language}>
                {language === 'ar' ? 'إنشاء منشور جديد' : 'Create New Post'}
              </h1>
            </div>

            {/* Profile Completion Check */}
            {!isProfileComplete ? (
              <Card className="p-8 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {language === 'ar' ? 'الملف الشخصي غير مكتمل' : 'Profile Incomplete'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6" dir={language}>
                    {language === 'ar'
                      ? 'الرجاء إكمال ملفك الشخصي قبل إنشاء منشور في المجتمع'
                      : 'Please complete your profile before creating a community post'}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => navigate('/profile-setup')}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl px-8"
                    >
                      {language === 'ar' ? 'إكمال الملف الشخصي' : 'Complete Profile'}
                    </Button>
                    <Button
                      onClick={() => navigate('/community')}
                      variant="outline"
                      className="rounded-2xl px-8"
                    >
                      {language === 'ar' ? 'العودة' : 'Go Back'}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              /* Form */
              <Card className="p-8 card-hover">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Post Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir={language}>
                    {language === 'ar' ? 'Post Type' : 'Post Type'}
                  </label>
                  <div className="flex gap-4">
                    {postTypes.map((type) => (
                      <Button
                        key={type.id}
                        type="button"
                        variant={formData.post_type === type.id ? 'default' : 'outline'}
                        onClick={() => setFormData(prev => ({ ...prev, post_type: type.id as any }))}
                        disabled={!canSelectPostType && type.id !== 'question'}
                        className="rounded-xl"
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                  {!canSelectPostType && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'Students can post questions. Discussions are reserved for specialists and admins.' : 'Students can post questions. Discussions are reserved for specialists and admins.'}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir={language}>
                    {language === 'ar' ? 'العنوان' : 'Title'} *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={language === 'ar' ? 'اكتب عنوان المنشور...' : 'Write your post title...'}
                    className="rounded-xl"
                    dir={language}
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir={language}>
                    {language === 'ar' ? 'المحتوى' : 'Content'} *
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={language === 'ar' ? 'اكتب محتوى المنشور...' : 'Write your post content...'}
                    className="rounded-xl min-h-32"
                    dir={language}
                    required
                  />
                </div>

                {/* Universities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir={language}>
                    {language === 'ar' ? 'الجامعات' : 'Universities'}
                  </label>
                  <div className="relative">
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          value={universitySearch}
                          onChange={(e) => {
                            setUniversitySearch(e.target.value);
                            setShowUniversityDropdown(true);
                          }}
                          onFocus={() => setShowUniversityDropdown(true)}
                          placeholder={language === 'ar' ? 'ابحث عن جامعة...' : 'Search universities...'}
                          className="rounded-xl pl-10"
                          dir={language}
                        />
                        {showUniversityDropdown && universitySearch && filteredUniversities.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                            {filteredUniversities.map((university) => {
                              const universityName = language === 'ar' && university.name_ar ? university.name_ar : university.name;
                              return (
                                <button
                                  key={university.id}
                                  type="button"
                                  onClick={() => addUniversity(university)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl"
                                >
                                  {universityName}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.university_tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          🏛️ {tag}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeTag('university_tags', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Majors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir={language}>
                    {language === 'ar' ? 'التخصصات' : 'Majors'}
                  </label>
                  <div className="relative">
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          value={majorSearch}
                          onChange={(e) => {
                            setMajorSearch(e.target.value);
                            setShowMajorDropdown(true);
                          }}
                          onFocus={() => setShowMajorDropdown(true)}
                          placeholder={language === 'ar' ? 'ابحث عن تخصص...' : 'Search majors...'}
                          className="rounded-xl pl-10"
                          dir={language}
                        />
                        {showMajorDropdown && majorSearch && filteredMajors.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                            {filteredMajors.map((major) => {
                              const majorName = language === 'ar' && major.name_ar ? major.name_ar : major.name;
                              return (
                                <button
                                  key={major.id}
                                  type="button"
                                  onClick={() => addMajor(major)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl"
                                >
                                  {majorName}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.major_tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          📚 {tag}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeTag('major_tags', index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>



                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/community')}
                    className="rounded-xl"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? (language === 'ar' ? 'جاري النشر...' : 'Publishing...') : 
                              (language === 'ar' ? 'نشر المنشور' : 'Publish Post')}
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
