import { AssessmentQuestion } from './assessmentQuestions';

type CategoryKey = AssessmentQuestion['category'];

type LanguageKey = 'en' | 'ar';

interface LocalizedString {
  en: string;
  ar: string;
}

export interface CategoryVisualMeta {
  heading: LocalizedString;
  subheading: LocalizedString;
  tip: LocalizedString;
  image: string;
  gradient: string;
  darkGradient: string;
  accentBorder: string;
}

export const categoryVisuals: Record<CategoryKey, CategoryVisualMeta> = {
  interests: {
    heading: {
      en: 'Discover what sparks your curiosity',
      ar: 'اكتشف ما يثير فضولك',
    },
    subheading: {
      en: 'Imagine the projects and clubs that keep you excited.',
      ar: 'تخيل المشاريع والأنشطة التي تبقيك متحمساً.',
    },
    tip: {
      en: 'Trust your natural interests - they are your best clues for a major you will enjoy.',
      ar: 'ثق باهتماماتك الطبيعية - فهي أفضل دليل لاختيار تخصص تستمتع به.',
    },
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    gradient: 'from-[#dbeafe] via-[#eff6ff] to-[#e0f2fe]',
    darkGradient: 'dark:from-[#0f1e3a] dark:via-[#132a52] dark:to-[#1c3a6b]',
    accentBorder: 'border-blue-200 dark:border-blue-700',
  },
  skills: {
    heading: {
      en: 'Shine a light on your strengths',
      ar: 'سلط الضوء على نقاط قوتك',
    },
    subheading: {
      en: 'Think about moments when you felt proud of something you built or solved.',
      ar: 'فكر في اللحظات التي شعرت فيها بالفخر بما أنجزته أو حللته.',
    },
    tip: {
      en: 'Every skill grows with practice - choose the answer that matches where you are today.',
      ar: 'كل مهارة تنمو بالممارسة - اختر الإجابة التي تعكس مستواك الحالي.',
    },
    image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
    gradient: 'from-[#ede9fe] via-[#f5f3ff] to-[#e0e7ff]',
    darkGradient: 'dark:from-[#27134a] dark:via-[#301c5d] dark:to-[#1e2454]',
    accentBorder: 'border-purple-200 dark:border-purple-700',
  },
  preferences: {
    heading: {
      en: 'Design the day you love',
      ar: 'صمّم يومك الذي تحبه',
    },
    subheading: {
      en: 'Picture your future workspace, teammates, and routine.',
      ar: 'تخيل مكان عملك المستقبلي وزملاءك وروتينك اليومي.',
    },
    tip: {
      en: 'Answer with your real lifestyle preferences - there is a major that fits each personality.',
      ar: 'أجب وفقاً لتفضيلاتك الحقيقية - هناك تخصص يناسب كل شخصية.',
    },
    image: 'https://images.unsplash.com/photo-1528747045269-390fe33c19d4?auto=format&fit=crop&w=1200&q=80',
    gradient: 'from-[#dcfce7] via-[#ecfdf5] to-[#e0f7fa]',
    darkGradient: 'dark:from-[#0b3b2e] dark:via-[#0f4b3d] dark:to-[#105555]',
    accentBorder: 'border-green-200 dark:border-emerald-700',
  },
  personality: {
    heading: {
      en: 'Celebrate how you think and feel',
      ar: 'احتفل بطريقة تفكيرك وشعورك',
    },
    subheading: {
      en: 'There is no right or wrong answer - only what feels true to you.',
      ar: 'لا توجد إجابة صحيحة أو خاطئة - فقط ما يعبر عنك بصدق.',
    },
    tip: {
      en: 'Your personality guides how you shine in teamwork, leadership, and creativity.',
      ar: 'شخصيتك تحدد كيف تتألق في العمل الجماعي والقيادة والإبداع.',
    },
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80',
    gradient: 'from-[#fee2e2] via-[#fef2f2] to-[#ffe4e6]',
    darkGradient: 'dark:from-[#3f0d1f] dark:via-[#4d1729] dark:to-[#521b30]',
    accentBorder: 'border-rose-200 dark:border-rose-700',
  },
};

interface EncouragementPhrase {
  threshold: number;
  text: LocalizedString;
}

const encouragementPhrases: EncouragementPhrase[] = [
  {
    threshold: 0,
    text: {
      en: 'Let\'s get started - we\'re excited to learn about you!',
      ar: 'لنبدأ - نحن متحمسون لنتعرف عليك!',
    },
  },
  {
    threshold: 25,
    text: {
      en: 'Nice momentum! Keep sharing your story.',
      ar: 'تقدم رائع! استمر في مشاركة قصتك.',
    },
  },
  {
    threshold: 50,
    text: {
      en: 'Halfway there - your future is getting clearer!',
      ar: 'لقد قطعت نصف الطريق - مستقبلك يزداد وضوحاً!',
    },
  },
  {
    threshold: 75,
    text: {
      en: 'Almost done - your answers look great!',
      ar: 'شارفت على الانتهاء - إجاباتك تبدو رائعة!',
    },
  },
  {
    threshold: 95,
    text: {
      en: 'Last steps - take a deep breath and finish strong!',
      ar: 'آخر الخطوات - خذ نفساً عميقاً وأنهِ بقوة!',
    },
  },
];

export const getEncouragement = (progress: number, language: LanguageKey): string => {
  const phrase = encouragementPhrases
    .slice()
    .reverse()
    .find((item) => progress >= item.threshold);

  return phrase ? phrase.text[language] : encouragementPhrases[0].text[language];
};
