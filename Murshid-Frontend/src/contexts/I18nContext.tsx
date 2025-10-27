import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Translation keys - you can expand this
const translations = {
  en: {
    // Navbar
    'navbar.profile': 'Profile',
    'navbar.login': 'Login',
    'navbar.logout': 'Logout',
    'navbar.home': 'Home',
    'navbar.majors': 'Majors',
    'navbar.universities': 'Universities',
    'navbar.quiz': 'Quiz',
    'navbar.about': 'About Us',
    'navbar.contact': 'Contact Us',
    'navbar.signUp': 'Sign Up',
    
    // Homepage
    'homepage.welcome': 'Welcome to Murshid Platform 👋',
    'homepage.title': 'Discover Your Perfect University Major!',
    'homepage.subtitle': 'We help you make the most important decision in your academic life. Discover the major that suits your passion and skills through a smart test and comprehensive information about all university majors.',
    'homepage.startNow': 'Start Now',
    'homepage.browseMajors': 'Browse Majors',
    'homepage.students': 'Students',
    'homepage.majors': 'Majors',
    'homepage.satisfaction': 'User Satisfaction',
    'homepage.howItWorks': 'How does Murshid work?',
    'homepage.threeSteps': 'Three simple steps to find the right major for you',
    'homepage.exploreInterests': 'Explore Your Interests',
    'homepage.exploreInterestsDesc': 'Answer simple questions to understand your tendencies and skills',
    'homepage.getRecommendations': 'Get Recommendations',
    'homepage.getRecommendationsDesc': 'We provide you with a list of suitable majors for you',
    'homepage.makeDecision': 'Make Your Decision with Confidence',
    'homepage.makeDecisionDesc': 'Choose your university major based on accurate information',
    'homepage.whyChooseMurshid': 'Why choose Murshid?',
    'homepage.whyChooseDesc': 'We provide you with everything you need to make the right decision',
    'homepage.diverseMajors': 'Diverse Majors',
    'homepage.diverseMajorsDesc': 'Hundreds of university majors available in Saudi Arabia',
    'homepage.comprehensiveInfo': 'Comprehensive Information',
    'homepage.comprehensiveInfoDesc': 'Accurate details about each major and its fields',
    'homepage.supportiveCommunity': 'Supportive Community',
    'homepage.supportiveCommunityDesc': 'Connect with students and graduates from the same field',
    'homepage.futureVision': 'Future Vision',
    'homepage.futureVisionDesc': 'Information about the job market and career opportunities',
    'homepage.testimonials': 'What do our students say?',
    'homepage.testimonialsSubtitle': 'Real success stories from students who used Murshid',
    'homepage.readyToDiscover': 'Ready to discover your perfect major?',
    'homepage.readyToDiscoverDesc': 'Start now and get customized recommendations that match your passion and skills',
    'homepage.startFreeTest': 'Start Free Test',
    'homepage.browseUniversities': 'Browse Universities',
    
    // Majors & Universities Pages
    'majors.title': 'Explore University Majors',
    'majors.subtitle': 'Browse a wide range of university majors and find what suits your passion',
    'majors.searchPlaceholder': 'Search for a major...',
    'majors.resultsCount': 'Showing {count} majors',
    'majors.noResults': 'No results found',
    'majors.noResultsDesc': 'Try searching with different words or choose a different category',
    'majors.learnMore': 'Learn More',
    'majors.stillConfused': 'Still confused?',
    'majors.stillConfusedDesc': 'Try our smart test to help you choose the right major',
    'majors.startTestNow': 'Start Test Now',
    'majors.demand': 'Demand',
    'majors.duration': 'years',
    
    // Categories
    'categories.all': 'All Majors',
    'categories.engineering': 'Engineering',
    'categories.medical': 'Medicine & Health',
    'categories.business': 'Business & Management',
    'categories.tech': 'Technology',
    'categories.science': 'Sciences',
    'categories.arts': 'Arts & Design',
    
    // Universities
    'universities.title': 'Explore Universities',
    'universities.subtitle': 'Browse top universities in Saudi Arabia and find your perfect institution',
    'universities.searchPlaceholder': 'Search for a university...',
    'universities.resultsCount': 'Showing {count} universities',
    'universities.noResults': 'No results found',
    'universities.noResultsDesc': 'Try searching with different words or choose a different category',
    'universities.learnMore': 'Learn More',
    'universities.stillConfused': 'Still confused?',
    'universities.stillConfusedDesc': 'Try our smart test to help you choose the right university',
    'universities.startTestNow': 'Start Test Now',
    'universities.rating': 'Rating',
    'universities.location': 'Location',
    
    // University Categories
    'universityCategories.all': 'All Universities',
    'universityCategories.public': 'Public Universities',
    'universityCategories.private': 'Private Universities',
    'universityCategories.research': 'Research Universities',
    'universityCategories.technical': 'Technical Colleges',
  },
  ar: {
    // Navbar
    'navbar.profile': 'الملف الشخصي',
    'navbar.login': 'تسجيل الدخول',
    'navbar.logout': 'تسجيل الخروج',
    'navbar.home': 'الرئيسية',
    'navbar.majors': 'التخصصات',
    'navbar.universities': 'الجامعات',
    'navbar.quiz': 'الاختبار',
    'navbar.about': 'من نحن',
    'navbar.contact': 'تواصل معنا',
    'navbar.signUp': 'حساب جديد',
    
    // Homepage
    'homepage.welcome': 'مرحباً بك في منصة مرشد 👋',
    'homepage.title': 'اكتشف تخصصك الجامعي المناسب!',
    'homepage.subtitle': 'نساعدك في اتخاذ أهم قرار في حياتك الأكاديمية. اكتشف التخصص الذي يناسب شغفك ومهاراتك من خلال اختبار ذكي ومعلومات شاملة عن جميع التخصصات الجامعية',
    'homepage.startNow': 'ابدأ الآن',
    'homepage.browseMajors': 'تصفح التخصصات',
    'homepage.students': 'طالب',
    'homepage.majors': 'تخصص',
    'homepage.satisfaction': 'رضا المستخدمين',
    'homepage.howItWorks': 'كيف يعمل مرشد؟',
    'homepage.threeSteps': 'ثلاث خطوات بسيطة لتجد التخصص المناسب لك',
    'homepage.exploreInterests': 'استكشف اهتماماتك',
    'homepage.exploreInterestsDesc': 'أجب عن أسئلة بسيطة لنفهم ميولك ومهاراتك',
    'homepage.getRecommendations': 'احصل على توصيات',
    'homepage.getRecommendationsDesc': 'نقدم لك قائمة بالتخصصات المناسبة لك',
    'homepage.makeDecision': 'اتخذ قرارك بثقة',
    'homepage.makeDecisionDesc': 'اختر تخصصك الجامعي بناءً على معلومات دقيقة',
    'homepage.whyChooseMurshid': 'لماذا تختار مرشد؟',
    'homepage.whyChooseDesc': 'نقدم لك كل ما تحتاجه لاتخاذ القرار الصحيح',
    'homepage.diverseMajors': 'تخصصات متنوعة',
    'homepage.diverseMajorsDesc': 'مئات التخصصات الجامعية المتاحة في السعودية',
    'homepage.comprehensiveInfo': 'معلومات شاملة',
    'homepage.comprehensiveInfoDesc': 'تفاصيل دقيقة عن كل تخصص ومجالاته',
    'homepage.supportiveCommunity': 'مجتمع داعم',
    'homepage.supportiveCommunityDesc': 'تواصل مع طلاب وخريجين من نفس المجال',
    'homepage.futureVision': 'رؤية مستقبلية',
    'homepage.futureVisionDesc': 'معلومات عن سوق العمل والفرص الوظيفية',
    'homepage.testimonials': 'ماذا يقول طلابنا؟',
    'homepage.testimonialsSubtitle': 'قصص نجاح حقيقية من طلاب استخدموا مرشد',
    'homepage.readyToDiscover': 'جاهز لاكتشاف تخصصك المثالي؟',
    'homepage.readyToDiscoverDesc': 'ابدأ الآن واحصل على توصيات مخصصة تناسب شغفك ومهاراتك',
    'homepage.startFreeTest': 'ابدأ الاختبار المجاني',
    'homepage.browseUniversities': 'تصفح الجامعات',
    
    // Majors & Universities Pages
    'majors.title': 'استكشف التخصصات الجامعية',
    'majors.subtitle': 'تصفح مجموعة واسعة من التخصصات الجامعية واعثر على ما يناسب شغفك',
    'majors.searchPlaceholder': 'ابحث عن تخصص...',
    'majors.resultsCount': 'عرض {count} تخصص',
    'majors.noResults': 'لم يتم العثور على نتائج',
    'majors.noResultsDesc': 'جرب البحث بكلمات أخرى أو اختر فئة مختلفة',
    'majors.learnMore': 'اعرف المزيد',
    'majors.stillConfused': 'لا تزال محتاراً؟',
    'majors.stillConfusedDesc': 'جرب اختبارنا الذكي لنساعدك في اختيار التخصص المناسب لك',
    'majors.startTestNow': 'ابدأ الاختبار الآن',
    'majors.demand': 'الطلب',
    'majors.duration': 'سنوات',
    
    // Categories
    'categories.all': 'جميع التخصصات',
    'categories.engineering': 'الهندسة',
    'categories.medical': 'الطب والصحة',
    'categories.business': 'الإدارة والأعمال',
    'categories.tech': 'التقنية',
    'categories.science': 'العلوم',
    'categories.arts': 'الفنون والتصميم',
    
    // Universities
    'universities.title': 'استكشف الجامعات',
    'universities.subtitle': 'تصفح أفضل الجامعات في السعودية واعثر على مؤسستك المثالية',
    'universities.searchPlaceholder': 'ابحث عن جامعة...',
    'universities.resultsCount': 'عرض {count} جامعة',
    'universities.noResults': 'لم يتم العثور على نتائج',
    'universities.noResultsDesc': 'جرب البحث بكلمات أخرى أو اختر فئة مختلفة',
    'universities.learnMore': 'اعرف المزيد',
    'universities.stillConfused': 'لا تزال محتاراً؟',
    'universities.stillConfusedDesc': 'جرب اختبارنا الذكي لنساعدك في اختيار الجامعة المناسبة',
    'universities.startTestNow': 'ابدأ الاختبار الآن',
    'universities.rating': 'التقييم',
    'universities.location': 'الموقع',
    
    // University Categories
    'universityCategories.all': 'جميع الجامعات',
    'universityCategories.public': 'الجامعات الحكومية',
    'universityCategories.private': 'الجامعات الأهلية',
    'universityCategories.research': 'الجامعات البحثية',
    'universityCategories.technical': 'الكليات التقنية',
  }
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'en';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.lang = language;
  }, [language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string, values?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key;
    
    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        translation = translation.replace(`{${k}}`, v.toString());
      });
    }
    
    return translation;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
