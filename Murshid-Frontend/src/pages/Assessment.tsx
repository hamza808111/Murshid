import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Clock, Users, Loader2, History, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { PageAnimation } from "@/components/animations/PageAnimation";
import { ScrollAnimation } from "@/components/animations/ScrollAnimation";
import { AssessmentQuiz } from "@/components/AssessmentQuiz";
import { AssessmentResults } from "@/components/AssessmentResults";
import { PreviousTestsDialog } from "@/components/PreviousTestsDialog";
import { analyzeAssessment, AssessmentResult } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type AssessmentState = 'intro' | 'quiz' | 'analyzing' | 'results' | 'error';

const MAX_ATTEMPTS = 3;

// --- Types used for matching AI recommendations to DB ---

type DbMajor = {
  id: string;
  name: string | null;
  name_ar: string | null;
  is_active?: boolean | null;
};

type DbUniversity = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  is_active?: boolean | null;
};

type DbUniversityMajor = {
  major_id: string;
  university_id: string;
  is_available: boolean | null;
};

// crude similarity helper
const nameSimilarity = (a: string, b: string) => {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 80;

  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length < nb.length ? nb : na;

  const firstWord = shorter.split(" ")[0] ?? "";
  if (firstWord && longer.includes(firstWord)) return 60;

  return 0;
};

// Match Gemini recommendations to real majors + universities from DB
const matchRecommendationsToDb = async (result: AssessmentResult): Promise<AssessmentResult> => {
  try {
    // 1) Fetch active majors
    const { data: majors, error: majorsError } = await supabase
      .from("majors")
      .select("id, name, name_ar, is_active")
      .eq("is_active", true);

    if (majorsError) {
      console.error("Failed to fetch majors for matching:", majorsError);
      return result;
    }

    // 2) Fetch major-university mapping
    const { data: uniMajors, error: uniMajorsError } = await supabase
      .from("university_majors")
      .select("major_id, university_id, is_available");

    if (uniMajorsError) {
      console.error("Failed to fetch university_majors:", uniMajorsError);
    }

    // 3) Fetch active universities
    const { data: universities, error: universitiesError } = await supabase
      .from("universities")
      .select("id, name, city, country, is_active")
      .eq("is_active", true);

    if (universitiesError) {
      console.error("Failed to fetch universities:", universitiesError);
    }

    const uniById = new Map<string, DbUniversity>(
      (universities ?? []).map((u: any) => [u.id, u as DbUniversity])
    );

    const enrichedRecs = result.recommendations.map((rec) => {
      const recName = rec.majorName.toLowerCase();

      let bestMajor: DbMajor | null = null;
      let bestScore = 0;

      (majors ?? []).forEach((m: any) => {
        const scoreEn = m.name ? nameSimilarity(recName, m.name) : 0;
        const scoreAr = m.name_ar ? nameSimilarity(recName, m.name_ar) : 0;
        const score = Math.max(scoreEn, scoreAr);
        if (score > bestScore) {
          bestScore = score;
          bestMajor = m as DbMajor;
        }
      });

      // If no good match, keep the original recommendation without DB binding
      if (!bestMajor || bestScore < 50) {
        return {
          ...rec,
          majorId: undefined,
          universities: [],
        };
      }

      const majorId = bestMajor.id;

      const uniIds =
        (uniMajors as DbUniversityMajor[] | null | undefined)
          ?.filter((um) => um.major_id === majorId && um.is_available !== false)
          .map((um) => um.university_id) ?? [];

      const uniList = uniIds
        .map((id) => uniById.get(id))
        .filter(Boolean) as DbUniversity[];

      return {
        ...rec,
        majorId,
        majorName: bestMajor.name || rec.majorName,
        universities: uniList,
      };
    });

    // Optional: keep only recs that matched a major
    const filtered = enrichedRecs.filter((r) => (r as any).majorId);

    const finalRecs = filtered.length > 0 ? filtered : enrichedRecs;

    return {
      ...result,
      recommendations: finalRecs,
    };
  } catch (e) {
    console.error("Error while matching recommendations to DB:", e);
    return result;
  }
};

const Assessment = () => {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const { user } = useAuth();
  const [state, setState] = useState<AssessmentState>('intro');
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showPreviousTests, setShowPreviousTests] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastQuizAnswers, setLastQuizAnswers] = useState<Record<string, string | number> | null>(null);

  useEffect(() => {
    if (user) {
      fetchAttemptCount();
    }
  }, [user]);

  const fetchAttemptCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      if (error) throw error;
      setAttemptCount(data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch attempt count:', error);
    }
  };

  const handleStartQuiz = () => {
    if (!user) {
      toast({
        title: language === 'ar' ? 'يجب تسجيل الدخول' : 'Login Required',
        description: language === 'ar'
          ? 'يرجى تسجيل الدخول لإجراء التقييم'
          : 'Please login to take the assessment',
        variant: 'destructive',
      });
      return;
    }

    if (attemptCount >= MAX_ATTEMPTS) {
      toast({
        title: language === 'ar' ? 'تم الوصول للحد الأقصى' : 'Maximum Attempts Reached',
        description: language === 'ar'
          ? `لقد وصلت إلى الحد الأقصى من ${MAX_ATTEMPTS} محاولات`
          : `You have reached the maximum of ${MAX_ATTEMPTS} attempts`,
        variant: 'destructive',
      });
      return;
    }

    setState('quiz');
  };

  // helper to save a result to DB (used by auto-save + manual save)
  const saveResultToDb = async (result: AssessmentResult) => {
    if (!user) {
      throw new Error('User must be logged in to save assessment results');
    }

    const { error } = await supabase.from('assessment_results').insert({
      user_id: user.id,
      results: result,
      taken_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to save assessment result:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to save assessment: ${error.message}`);
    }

    setResultSaved(true);
    await fetchAttemptCount();
  };

  const handleQuizComplete = async (answers: Record<string, string | number>) => {
    setState('analyzing');
    // Save answers in case of error so user can retry from where they left off
    setLastQuizAnswers(answers);

    try {
      // 1) Get AI analysis
      const rawResult = await analyzeAssessment(answers, language);

      // 2) Match to real majors + universities
      const enrichedResult = await matchRecommendationsToDb(rawResult);

      // 3) Save to state
      setAssessmentResult(enrichedResult);
      setResultSaved(false);
      setLastQuizAnswers(null); // Clear saved answers on success

      // 4) Auto-save to DB
      await saveResultToDb(enrichedResult);

      // 5) Show results
      setState('results');

      toast({
        title: language === 'ar' ? 'نجح التحليل!' : 'Analysis Complete!',
        description: language === 'ar'
          ? 'تم إنشاء وحفظ توصياتك المخصصة'
          : 'Your personalized recommendations have been generated and saved',
      });
    } catch (error: any) {
      console.error('Assessment analysis failed:', error);
      
      // More specific error message
      let errorMsg = error?.message || 'Failed to analyze your assessment';
      
      // Provide user-friendly messages
      if (errorMsg.includes('VITE_GEMINI_API_KEY') || errorMsg.includes('API')) {
        errorMsg = language === 'ar' 
          ? 'عذراً، خدمة التحليل غير متاحة حالياً. يرجى المحاولة لاحقاً.'
          : 'Sorry, the analysis service is temporarily unavailable. Please try again later.';
      } else if (errorMsg.includes('Failed to save')) {
        errorMsg = language === 'ar'
          ? 'حدث خطأ أثناء حفظ النتائج. تم إنشاء التوصيات الخاصة بك ولكن لم يتم حفظها.'
          : 'Failed to save your results. Your recommendations were generated but not saved.';
      }
      
      setErrorMessage(errorMsg);
      setState('error');
    }
  };

  const handleSaveResults = async () => {
    if (!user || !assessmentResult) {
      toast({
        title: language === 'ar' ? 'يجب تسجيل الدخول' : 'Login Required',
        description: language === 'ar'
          ? 'يرجى تسجيل الدخول لحفظ النتائج'
          : 'Please login to save your results',
        variant: 'destructive',
      });
      return;
    }

    if (resultSaved) {
      toast({
        title: language === 'ar' ? 'تم الحفظ مسبقاً' : 'Already Saved',
        description: language === 'ar'
          ? 'هذه النتائج محفوظة بالفعل'
          : 'These results are already saved',
      });
      return;
    }

    try {
      await saveResultToDb(assessmentResult);

      toast({
        title: language === 'ar' ? 'تم الحفظ!' : 'Saved!',
        description: language === 'ar'
          ? 'تم حفظ نتائج التقييم الخاصة بك'
          : 'Your assessment results have been saved',
      });
    } catch (error) {
      console.error('Failed to save results:', error);
      toast({
        title: language === 'ar' ? 'فشل الحفظ' : 'Save Failed',
        description: language === 'ar'
          ? 'تعذر حفظ النتائج. يرجى المحاولة مرة أخرى.'
          : 'Could not save results. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRetake = () => {
    setAssessmentResult(null);
    setResultSaved(false);
    setState('intro');
  };

  const handleViewPreviousResult = (result: AssessmentResult) => {
    setAssessmentResult(result);
    setResultSaved(true);
    setState('results');
  };

  const handleCancel = () => {
    setState('intro');
  };

  const handleRetryError = () => {
    setErrorMessage(null);
    setState('quiz');
  };

  // Error state
  if (state === 'error' && errorMessage) {
    return (
      <PageAnimation>
        <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
          <Navbar />
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="max-w-md w-full mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-red-200 dark:border-red-800 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-full mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white text-center" dir={language}>
                  {language === 'ar' ? 'حدث خطأ' : 'Oops! Something went wrong'}
                </h2>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <p className="text-gray-700 dark:text-gray-300 text-center" dir={language}>
                    {errorMessage}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center" dir={language}>
                    {language === 'ar' 
                      ? 'يمكنك المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية'
                      : 'You can try again or return to the home page'}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleRetryError}
                    className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl px-6 py-3 shadow-lg transition-all"
                  >
                    {language === 'ar' ? 'المحاولة مرة أخرى' : 'Try Again'}
                  </Button>
                  <Link to="/">
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl px-6 py-3 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageAnimation>
    );
  }

  // Analyzing state
  if (state === 'analyzing') {
    return (
      <PageAnimation>
        <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
          <Navbar />
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center space-y-6">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white" dir={language}>
                {language === 'ar' ? 'جارٍ تحليل إجاباتك...' : 'Analyzing your responses...'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300" dir={language}>
                {language === 'ar'
                  ? 'الذكاء الاصطناعي يقوم بإنشاء توصيات مخصصة لك'
                  : 'AI is generating personalized recommendations for you'}
              </p>
            </div>
          </div>
        </div>
      </PageAnimation>
    );
  }

  // Results state
  if (state === 'results' && assessmentResult) {
    return (
      <PageAnimation>
        <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
          <Navbar />
          <div className="pt-20">
            <AssessmentResults
              result={assessmentResult}
              onRetake={handleRetake}
              onSave={user ? handleSaveResults : undefined}
            />
          </div>
        </div>
      </PageAnimation>
    );
  }

  // Quiz state
  if (state === 'quiz') {
    return (
      <PageAnimation>
        <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
          <Navbar />
          <div className="pt-20">
            <AssessmentQuiz
              onComplete={handleQuizComplete}
              onCancel={handleCancel}
              onSaveAndFinish={async (answers) => {
                await handleQuizComplete(answers);
              }}
              initialAnswers={lastQuizAnswers || undefined}
            />
          </div>
        </div>
      </PageAnimation>
    );
  }

  // Intro state (default)
  return (
    <PageAnimation>
      <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-14 pb-28">
          <ScrollAnimation>
            <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transform hover:scale-110 transition-all duration-500 animate-pulse">
                  <GraduationCap className="w-10 h-10 text-blue-600 dark:text-blue-300" />
                </div>
              </div>

              <h1
                className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white animate-fade-in"
                dir={language}
              >
                {t('assessment.title')}
              </h1>

              <p
                className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto animate-fade-in"
                dir={language}
              >
                {t('assessment.heroDesc')}
              </p>
            </div>
          </ScrollAnimation>
        </section>

        {/* Main/Coming Soon Section */}
        <section className="pb-16">
          <ScrollAnimation delay={0.2}>
            <div className="max-w-4xl mx-auto text-center px-4 space-y-12">
              {/* Main Card */}
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-8 md:p-12 border border-blue-100 dark:border-blue-800 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500">
                <div className="space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>

                  <h2
                    className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                    dir={language}
                  >
                    {language === 'ar' ? 'اكتشف تخصصك المثالي' : 'Discover Your Perfect Major'}
                  </h2>

                  <p
                    className="text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto"
                    dir={language}
                  >
                    {language === 'ar'
                      ? 'خذ تقييمنا الذكي المدعوم بالذكاء الاصطناعي واحصل على توصيات مخصصة بناءً على اهتماماتك ومهاراتك وتفضيلاتك'
                      : 'Take our AI-powered assessment and get personalized recommendations based on your interests, skills, and preferences'}
                  </p>

                  <div className="flex flex-col items-center gap-4 pt-4">
                    {user && attemptCount >= MAX_ATTEMPTS && (
                      <div className="mb-2 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
                        <AlertCircle className="h-4 w-4" />
                        <span dir={language}>
                          {language === 'ar'
                            ? `لقد وصلت للحد الأقصى (${MAX_ATTEMPTS}/${MAX_ATTEMPTS} محاولات)`
                            : `Maximum attempts reached (${MAX_ATTEMPTS}/${MAX_ATTEMPTS} attempts)`}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleStartQuiz}
                        size="lg"
                        disabled={user && attemptCount >= MAX_ATTEMPTS}
                        className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl px-8 py-6 shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <GraduationCap className="w-5 h-5 mr-2" />
                        {language === 'ar' ? 'ابدأ التقييم' : 'Start Assessment'}
                      </Button>

                      {user && attemptCount > 0 && (
                        <Button
                          onClick={() => setShowPreviousTests(true)}
                          size="lg"
                          variant="outline"
                          className="rounded-2xl px-8 py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-md"
                        >
                          <History className="w-5 h-5 mr-2" />
                          {language === 'ar' ? 'الاختبارات السابقة' : 'Previous Tests'}
                        </Button>
                      )}
                    </div>

                    <div className="text-center space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400" dir={language}>
                        {language === 'ar' ? '⏱️ يستغرق حوالي 5-10 دقائق' : '⏱️ Takes about 5-10 minutes'}
                      </p>
                      {user && (
                        <p className="text-xs text-gray-500 dark:text-gray-500" dir={language}>
                          {language === 'ar'
                            ? `${attemptCount} من ${MAX_ATTEMPTS} محاولات مستخدمة`
                            : `${attemptCount} of ${MAX_ATTEMPTS} attempts used`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300" dir={language}>
                      <Users className="w-5 h-5" />
                      <span className="text-sm">
                        {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-300" dir={language}>
                      <Clock className="w-5 h-5" />
                      <span className="text-sm">
                        {language === 'ar' ? 'نتائج فورية' : 'Instant Results'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to Expect */}
              <ScrollAnimation delay={0.4}>
                <div className="text-center space-y-8">
                  <h3
                    className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                    dir={language}
                  >
                    {t('assessment.expectTitle')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <ScrollAnimation delay={0.1}>
                      <div className="space-y-4 transform hover:scale-105 transition-all duration-500">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 text-white flex items-center justify-center hover:rotate-12 transition-all duration-300 ">
                          <span className="font-bold text-lg">1</span>
                        </div>
                        <h4
                          className="text-xl font-semibold text-gray-900 dark:text-white"
                          dir={language}
                        >
                          {t('assessment.step1.title')}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300" dir={language}>
                          {t('assessment.step1.desc')}
                        </p>
                      </div>
                    </ScrollAnimation>

                    <ScrollAnimation delay={0.2}>
                      <div className="space-y-4 transform hover:scale-105 transition-all duration-500">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 text-white flex items-center justify-center hover:rotate-12 transition-all duration-300 ">
                          <span className="font-bold text-lg">2</span>
                        </div>
                        <h4
                          className="text-xl font-semibold text-gray-900 dark:text-white"
                          dir={language}
                        >
                          {t('assessment.step2.title')}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300" dir={language}>
                          {t('assessment.step2.desc')}
                        </p>
                      </div>
                    </ScrollAnimation>

                    <ScrollAnimation delay={0.3}>
                      <div className="space-y-4 transform hover:scale-105 transition-all duration-500">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-green-400 to-green-500 text-white flex items-center justify-center hover:rotate-12 transition-all duration-300 ">
                          <span className="font-bold text-lg">3</span>
                        </div>
                        <h4
                          className="text-xl font-semibold text-gray-900 dark:text-white"
                          dir={language}
                        >
                          {t('assessment.step3.title')}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300" dir={language}>
                          {t('assessment.step3.desc')}
                        </p>
                      </div>
                    </ScrollAnimation>
                  </div>
                </div>
              </ScrollAnimation>

              {/* Back to Home Button */}
              <ScrollAnimation delay={0.6}>
                <div className="pt-8">
                  <Link to="/" id="assessment-back-to-home-link">
                    <Button
                      id="assessment-back-to-home-button"
                      variant="outline"
                      className="rounded-2xl px-8 py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-md"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      {t('auth.actions.backToHome')}
                    </Button>
                  </Link>
                </div>
              </ScrollAnimation>
            </div>
          </ScrollAnimation>
        </section>
      </div>

      {showPreviousTests && user && (
        <PreviousTestsDialog
          userId={user.id}
          onClose={() => setShowPreviousTests(false)}
          onViewResult={handleViewPreviousResult}
        />
      )}
    </PageAnimation>
  );
};

export default Assessment;
