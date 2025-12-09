import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Briefcase,
  User,
  CheckCircle2,
  Sparkles,
  Loader2,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  assessmentQuestions,
  getTotalProgress,
  AssessmentQuestion,
  getCategoryProgress
} from '@/data/assessmentQuestions';
import { categoryVisuals, getEncouragement } from '@/data/assessmentVisuals';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';

interface AssessmentQuizProps {
  onComplete: (answers: Record<string, string | number>) => void;
  onCancel: () => void;
  onSaveAndFinish?: (answers: Record<string, string | number>) => Promise<void>;
  initialAnswers?: Record<string, string | number>;
}

type CategoryKey = AssessmentQuestion['category'];

const categoryIcons: Record<CategoryKey, JSX.Element> = {
  interests: <BookOpen className="w-5 h-5" />,
  skills: <Lightbulb className="w-5 h-5" />,
  preferences: <Briefcase className="w-5 h-5" />,
  personality: <User className="w-5 h-5" />,
};

const categoryLabels: Record<CategoryKey, { en: string; ar: string }> = {
  interests: { en: 'Interests', ar: 'الاهتمامات' },
  skills: { en: 'Skills', ar: 'المهارات' },
  preferences: { en: 'Preferences', ar: 'التفضيلات' },
  personality: { en: 'Personality', ar: 'الشخصية' },
};

const categories: CategoryKey[] = ['interests', 'skills', 'preferences', 'personality'];

const questionTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25 },
};

// localStorage helper functions
const QUIZ_ANSWERS_KEY = 'murshid_quiz_answers';
const QUIZ_PROGRESS_KEY = 'murshid_quiz_progress';

const saveAnswersToStorage = (answers: Record<string, string | number>) => {
  try {
    localStorage.setItem(QUIZ_ANSWERS_KEY, JSON.stringify(answers));
    localStorage.setItem(QUIZ_PROGRESS_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Failed to save quiz answers to storage:', error);
  }
};

const getSavedAnswers = (): Record<string, string | number> | null => {
  try {
    const saved = localStorage.getItem(QUIZ_ANSWERS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to retrieve quiz answers from storage:', error);
    return null;
  }
};

const clearSavedAnswers = () => {
  try {
    localStorage.removeItem(QUIZ_ANSWERS_KEY);
    localStorage.removeItem(QUIZ_PROGRESS_KEY);
  } catch (error) {
    console.error('Failed to clear quiz answers from storage:', error);
  }
};

export const AssessmentQuiz = ({ onComplete, onCancel, onSaveAndFinish, initialAnswers }: AssessmentQuizProps) => {
  const { language } = useI18n();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>(initialAnswers || {});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize from localStorage if no initialAnswers provided
  useEffect(() => {
    if (!initialAnswers) {
      const savedAnswers = getSavedAnswers();
      if (savedAnswers) {
        setAnswers(savedAnswers);
      }
    }
  }, [initialAnswers]);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    saveAnswersToStorage(answers);
  }, [answers]);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const currentCategory = currentQuestion.category;
  const categoryInfo = categoryVisuals[currentCategory];
  const questionNumber = currentQuestionIndex + 1;
  const progress = getTotalProgress(answers);
  const languageKey = language === 'ar' ? 'ar' : 'en';
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const isLastQuestion = currentQuestionIndex === assessmentQuestions.length - 1;
  // Open-ended questions (questions 18 and 19) are optional
  const isOptionalQuestion = currentQuestion.type === 'text';
  const canProceed = isOptionalQuestion || (answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== '');
  const encouragement = getEncouragement(progress, languageKey);

  const categoryProgressMap = useMemo(() => {
    return categories.reduce<Record<CategoryKey, number>>((acc, category) => {
      acc[category] = getCategoryProgress(answers, category);
      return acc;
    }, {} as Record<CategoryKey, number>);
  }, [answers]);

  const categoryQuestions = useMemo(
    () => assessmentQuestions.filter((question) => question.category === currentCategory),
    [currentCategory]
  );

  const currentCategoryPosition = categoryQuestions.findIndex((question) => question.id === currentQuestion.id) + 1;
  const totalCategoryQuestions = categoryQuestions.length;

  const handleAnswer = (questionId: string, answer: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      clearSavedAnswers(); // Clear saved answers when quiz is completed
      onComplete(answers);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSaveAndFinish = async () => {
    if (!onSaveAndFinish) return;

    setIsSaving(true);
    try {
      await onSaveAndFinish(answers);
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuestionInput = (question: AssessmentQuestion) => {
    const currentAnswer = answers[question.id];

    if (question.type === 'multiple-choice' && question.options) {
      return (
        <RadioGroup
          value={typeof currentAnswer === 'string' ? (currentAnswer as string) : ''}
          onValueChange={(value) => handleAnswer(question.id, value)}
          className="grid gap-3 md:grid-cols-2"
          dir={direction}
        >
          {question.options.map((option, index) => {
            const value = option.valueEn;
            const labelText = language === 'ar' ? option.valueAr : option.valueEn;
            const isSelected = currentAnswer === value;

            return (
              <motion.label
                key={value}
                htmlFor={`option-${question.id}-${index}`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  'group relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 bg-white/80 p-4 text-base transition-all shadow-sm backdrop-blur-sm dark:bg-gray-900/60',
                  isSelected
                    ? 'border-blue-500 text-blue-900 shadow-lg dark:border-blue-400 dark:text-blue-100'
                    : 'border-gray-200 text-gray-800 hover:border-blue-300 dark:border-gray-700 dark:text-gray-100 dark:hover:border-blue-500/60'
                )}
              >
                <RadioGroupItem
                  value={value}
                  id={`option-${question.id}-${index}`}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    isSelected
                      ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-300 dark:bg-blue-400'
                      : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-950/60'
                  )}
                >
                  {index + 1}
                </div>
                <span className="flex-1 leading-relaxed">{labelText}</span>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                )}
              </motion.label>
            );
          })}
        </RadioGroup>
      );
    }

    if (question.type === 'scale' && question.scaleLabels) {
      const scaleValue = typeof currentAnswer === 'number' ? currentAnswer : 50;
      const getEmoji = (value: number) => {
        if (value <= 20) return '😴';
        if (value <= 40) return '😌';
        if (value <= 60) return '🙂';
        if (value <= 80) return '😊';
        return '🤩';
      };
      
      return (
        <div className="space-y-6" dir={direction}>
          <div className="relative flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            <motion.span
              className="absolute left-0"
              animate={{ scale: scaleValue <= 25 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {language === 'ar' ? question.scaleLabels.min.ar : question.scaleLabels.min.en}
            </motion.span>
            <motion.span
              className="absolute right-0"
              animate={{ scale: scaleValue >= 75 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {language === 'ar' ? question.scaleLabels.max.ar : question.scaleLabels.max.en}
            </motion.span>
            <div className="w-full" aria-hidden="true"></div>
          </div>
          <motion.div 
            className="relative rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50/70 via-purple-50/50 to-pink-50/50 p-8 shadow-inner dark:border-blue-400/30 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full bg-blue-400/20 dark:bg-blue-300/20"
                  style={{
                    left: `${(scaleValue / 100) * 100}%`,
                    top: `${20 + i * 15}%`,
                  }}
                  animate={{
                    x: [-10, 10, -10],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            
            <div className="relative">
              <Slider
                value={[scaleValue]}
                onValueChange={(value) => handleAnswer(question.id, value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full cursor-grab active:cursor-grabbing"
              />
              
              {/* Progress fill indicator */}
              <div className="absolute -top-2 left-0 h-1 rounded-full overflow-hidden pointer-events-none">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${scaleValue}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center gap-3"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
            key={scaleValue}
          >
            <motion.div
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              {getEmoji(scaleValue)}
            </motion.div>
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 text-lg font-bold text-white shadow-lg">
              {scaleValue}%
            </div>
          </motion.div>
          
          {/* Fun milestone messages - fixed height container */}
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {scaleValue === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-sm text-gray-600 dark:text-gray-400"
                >
                  {language === 'ar' ? '🎯 ابدأ بتحريك المؤشر!' : '🎯 Start by moving the slider!'}
                </motion.div>
              )}
              {scaleValue === 50 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-sm font-medium text-purple-600 dark:text-purple-400"
                >
                  {language === 'ar' ? '⚖️ في المنتصف تماماً!' : '⚖️ Perfectly balanced!'}
                </motion.div>
              )}
              {scaleValue === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center text-sm font-bold text-pink-600 dark:text-pink-400"
                >
                  {language === 'ar' ? '🎉 إلى أقصى حد!' : '🎉 Maximum power!'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    if (question.type === 'text') {
      return (
        <div className="space-y-3" dir={direction}>
          <Textarea
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder={language === 'ar' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
            className="min-h-36 rounded-2xl border-2 border-gray-200 bg-white/80 p-4 text-base shadow-sm transition-colors focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-200 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100"
          />
          <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-3 text-sm text-gray-600 dark:border-blue-400/40 dark:bg-blue-950/40 dark:text-gray-200">
            {language === 'ar'
              ? 'كلما شاركت تفاصيل أكثر، حصلت على توصيات أكثر دقة. لا تقلق بشأن الكتابة المثالية!'
              : 'The more details you share, the more precise your recommendations become. No need for perfect writing!'}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Back to Home Button */}
      <div className="flex justify-start">
        <Link to="/">
          <Button
            variant="outline"
            className="rounded-2xl px-6 py-3 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-md gap-2"
          >
            <Home className="w-4 h-4" />
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </Link>
      </div>

      <div
        className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/60"
        dir={direction}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>{language === 'ar' ? 'التقدم العام' : 'Overall progress'}</span>
          <span>
            {Object.keys(answers).length} / {assessmentQuestions.length}
          </span>
        </div>
        <Progress value={progress} className="mt-3 h-3" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{Math.round(progress)}% {language === 'ar' ? 'منجز' : 'complete'}</span>
          <span>{language === 'ar' ? 'يمكنك الانتقال بين الأسئلة بحرية.' : 'Feel free to move between questions at any time.'}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentCategory}-${language}`}
          {...questionTransition}
          className={cn(
            'relative overflow-hidden rounded-3xl border bg-gradient-to-br shadow-xl',
            categoryInfo.accentBorder,
            categoryInfo.gradient,
            categoryInfo.darkGradient
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_45%)]" />
          <div className="relative grid items-center gap-6 p-6 md:grid-cols-[1.6fr,1fr] md:p-10">
            <div className="space-y-4" dir={direction}>
              <Badge
                variant="outline"
                className="w-fit bg-white/70 text-xs font-semibold uppercase tracking-wide text-gray-800 dark:bg:white/10 dark:text-gray-100"
              >
                {language === 'ar' ? 'التركيز الحالي' : 'Current focus'} · {categoryLabels[currentCategory][languageKey]}
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text:white">
                {categoryInfo.heading[languageKey]}
              </h2>
              <p className="text-base md:text-lg text-gray-800 dark:text-gray-200">
                {categoryInfo.subheading[languageKey]}
              </p>
              <div className="flex items-start gap-3 rounded-2xl border border:white/50 bg-white/70 p-4 text-sm text-gray-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60 dark:text-gray-200">
                <Sparkles className="mt-0.5 h-4 w-4 text-blue-500 dark:text-blue-300" />
                <p>{encouragement}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  <span>{language === 'ar' ? 'تقدم هذا القسم' : 'Category progress'}</span>
                  <span>
                    {currentCategoryPosition} / {totalCategoryQuestions}
                  </span>
                </div>
                <Progress value={categoryProgressMap[currentCategory]} className="h-2 bg-white/40" />
              </div>
            </div>
            <motion.img
              src={categoryInfo.image}
              alt={categoryInfo.heading.en}
              className="h-full w-full rounded-2xl object-cover shadow-lg"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              loading="lazy"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion.id} {...questionTransition}>
          <Card className="border-2 border-white/60 bg-white/90 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
            <CardHeader className="space-y-3" dir={direction}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner dark:bg-blue-900/60 dark:text-blue-200">
                  {categoryIcons[currentCategory]}
                </div>
                <div className="flex-1 space-y-1">
                  <CardDescription className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'السؤال' : 'Question'} {questionNumber}
                  </CardDescription>
                  <CardTitle className="text-2xl leading-snug text-gray-900 dark:text-white">
                    {language === 'ar' ? currentQuestion.questionAr : currentQuestion.questionEn}
                  </CardTitle>
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-3 text-sm text-blue-800 dark:border-blue-500/40 dark:bg-blue-950/40 dark:text-blue-200">
                {categoryInfo.tip[languageKey]}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQuestionInput(currentQuestion)}

              <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  onClick={currentQuestionIndex === 0 ? onCancel : handlePrevious}
                  className="order-2 flex flex-1 items-center justify-center rounded-2xl border-2 px-6 py-3 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all sm:order-1 sm:flex-none"
                >
                  {language === 'ar' ? (
                    <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronLeft className="mr-2 h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="whitespace-nowrap">
                    {currentQuestionIndex === 0
                      ? language === 'ar'
                        ? 'الرجوع'
                        : 'Back'
                      : language === 'ar'
                      ? 'السابق'
                      : 'Previous'}
                  </span>
                </Button>

                <div className="order-1 flex flex-1 gap-3 sm:order-2 sm:flex-none">
                  {isLastQuestion ? (
                    onSaveAndFinish ? (
                      <Button
                        onClick={handleSaveAndFinish}
                        disabled={!canProceed || isSaving}
                        className="flex-1 gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg transition-all hover:from-green-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 rounded-2xl px-6 py-3 sm:flex-none"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            {language === 'ar' ? 'حفظ وإنهاء' : 'Save & Finish'}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className="flex-1 gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg transition-all hover:from-green-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 rounded-2xl px-6 py-3 sm:flex-none"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        {language === 'ar' ? 'إنهاء' : 'Finish'}
                      </Button>
                    )
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed}
                      className="flex-1 gap-2 bg-blue-600 text-white font-semibold shadow-lg transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400 rounded-2xl px-6 py-3 sm:flex-none"
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                      {language === 'ar' ? (
                        <ChevronLeft className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      
    </div>
  );
};
