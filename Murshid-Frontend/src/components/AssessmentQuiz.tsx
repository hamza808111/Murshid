import { useMemo, useState } from 'react';
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
  Loader2
} from 'lucide-react';
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

export const AssessmentQuiz = ({ onComplete, onCancel, onSaveAndFinish }: AssessmentQuizProps) => {
  const { language } = useI18n();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const currentCategory = currentQuestion.category;
  const categoryInfo = categoryVisuals[currentCategory];
  const questionNumber = currentQuestionIndex + 1;
  const progress = getTotalProgress(answers);
  const languageKey = language === 'ar' ? 'ar' : 'en';
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const isLastQuestion = currentQuestionIndex === assessmentQuestions.length - 1;
  const canProceed = answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== '';
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
          className="grid gap-3"
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
      return (
        <div className="space-y-6" dir={direction}>
          <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>{language === 'ar' ? question.scaleLabels.min.ar : question.scaleLabels.min.en}</span>
            <span>{language === 'ar' ? question.scaleLabels.max.ar : question.scaleLabels.max.en}</span>
          </div>
          <div className="rounded-2xl border border-blue-200/60 bg-blue-50/70 p-6 shadow-inner dark:border-blue-400/30 dark:bg-blue-950/40">
            <Slider
              value={[scaleValue]}
              onValueChange={(value) => handleAnswer(question.id, value[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-blue-500/10 px-4 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-400/20 dark:text-blue-100">
              {scaleValue}%
            </div>
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
      <div
        className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-lg backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-900/60"
        dir={direction}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>{language === 'ar' ? 'التقدم العام' : 'Overall progress'}</span>
          <span>
            {questionNumber} / {assessmentQuestions.length}
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

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" dir={direction}>
        {categories.map((category) => {
          const progressValue = Math.round(categoryProgressMap[category]);
          const isActive = category === currentCategory;
          const isComplete = progressValue >= 99;

          return (
            <motion.div
              key={category}
              whileHover={{ scale: 1.01 }}
              className={cn(
                'rounded-2xl border bg-white/80 p-4 text-sm shadow-sm backdrop-blur-sm transition-all dark:bg-slate-900/60',
                isActive
                  ? 'border-blue-400 shadow-lg ring-2 ring-blue-200/70 dark:border-blue-500 dark:ring-blue-500/30'
                  : isComplete
                  ? 'border-emerald-300 dark:border-emerald-600'
                  : 'border-slate-200 dark:border-slate-800'
              )}
            >
              <div className="flex items-center justify-between gap-2 text-gray-700 dark:text-gray-200">
                <div className="flex items-center gap-2 font-semibold">
                  {categoryIcons[category]}
                  <span>{categoryLabels[category][languageKey]}</span>
                </div>
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : isActive ? (
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                    {language === 'ar' ? 'الآن' : 'Now'}
                  </span>
                ) : null}
              </div>
              <Progress value={progressValue} className="mt-3 h-2" />
              <span className="mt-2 block text-xs text-gray-500 dark:text-gray-400">{progressValue}%</span>
            </motion.div>
          );
        })}
      </div>

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
                  className="order-2 flex-1 border-2 border-slate-200 bg-white/80 text-sm font-semibold transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-blue-500/60 dark:hover:bg-blue-950/40 sm:order-1 sm:flex-none"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {currentQuestionIndex === 0
                    ? language === 'ar'
                      ? 'الرجوع'
                      : 'Back'
                    : language === 'ar'
                    ? 'السابق'
                    : 'Previous'}
                </Button>

                <div className="order-1 flex flex-1 gap-3 sm:order-2 sm:flex-none">
                  {isLastQuestion && onSaveAndFinish && (
                    <Button
                      onClick={handleSaveAndFinish}
                      disabled={!canProceed || isSaving}
                      variant="outline"
                      className="flex-1 gap-2 border-2 border-green-500 bg-green-50 text-base font-semibold text-green-700 shadow-lg transition-all hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-600 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-950/60 sm:flex-none"
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
                  )}

                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="flex-1 gap-2 bg-blue-600 text-base font-semibold shadow-lg transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400 sm:flex-none"
                  >
                    {isLastQuestion ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        {language === 'ar' ? 'إنهاء' : 'Finish'}
                      </>
                    ) : (
                      <>
                        {language === 'ar' ? 'التالي' : 'Next'}
                        <ChevronRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400" dir={direction}>
        {language === 'ar'
          ? 'إذا احتجت إلى استراحة قصيرة، يمكنك دائماً المتابعة من حيث توقفت.'
          : 'Need a pause? You can always pick up right where you left off.'}
      </div>
    </div>
  );
};
