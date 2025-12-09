import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
  const [isTargeted, setIsTargeted] = useState(false);
  const [targetType, setTargetType] = useState<'major' | 'university' | null>(null);
  const [targetMajorId, setTargetMajorId] = useState<string | null>(null);
  const [targetUniversityId, setTargetUniversityId] = useState<string | null>(null);
  const [targetMajorSearch, setTargetMajorSearch] = useState('');
  const [targetUniversitySearch, setTargetUniversitySearch] = useState('');
  const [showTargetMajorDropdown, setShowTargetMajorDropdown] = useState(false);
  const [showTargetUniversityDropdown, setShowTargetUniversityDropdown] = useState(false);
  const { language } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const universityDropdownRef = useRef<HTMLDivElement>(null);
  const majorDropdownRef = useRef<HTMLDivElement>(null);
  const targetMajorDropdownRef = useRef<HTMLDivElement>(null);
  const targetUniversityDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close university dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (universityDropdownRef.current && !universityDropdownRef.current.contains(event.target as Node)) {
        setShowUniversityDropdown(false);
      }
    };

    if (showUniversityDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUniversityDropdown]);

  // Close major dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (majorDropdownRef.current && !majorDropdownRef.current.contains(event.target as Node)) {
        setShowMajorDropdown(false);
      }
    };

    if (showMajorDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMajorDropdown]);

  // Close target major dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (targetMajorDropdownRef.current && !targetMajorDropdownRef.current.contains(event.target as Node)) {
        setShowTargetMajorDropdown(false);
      }
    };

    if (showTargetMajorDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTargetMajorDropdown]);

  // Close target university dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (targetUniversityDropdownRef.current && !targetUniversityDropdownRef.current.contains(event.target as Node)) {
        setShowTargetUniversityDropdown(false);
      }
    };

    if (showTargetUniversityDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTargetUniversityDropdown]);

  // Filtered lists for targeting
  const filteredTargetMajors = majors.filter(major => {
    if (!targetMajorSearch) return true;
    const searchLower = targetMajorSearch.toLowerCase();
    const name = (language === 'ar' && major.name_ar ? major.name_ar : major.name).toLowerCase();
    return name.includes(searchLower);
  });

  const filteredTargetUniversities = universities.filter(university => {
    if (!targetUniversitySearch) return true;
    const searchLower = targetUniversitySearch.toLowerCase();
    const name = (language === 'ar' && university.name_ar ? university.name_ar : university.name).toLowerCase();
    return name.includes(searchLower);
  });

  
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

    // Check minimum length
    if (formData.title.trim().length < 10) {
      toast.error(
        language === 'ar'
          ? 'العنوان قصير جداً (10 أحرف على الأقل)'
          : 'Title is too short (minimum 10 characters)'
      );
      return;
    }

    if (formData.content.trim().length < 20) {
      toast.error(
        language === 'ar'
          ? 'المحتوى قصير جداً (20 حرف على الأقل)'
          : 'Content is too short (minimum 20 characters)'
      );
      return;
    }

    // Validate targeting
    if (isTargeted) {
      if (!targetType) {
        toast.error(language === 'ar' ? 'يرجى اختيار نوع الاستهداف (تخصص أو جامعة)' : 'Please select target type (Major or University)');
        return;
      }
      if (targetType === 'major' && !targetMajorId) {
        toast.error(language === 'ar' ? 'يرجى اختيار التخصص المستهدف' : 'Please select a target major');
        return;
      }
      if (targetType === 'university' && !targetUniversityId) {
        toast.error(language === 'ar' ? 'يرجى اختيار الجامعة المستهدفة' : 'Please select a target university');
        return;
      }
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

      const createdPost = await createCommunityPost(
        {
          ...formData,
          post_type: safePostType,
          is_targeted: isTargeted,
          target_type: isTargeted ? targetType : undefined,
          target_major_id: isTargeted && targetType === 'major' ? targetMajorId : undefined,
          target_university_id: isTargeted && targetType === 'university' ? targetUniversityId : undefined,
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

      // Show different messages based on approval status
      if (createdPost.approval_status === 'pending') {
        toast.success(
          language === 'ar' 
            ? 'تم إنشاء المنشور بنجاح! سيتم مراجعته من قبل المشرف قبل النشر.' 
            : 'Post created successfully! It will be reviewed by an admin before being published.'
        );
      } else {
        toast.success(language === 'ar' ? 'تم إنشاء المنشور بنجاح' : 'Post created successfully');
      }
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
    
    // Check if maximum limit reached
    if ((formData.university_tags || []).length >= 3) {
      toast.error(language === 'ar' ? 'يمكنك إضافة 3 جامعات كحد أقصى' : 'You can add maximum 3 universities');
      return;
    }
    
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
    
    // Check if maximum limit reached
    if ((formData.major_tags || []).length >= 5) {
      toast.error(language === 'ar' ? 'يمكنك إضافة 5 تخصصات كحد أقصى' : 'You can add maximum 5 majors');
      return;
    }
    
    if (!formData.major_tags?.includes(majorName)) {
      setFormData(prev => ({
        ...prev,
        major_tags: [...(prev.major_tags || []), majorName]
      }));
    }
    setMajorSearch('');
    setShowMajorDropdown(false);
  };

  const filteredUniversities = universities.filter((uni) => {
    const name = language === 'ar' && uni.name_ar ? uni.name_ar : uni.name;
    return name.toLowerCase().includes(universitySearch.toLowerCase());
  });

  const filteredMajors = majors.filter((major) => {
    const name = language === 'ar' && major.name_ar ? major.name_ar : major.name;
    return name.toLowerCase().includes(majorSearch.toLowerCase());
  });

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
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2" dir={language}>
                {language === 'ar' ? 'اسأل سؤالاً أو ناقش ما يدور في ذهنك' : 'Ask a question or discuss what\'s on your mind'}
              </p>
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2" dir={language}>
                    {language === 'ar' ? 'إضافة علامات الجامعات تساعد منشورك في الوصول إلى الجمهور المناسب' : 'Adding university tags helps your post reach the right audience'}
                  </p>
                  <div className="relative" ref={universityDropdownRef}>
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
                        {showUniversityDropdown && filteredUniversities.length > 0 && (
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
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                      {formData.university_tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1 text-xs sm:text-sm flex-shrink-0">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2" dir={language}>
                    {language === 'ar' ? 'إضافة علامات التخصصات تساعد منشورك في الوصول إلى الجمهور المناسب' : 'Adding major tags helps your post reach the right audience'}
                  </p>
                  <div className="relative" ref={majorDropdownRef}>
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
                        {showMajorDropdown && filteredMajors.length > 0 && (
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
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                      {formData.major_tags?.map((tag, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1 text-xs sm:text-sm flex-shrink-0">
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

                {/* Post Targeting Section */}
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="is-targeted"
                      checked={isTargeted}
                      onCheckedChange={(checked) => {
                        setIsTargeted(checked as boolean);
                        if (!checked) {
                          setTargetType(null);
                          setTargetMajorId(null);
                          setTargetUniversityId(null);
                        }
                      }}
                    />
                    <Label htmlFor="is-targeted" className="text-sm font-medium cursor-pointer" dir={language}>
                      {language === 'ar' 
                        ? 'استهداف السؤال لتخصص أو جامعة معينة (اختياري)' 
                        : 'Target this question to a specific Major or University (Optional)'}
                    </Label>
                  </div>

                  {isTargeted && (
                    <div className="space-y-4 pl-6 border-l-2 border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400" dir={language}>
                        {language === 'ar' 
                          ? 'عند الاستهداف، فقط الطلاب/المتخصصون من التخصص أو الجامعة المحددة يمكنهم الإجابة والتعليق' 
                          : 'When targeted, only students/specialists from the selected Major or University can respond and comment'}
                      </p>

                      <RadioGroup
                        value={targetType || ''}
                        onValueChange={(value) => {
                          setTargetType(value as 'major' | 'university' | null);
                          setTargetMajorId(null);
                          setTargetUniversityId(null);
                          setTargetMajorSearch('');
                          setTargetUniversitySearch('');
                        }}
                        dir={language}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="major" id="target-major" />
                          <Label htmlFor="target-major" className="cursor-pointer" dir={language}>
                            {language === 'ar' ? 'استهداف تخصص معين' : 'Target Specific Major'}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="university" id="target-university" />
                          <Label htmlFor="target-university" className="cursor-pointer" dir={language}>
                            {language === 'ar' ? 'استهداف جامعة معينة' : 'Target Specific University'}
                          </Label>
                        </div>
                      </RadioGroup>

                      {/* Target Major Selection */}
                      {targetType === 'major' && (
                        <div className="relative" ref={targetMajorDropdownRef}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir={language}>
                            {language === 'ar' ? 'اختر التخصص المستهدف' : 'Select Target Major'}
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={targetMajorSearch}
                              onChange={(e) => {
                                setTargetMajorSearch(e.target.value);
                                setShowTargetMajorDropdown(true);
                              }}
                              onFocus={() => setShowTargetMajorDropdown(true)}
                              placeholder={language === 'ar' ? 'ابحث عن تخصص...' : 'Search for a major...'}
                              className="rounded-xl pl-10"
                              dir={language}
                            />
                            {showTargetMajorDropdown && filteredTargetMajors.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                {filteredTargetMajors.map((major) => {
                                  const majorName = language === 'ar' && major.name_ar ? major.name_ar : major.name;
                                  return (
                                    <button
                                      key={major.id}
                                      type="button"
                                      onClick={() => {
                                        setTargetMajorId(major.id);
                                        setTargetMajorSearch(majorName);
                                        setShowTargetMajorDropdown(false);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl"
                                    >
                                      {majorName}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {targetMajorId && (
                            <div className="mt-2">
                              <Badge variant="default" className="flex items-center gap-1 w-fit">
                                {language === 'ar' && majors.find(m => m.id === targetMajorId)?.name_ar 
                                  ? majors.find(m => m.id === targetMajorId)?.name_ar 
                                  : majors.find(m => m.id === targetMajorId)?.name}
                                <X 
                                  className="w-3 h-3 cursor-pointer" 
                                  onClick={() => {
                                    setTargetMajorId(null);
                                    setTargetMajorSearch('');
                                  }}
                                />
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Target University Selection */}
                      {targetType === 'university' && (
                        <div className="relative" ref={targetUniversityDropdownRef}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" dir={language}>
                            {language === 'ar' ? 'اختر الجامعة المستهدفة' : 'Select Target University'}
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={targetUniversitySearch}
                              onChange={(e) => {
                                setTargetUniversitySearch(e.target.value);
                                setShowTargetUniversityDropdown(true);
                              }}
                              onFocus={() => setShowTargetUniversityDropdown(true)}
                              placeholder={language === 'ar' ? 'ابحث عن جامعة...' : 'Search for a university...'}
                              className="rounded-xl pl-10"
                              dir={language}
                            />
                            {showTargetUniversityDropdown && filteredTargetUniversities.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                {filteredTargetUniversities.map((university) => {
                                  const universityName = language === 'ar' && university.name_ar ? university.name_ar : university.name;
                                  return (
                                    <button
                                      key={university.id}
                                      type="button"
                                      onClick={() => {
                                        setTargetUniversityId(university.id);
                                        setTargetUniversitySearch(universityName);
                                        setShowTargetUniversityDropdown(false);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl"
                                    >
                                      {universityName}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {targetUniversityId && (
                            <div className="mt-2">
                              <Badge variant="default" className="flex items-center gap-1 w-fit">
                                {language === 'ar' && universities.find(u => u.id === targetUniversityId)?.name_ar 
                                  ? universities.find(u => u.id === targetUniversityId)?.name_ar 
                                  : universities.find(u => u.id === targetUniversityId)?.name}
                                <X 
                                  className="w-3 h-3 cursor-pointer" 
                                  onClick={() => {
                                    setTargetUniversityId(null);
                                    setTargetUniversitySearch('');
                                  }}
                                />
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
