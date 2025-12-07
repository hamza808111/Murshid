import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { PageAnimation } from '@/components/animations/PageAnimation';
import { ScrollAnimation } from '@/components/animations/ScrollAnimation';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Search,
  HelpCircle,
  BookOpen,
  GraduationCap,
  User,
  MessageCircle,
  Bookmark,
  TrendingUp,
  Lock,
  Mail,
  Settings,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface FAQ {
  id: string;
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
  category: string;
  keywords: string[];
}

export default function HelpPage() {
  const { language } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: { en: 'All Topics', ar: 'جميع المواضيع' }, icon: HelpCircle },
    { id: 'account', label: { en: 'Account & Login', ar: 'الحساب وتسجيل الدخول' }, icon: User },
    { id: 'assessment', label: { en: 'Assessment Test', ar: 'اختبار التقييم' }, icon: GraduationCap },
    { id: 'majors', label: { en: 'Majors & Universities', ar: 'التخصصات والجامعات' }, icon: BookOpen },
    { id: 'community', label: { en: 'Community', ar: 'المجتمع' }, icon: MessageCircle },
    { id: 'features', label: { en: 'Features', ar: 'الميزات' }, icon: Settings },
    { id: 'technical', label: { en: 'Technical Issues', ar: 'المشاكل التقنية' }, icon: AlertCircle },
  ];

  const faqs: FAQ[] = [
    // Account & Login
    {
      id: 'login-1',
      category: 'account',
      question: {
        en: 'How do I create an account on Murshid?',
        ar: 'كيف أقوم بإنشاء حساب في مرشد؟'
      },
      answer: {
        en: 'Click the "Sign Up" button in the top right corner. You can register using your email and password, or sign up quickly with Google. After registration, verify your email address to activate your account.',
        ar: 'انقر على زر "التسجيل" في الزاوية العلوية اليمنى. يمكنك التسجيل باستخدام بريدك الإلكتروني وكلمة المرور، أو التسجيل السريع باستخدام Google. بعد التسجيل، تحقق من عنوان بريدك الإلكتروني لتفعيل حسابك.'
      },
      keywords: ['signup', 'register', 'create account', 'تسجيل', 'إنشاء حساب']
    },
    {
      id: 'login-2',
      category: 'account',
      question: {
        en: 'I forgot my password. How can I reset it?',
        ar: 'نسيت كلمة المرور. كيف يمكنني إعادة تعيينها؟'
      },
      answer: {
        en: 'On the login page, click "Forgot Password?" Enter your email address, and we\'ll send you a password reset link. Check your email inbox (and spam folder) and follow the instructions to create a new password.',
        ar: 'في صفحة تسجيل الدخول، انقر على "نسيت كلمة المرور؟" أدخل عنوان بريدك الإلكتروني، وسنرسل لك رابط إعادة تعيين كلمة المرور. تحقق من صندوق الوارد في بريدك الإلكتروني (ومجلد الرسائل غير المرغوب فيها) واتبع التعليمات لإنشاء كلمة مرور جديدة.'
      },
      keywords: ['password', 'reset', 'forgot', 'كلمة المرور', 'نسيت']
    },
    {
      id: 'login-3',
      category: 'account',
      question: {
        en: 'Can I change my email address?',
        ar: 'هل يمكنني تغيير عنوان بريدي الإلكتروني؟'
      },
      answer: {
        en: 'Yes! Go to your Profile page, click "Edit Profile", and update your email address. You\'ll need to verify the new email address before the change takes effect.',
        ar: 'نعم! انتقل إلى صفحة ملفك الشخصي، انقر على "تعديل الملف الشخصي"، وقم بتحديث عنوان بريدك الإلكتروني. ستحتاج إلى التحقق من عنوان البريد الإلكتروني الجديد قبل أن يسري التغيير.'
      },
      keywords: ['email', 'change', 'update', 'بريد إلكتروني', 'تغيير']
    },
    {
      id: 'login-4',
      category: 'account',
      question: {
        en: 'How do I sign in with Google?',
        ar: 'كيف أقوم بتسجيل الدخول باستخدام Google؟'
      },
      answer: {
        en: 'Click the "Login with Google" button on the login or signup page. You\'ll be redirected to Google to authorize the connection. Once authorized, you\'ll automatically be logged into Murshid with your Google account.',
        ar: 'انقر على زر "تسجيل الدخول باستخدام Google" في صفحة تسجيل الدخول أو التسجيل. سيتم توجيهك إلى Google للسماح بالاتصال. بمجرد السماح، سيتم تسجيل دخولك تلقائيًا إلى مرشد باستخدام حساب Google الخاص بك.'
      },
      keywords: ['google', 'oauth', 'social login', 'جوجل', 'تسجيل اجتماعي']
    },

    // Assessment Test
    {
      id: 'assessment-1',
      category: 'assessment',
      question: {
        en: 'What is the Major Recommendation Assessment?',
        ar: 'ما هو تقييم توصية التخصص؟'
      },
      answer: {
        en: 'The Major Recommendation Assessment is an AI-powered questionnaire that analyzes your interests, skills, personality, and preferences to recommend the best university majors for you. It takes about 5-10 minutes to complete and provides personalized results based on your unique profile.',
        ar: 'تقييم توصية التخصص هو استبيان مدعوم بالذكاء الاصطناعي يحلل اهتماماتك ومهاراتك وشخصيتك وتفضيلاتك للتوصية بأفضل التخصصات الجامعية لك. يستغرق حوالي 5-10 دقائق لإكماله ويوفر نتائج مخصصة بناءً على ملفك الشخصي الفريد.'
      },
      keywords: ['assessment', 'test', 'quiz', 'recommendation', 'تقييم', 'اختبار', 'توصية']
    },
    {
      id: 'assessment-2',
      category: 'assessment',
      question: {
        en: 'How many times can I take the assessment?',
        ar: 'كم مرة يمكنني إجراء التقييم؟'
      },
      answer: {
        en: 'You can take the assessment up to 3 times. This limit ensures quality results and prevents system abuse. Each assessment is saved so you can review your previous results anytime from the "Previous Tests" button on the assessment page.',
        ar: 'يمكنك إجراء التقييم حتى 3 مرات. يضمن هذا الحد نتائج عالية الجودة ويمنع إساءة استخدام النظام. يتم حفظ كل تقييم حتى تتمكن من مراجعة نتائجك السابقة في أي وقت من زر "الاختبارات السابقة" في صفحة التقييم.'
      },
      keywords: ['limit', 'attempts', 'retake', 'حد', 'محاولات', 'إعادة']
    },
    {
      id: 'assessment-3',
      category: 'assessment',
      question: {
        en: 'Can I save my assessment results?',
        ar: 'هل يمكنني حفظ نتائج التقييم؟'
      },
      answer: {
        en: 'Yes! After completing the assessment, click the "Save & Finish" button on the last question or the "Save Results" button on the results page. You must be logged in to save results. Saved results can be accessed anytime from your profile or the "Previous Tests" section.',
        ar: 'نعم! بعد إكمال التقييم، انقر على زر "حفظ وإنهاء" في السؤال الأخير أو زر "حفظ النتائج" في صفحة النتائج. يجب أن تكون مسجل الدخول لحفظ النتائج. يمكن الوصول إلى النتائج المحفوظة في أي وقت من ملفك الشخصي أو قسم "الاختبارات السابقة".'
      },
      keywords: ['save', 'results', 'download', 'حفظ', 'نتائج', 'تحميل']
    },
    {
      id: 'assessment-4',
      category: 'assessment',
      question: {
        en: 'How accurate are the AI recommendations?',
        ar: 'ما مدى دقة توصيات الذكاء الاصطناعي؟'
      },
      answer: {
        en: 'Our AI uses advanced algorithms powered by Google Gemini to analyze your responses and provide accurate recommendations based on current job market trends, personality psychology, and career success patterns. However, these are suggestions to guide your decision - we recommend discussing results with academic advisors and considering your personal circumstances.',
        ar: 'يستخدم الذكاء الاصطناعي لدينا خوارزميات متقدمة مدعومة بـ Google Gemini لتحليل إجاباتك وتقديم توصيات دقيقة بناءً على اتجاهات سوق العمل الحالية وعلم نفس الشخصية وأنماط النجاح المهني. ومع ذلك، هذه اقتراحات لتوجيه قرارك - نوصي بمناقشة النتائج مع المستشارين الأكاديميين والنظر في ظروفك الشخصية.'
      },
      keywords: ['accuracy', 'AI', 'reliable', 'دقة', 'ذكاء اصطناعي', 'موثوق']
    },
    {
      id: 'assessment-5',
      category: 'assessment',
      question: {
        en: 'What happens if I reach the 3-attempt limit?',
        ar: 'ماذا يحدث إذا وصلت لحد الـ 3 محاولات؟'
      },
      answer: {
        en: 'Once you reach the 3-attempt limit, you won\'t be able to take new assessments. However, you can still view all your previous test results anytime. The limit is in place to encourage thoughtful responses and maintain result quality. If you need special access, please contact support.',
        ar: 'بمجرد وصولك لحد الـ 3 محاولات، لن تتمكن من إجراء تقييمات جديدة. ومع ذلك، لا يزال بإمكانك عرض جميع نتائج اختباراتك السابقة في أي وقت. الحد موجود لتشجيع الإجابات المدروسة والحفاظ على جودة النتائج. إذا كنت بحاجة إلى وصول خاص، يرجى الاتصال بالدعم.'
      },
      keywords: ['limit reached', 'maximum', 'blocked', 'حد أقصى', 'محظور']
    },

    // Majors & Universities
    {
      id: 'majors-1',
      category: 'majors',
      question: {
        en: 'How do I browse available majors?',
        ar: 'كيف أتصفح التخصصات المتاحة؟'
      },
      answer: {
        en: 'Go to the "Majors" page from the navigation menu. You can browse all majors, use the search bar to find specific ones, or filter by category (Engineering, Medicine, Business, etc.) and degree type (Bachelor, Master, PhD, Diploma). Click on any major card to see detailed information.',
        ar: 'انتقل إلى صفحة "التخصصات" من قائمة التنقل. يمكنك تصفح جميع التخصصات، واستخدام شريط البحث للعثور على تخصصات محددة، أو التصفية حسب الفئة (الهندسة، الطب، الأعمال، إلخ) ونوع الدرجة (بكالوريوس، ماجستير، دكتوراه، دبلوم). انقر على أي بطاقة تخصص لرؤية معلومات مفصلة.'
      },
      keywords: ['browse', 'search', 'majors', 'filter', 'تصفح', 'بحث', 'تخصصات', 'فلتر']
    },
    {
      id: 'majors-2',
      category: 'majors',
      question: {
        en: 'What is the Global Majors Ranking?',
        ar: 'ما هو تصنيف التخصصات العالمي؟'
      },
      answer: {
        en: 'The Global Majors Ranking is an AI-powered list of the top 15 most in-demand majors based on 2025 global market data. It shows demand scores, salary ranges, growth rates, key skills, top industries, and detailed reasoning for each ranking. Click the "Rankings" tab on the Majors page to view it.',
        ar: 'تصنيف التخصصات العالمي هو قائمة مدعومة بالذكاء الاصطناعي لأفضل 15 تخصصًا مطلوبًا بناءً على بيانات السوق العالمية لعام 2025. يعرض درجات الطلب ونطاقات الرواتب ومعدلات النمو والمهارات الرئيسية وأهم الصناعات والتفسير المفصل لكل تصنيف. انقر على علامة التبويب "التصنيفات" في صفحة التخصصات لعرضها.'
      },
      keywords: ['ranking', 'demand', 'market', 'trends', 'تصنيف', 'طلب', 'سوق', 'اتجاهات']
    },
    {
      id: 'majors-3',
      category: 'majors',
      question: {
        en: 'How do I find universities offering a specific major?',
        ar: 'كيف أجد الجامعات التي تقدم تخصصًا معينًا؟'
      },
      answer: {
        en: 'Click on any major card to view its detail page. There you\'ll find a complete list of universities offering that major, including location, tuition fees, admission requirements, and other important information. You can also visit the "Universities" page to browse by location or search for specific institutions.',
        ar: 'انقر على أي بطاقة تخصص لعرض صفحة التفاصيل الخاصة به. هناك ستجد قائمة كاملة بالجامعات التي تقدم هذا التخصص، بما في ذلك الموقع ورسوم الدراسة ومتطلبات القبول ومعلومات مهمة أخرى. يمكنك أيضًا زيارة صفحة "الجامعات" للتصفح حسب الموقع أو البحث عن مؤسسات محددة.'
      },
      keywords: ['universities', 'institutions', 'where to study', 'جامعات', 'مؤسسات', 'أين أدرس']
    },
    {
      id: 'majors-4',
      category: 'majors',
      question: {
        en: 'Can I bookmark my favorite majors and universities?',
        ar: 'هل يمكنني حفظ التخصصات والجامعات المفضلة؟'
      },
      answer: {
        en: 'Yes! Click the bookmark icon on any major or university card to save it to your favorites. You must be logged in to use bookmarks. Access all your saved items from the "Bookmarks" page in the navigation menu. You can remove bookmarks anytime by clicking the bookmark icon again.',
        ar: 'نعم! انقر على أيقونة الإشارة المرجعية على أي بطاقة تخصص أو جامعة لحفظها في مفضلاتك. يجب أن تكون مسجل الدخول لاستخدام الإشارات المرجعية. يمكنك الوصول إلى جميع العناصر المحفوظة من صفحة "الإشارات المرجعية" في قائمة التنقل. يمكنك إزالة الإشارات المرجعية في أي وقت بالنقر على أيقونة الإشارة المرجعية مرة أخرى.'
      },
      keywords: ['bookmark', 'save', 'favorites', 'إشارة مرجعية', 'حفظ', 'مفضلات']
    },

    // Community
    {
      id: 'community-1',
      category: 'community',
      question: {
        en: 'How do I post a question in the community?',
        ar: 'كيف أنشر سؤالاً في المجتمع؟'
      },
      answer: {
        en: 'Go to the Community page and click "Create Post" or "Ask Question". Write your question with a clear title and detailed description. Add relevant tags to help others find your post. You must be logged in to create posts. Follow community guidelines for respectful and helpful interactions.',
        ar: 'انتقل إلى صفحة المجتمع وانقر على "إنشاء منشور" أو "اطرح سؤالاً". اكتب سؤالك بعنوان واضح ووصف مفصل. أضف علامات ذات صلة لمساعدة الآخرين في العثور على منشورك. يجب أن تكون مسجل الدخول لإنشاء منشورات. اتبع إرشادات المجتمع للتفاعلات المحترمة والمفيدة.'
      },
      keywords: ['post', 'question', 'ask', 'community', 'منشور', 'سؤال', 'اطرح', 'مجتمع']
    },
    {
      id: 'community-2',
      category: 'community',
      question: {
        en: 'Can I edit or delete my posts?',
        ar: 'هل يمكنني تعديل أو حذف منشوراتي؟'
      },
      answer: {
        en: 'Yes! Click on your post to view it, then click the three-dot menu (...) in the top right corner. You\'ll see options to "Edit Post" or "Delete Post". You can only edit or delete your own posts. Deleted posts cannot be recovered.',
        ar: 'نعم! انقر على منشورك لعرضه، ثم انقر على قائمة النقاط الثلاث (...) في الزاوية العلوية اليمنى. سترى خيارات "تعديل المنشور" أو "حذف المنشور". يمكنك فقط تعديل أو حذف منشوراتك الخاصة. لا يمكن استرداد المنشورات المحذوفة.'
      },
      keywords: ['edit', 'delete', 'post', 'modify', 'تعديل', 'حذف', 'منشور']
    },
    {
      id: 'community-3',
      category: 'community',
      question: {
        en: 'How does the voting system work?',
        ar: 'كيف يعمل نظام التصويت؟'
      },
      answer: {
        en: 'You can upvote helpful posts and answers by clicking the up arrow, or downvote unhelpful content with the down arrow. The vote count shows how valuable the community finds each post. High-voted posts appear at the top, making it easier to find quality content.',
        ar: 'يمكنك التصويت الإيجابي للمنشورات والإجابات المفيدة بالنقر على السهم العلوي، أو التصويت السلبي للمحتوى غير المفيد بالسهم السفلي. يُظهر عدد الأصوات مدى قيمة كل منشور للمجتمع. تظهر المنشورات الحاصلة على أصوات عالية في الأعلى، مما يسهل العثور على المحتوى الجيد.'
      },
      keywords: ['vote', 'upvote', 'downvote', 'like', 'تصويت', 'إعجاب']
    },
    {
      id: 'community-4',
      category: 'community',
      question: {
        en: 'How do I report inappropriate content?',
        ar: 'كيف أبلغ عن محتوى غير مناسب؟'
      },
      answer: {
        en: 'Click the three-dot menu (...) on any post or comment and select "Report". Choose a reason for reporting (spam, harassment, inappropriate content, etc.) and add any additional details. Our moderation team will review reports promptly and take appropriate action.',
        ar: 'انقر على قائمة النقاط الثلاث (...) على أي منشور أو تعليق واختر "إبلاغ". اختر سببًا للإبلاغ (رسائل غير مرغوب فيها، مضايقات، محتوى غير مناسب، إلخ) وأضف أي تفاصيل إضافية. سيراجع فريق الإشراف لدينا التقارير بسرعة ويتخذ الإجراء المناسب.'
      },
      keywords: ['report', 'flag', 'inappropriate', 'spam', 'إبلاغ', 'غير مناسب', 'رسائل مزعجة']
    },
    {
      id: 'community-5',
      category: 'community',
      question: {
        en: 'What are targeted questions?',
        ar: 'ما هي الأسئلة المستهدفة؟'
      },
      answer: {
        en: 'Targeted questions allow you to ask questions specifically to students/specialists from a certain major or university. When creating a post, you can optionally enable targeting and select either a specific major or university. Only users from that major/university (plus admins) can respond or comment on targeted posts. This helps you get more relevant answers from the right audience.',
        ar: 'الأسئلة المستهدفة تتيح لك طرح أسئلة محددة للطلاب/المتخصصين من تخصص أو جامعة معينة. عند إنشاء منشور، يمكنك اختياريًا تفعيل الاستهداف واختيار تخصص أو جامعة معينة. فقط المستخدمون من ذلك التخصص/الجامعة (بالإضافة إلى المشرفين) يمكنهم الرد أو التعليق على المنشورات المستهدفة. يساعدك هذا في الحصول على إجابات أكثر صلة من الجمهور المناسب.'
      },
      keywords: ['targeted', 'major', 'university', 'restricted', 'مستهدف', 'تخصص', 'جامعة', 'مقيد']
    },
    {
      id: 'community-6',
      category: 'community',
      question: {
        en: 'Why can\'t I respond to a targeted question?',
        ar: 'لماذا لا يمكنني الرد على سؤال مستهدف؟'
      },
      answer: {
        en: 'If you see a message saying you cannot respond to a targeted question, it means the question is specifically directed to students/specialists from a different major or university than yours. Only users matching the target criteria can respond. You can still view the question and its answers, but cannot add your own response or comments.',
        ar: 'إذا رأيت رسالة تقول إنك لا يمكنك الرد على سؤال مستهدف، فهذا يعني أن السؤال موجه خصيصًا للطلاب/المتخصصين من تخصص أو جامعة مختلفة عن تخصصك أو جامعتك. فقط المستخدمون المطابقون لمعايير الهدف يمكنهم الرد. لا يزال بإمكانك عرض السؤال وإجاباته، ولكن لا يمكنك إضافة ردك أو تعليقاتك.'
      },
      keywords: ['cannot respond', 'restricted', 'targeted', 'لا يمكن الرد', 'مقيد', 'مستهدف']
    },
    {
      id: 'account-5',
      category: 'account',
      question: {
        en: 'Do specialists need to select a major?',
        ar: 'هل يحتاج المتخصصون لاختيار تخصص؟'
      },
      answer: {
        en: 'Yes! Specialists must select their major during signup or profile setup. This ensures specialists can respond to questions targeted to their field of expertise. The major selection is required and helps match specialists with relevant questions in the community.',
        ar: 'نعم! يجب على المتخصصين اختيار تخصصهم أثناء التسجيل أو إعداد الملف الشخصي. يضمن هذا أن المتخصصين يمكنهم الرد على الأسئلة الموجهة لمجال خبرتهم. اختيار التخصص مطلوب ويساعد في مطابقة المتخصصين مع الأسئلة ذات الصلة في المجتمع.'
      },
      keywords: ['specialist', 'major', 'required', 'متخصص', 'تخصص', 'مطلوب']
    },

    // Features
    {
      id: 'features-1',
      category: 'features',
      question: {
        en: 'Is Murshid free to use?',
        ar: 'هل استخدام مرشد مجاني؟'
      },
      answer: {
        en: 'Yes! Murshid is completely free to use. You can browse majors, take assessments, join the community, bookmark favorites, and access all features without any payment. We believe quality educational guidance should be accessible to everyone.',
        ar: 'نعم! استخدام مرشد مجاني تمامًا. يمكنك تصفح التخصصات وإجراء التقييمات والانضمام إلى المجتمع وحفظ المفضلات والوصول إلى جميع الميزات دون أي دفع. نؤمن بأن التوجيه التعليمي الجيد يجب أن يكون متاحًا للجميع.'
      },
      keywords: ['free', 'cost', 'price', 'payment', 'مجاني', 'سعر', 'دفع']
    },
    {
      id: 'features-2',
      category: 'features',
      question: {
        en: 'Does Murshid support both English and Arabic?',
        ar: 'هل يدعم مرشد اللغتين الإنجليزية والعربية؟'
      },
      answer: {
        en: 'Yes! Murshid is fully bilingual. You can switch between English and Arabic anytime using the language toggle in the top navigation bar. All content, including majors, universities, community posts, and AI assessments, is available in both languages.',
        ar: 'نعم! مرشد ثنائي اللغة بالكامل. يمكنك التبديل بين الإنجليزية والعربية في أي وقت باستخدام مفتاح اللغة في شريط التنقل العلوي. جميع المحتويات، بما في ذلك التخصصات والجامعات ومنشورات المجتمع وتقييمات الذكاء الاصطناعي، متاحة بكلا اللغتين.'
      },
      keywords: ['language', 'arabic', 'english', 'bilingual', 'لغة', 'عربي', 'إنجليزي']
    },
    {
      id: 'features-3',
      category: 'features',
      question: {
        en: 'Can I use Murshid on my mobile phone?',
        ar: 'هل يمكنني استخدام مرشد على هاتفي المحمول؟'
      },
      answer: {
        en: 'Absolutely! Murshid is fully responsive and works perfectly on all devices - smartphones, tablets, and desktop computers. The mobile experience is optimized for easy navigation and quick access to all features on the go.',
        ar: 'بالتأكيد! مرشد متجاوب بالكامل ويعمل بشكل مثالي على جميع الأجهزة - الهواتف الذكية والأجهزة اللوحية وأجهزة الكمبيوتر المكتبية. تم تحسين تجربة الهاتف المحمول للتنقل السهل والوصول السريع إلى جميع الميزات أثناء التنقل.'
      },
      keywords: ['mobile', 'phone', 'tablet', 'responsive', 'هاتف', 'جوال', 'لوحي']
    },
    {
      id: 'features-4',
      category: 'features',
      question: {
        en: 'Does Murshid have a dark mode?',
        ar: 'هل يحتوي مرشد على وضع داكن؟'
      },
      answer: {
        en: 'Yes! Click the sun/moon icon in the top navigation bar to toggle between light and dark modes. Your preference is automatically saved and will be applied every time you visit Murshid. Dark mode reduces eye strain and saves battery on devices with OLED screens.',
        ar: 'نعم! انقر على أيقونة الشمس/القمر في شريط التنقل العلوي للتبديل بين الأوضاع الفاتحة والداكنة. يتم حفظ تفضيلك تلقائيًا وسيتم تطبيقه في كل مرة تزور فيها مرشد. يقلل الوضع الداكن من إجهاد العين ويوفر البطارية على الأجهزة ذات شاشات OLED.'
      },
      keywords: ['dark mode', 'theme', 'light', 'appearance', 'وضع داكن', 'مظهر']
    },

    // Technical Issues
    {
      id: 'tech-1',
      category: 'technical',
      question: {
        en: 'The website is loading slowly. What can I do?',
        ar: 'الموقع يتحمل ببطء. ماذا يمكنني أن أفعل؟'
      },
      answer: {
        en: 'Try these steps: 1) Clear your browser cache and cookies, 2) Ensure you have a stable internet connection, 3) Try a different browser (Chrome, Firefox, Safari), 4) Disable browser extensions temporarily, 5) Refresh the page. If the problem persists, contact our support team.',
        ar: 'جرب هذه الخطوات: 1) امسح ذاكرة التخزين المؤقت وملفات تعريف الارتباط في المتصفح، 2) تأكد من أن لديك اتصال إنترنت مستقر، 3) جرب متصفحًا مختلفًا (Chrome، Firefox، Safari)، 4) عطل إضافات المتصفح مؤقتًا، 5) حدث الصفحة. إذا استمرت المشكلة، اتصل بفريق الدعم لدينا.'
      },
      keywords: ['slow', 'loading', 'performance', 'بطيء', 'تحميل', 'أداء']
    },
    {
      id: 'tech-2',
      category: 'technical',
      question: {
        en: 'I\'m getting an error message. What should I do?',
        ar: 'أحصل على رسالة خطأ. ماذا علي أن أفعل؟'
      },
      answer: {
        en: 'Take a screenshot of the error message and note what you were doing when it occurred. Try refreshing the page or logging out and back in. If the error persists, please contact our support team with the screenshot and details about when the error happens.',
        ar: 'التقط لقطة شاشة لرسالة الخطأ ولاحظ ما كنت تفعله عندما حدث. حاول تحديث الصفحة أو تسجيل الخروج والعودة مرة أخرى. إذا استمر الخطأ، يرجى الاتصال بفريق الدعم لدينا مع لقطة الشاشة وتفاصيل حول متى يحدث الخطأ.'
      },
      keywords: ['error', 'bug', 'problem', 'issue', 'خطأ', 'مشكلة']
    },
    {
      id: 'tech-3',
      category: 'technical',
      question: {
        en: 'My bookmarks disappeared. How can I recover them?',
        ar: 'اختفت إشاراتي المرجعية. كيف يمكنني استردادها؟'
      },
      answer: {
        en: 'Bookmarks are tied to your user account. Make sure you\'re logged in with the same account you used to create the bookmarks. If you\'re logged in and still can\'t see them, try clearing your browser cache and reloading the page. If the issue continues, contact support.',
        ar: 'ترتبط الإشارات المرجعية بحساب المستخدم الخاص بك. تأكد من أنك مسجل الدخول بنفس الحساب الذي استخدمته لإنشاء الإشارات المرجعية. إذا كنت مسجل الدخول ولا يزال لا يمكنك رؤيتها، حاول مسح ذاكرة التخزين المؤقت للمتصفح وإعادة تحميل الصفحة. إذا استمرت المشكلة، اتصل بالدعم.'
      },
      keywords: ['bookmarks lost', 'disappeared', 'missing', 'إشارات مفقودة', 'اختفت']
    },
    {
      id: 'tech-4',
      category: 'technical',
      question: {
        en: 'How do I clear my browser cache?',
        ar: 'كيف أمسح ذاكرة التخزين المؤقت للمتصفح؟'
      },
      answer: {
        en: 'For most browsers: Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac), select "Cached images and files" and "Cookies", choose "All time" as the time range, then click "Clear data". Alternatively, check your browser\'s settings menu under "Privacy" or "History".',
        ar: 'لمعظم المتصفحات: اضغط على Ctrl+Shift+Delete (Windows) أو Cmd+Shift+Delete (Mac)، حدد "الصور والملفات المخزنة مؤقتًا" و"ملفات تعريف الارتباط"، اختر "كل الوقت" كنطاق زمني، ثم انقر على "مسح البيانات". بدلاً من ذلك، تحقق من قائمة إعدادات المتصفح ضمن "الخصوصية" أو "السجل".'
      },
      keywords: ['cache', 'clear', 'cookies', 'ذاكرة مؤقتة', 'مسح', 'ملفات']
    },
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question[language === 'ar' ? 'ar' : 'en'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer[language === 'ar' ? 'ar' : 'en'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const quickLinks = [
    {
      title: { en: 'Assessment Guide', ar: 'دليل التقييم' },
      description: { en: 'Learn how to take the test', ar: 'تعلم كيفية إجراء الاختبار' },
      icon: GraduationCap,
      link: '/assessment'
    },
    {
      title: { en: 'Browse Majors', ar: 'تصفح التخصصات' },
      description: { en: 'Explore all available majors', ar: 'استكشف جميع التخصصات المتاحة' },
      icon: BookOpen,
      link: '/majors'
    },
    {
      title: { en: 'Community Forum', ar: 'منتدى المجتمع' },
      description: { en: 'Ask questions and get answers', ar: 'اطرح الأسئلة واحصل على إجابات' },
      icon: MessageCircle,
      link: '/community'
    },
    {
      title: { en: 'My Bookmarks', ar: 'إشاراتي المرجعية' },
      description: { en: 'View your saved items', ar: 'عرض العناصر المحفوظة' },
      icon: Bookmark,
      link: '/bookmarks'
    },
  ];

  return (
    <PageAnimation>
      <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
        <Navbar />
        
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <ScrollAnimation>
              <div className="text-center mb-12">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <HelpCircle className="w-10 h-10 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4" dir={language}>
                  {language === 'ar' ? 'المساعدة والأسئلة الشائعة' : 'Help & FAQs'}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" dir={language}>
                  {language === 'ar' 
                    ? 'ابحث عن إجابات لأسئلتك وتعلم كيفية استخدام مرشد بفعالية'
                    : 'Find answers to your questions and learn how to use Murshid effectively'}
                </p>
              </div>
            </ScrollAnimation>

            {/* Search Bar */}
            <ScrollAnimation delay={0.1}>
              <div className="max-w-3xl mx-auto mb-12">
                <div className="relative">
                  <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                  <Input
                    type="text"
                    placeholder={language === 'ar' ? 'ابحث عن سؤالك...' : 'Search for your question...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${language === 'ar' ? 'pr-12' : 'pl-12'} py-6 rounded-2xl border-0 bg-white dark:bg-gray-800 shadow-lg text-base`}
                    dir={language}
                  />
                </div>
              </div>
            </ScrollAnimation>

            {/* Quick Links */}
            <ScrollAnimation delay={0.2}>
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center" dir={language}>
                  {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickLinks.map((link, index) => (
                    <ScrollAnimation key={index} delay={0.05 * index}>
                      <Card 
                        className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-blue-400 dark:hover:border-blue-600"
                        onClick={() => window.location.href = link.link}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <link.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2" dir={language}>
                            {link.title[language === 'ar' ? 'ar' : 'en']}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400" dir={language}>
                            {link.description[language === 'ar' ? 'ar' : 'en']}
                          </p>
                        </CardContent>
                      </Card>
                    </ScrollAnimation>
                  ))}
                </div>
              </div>
            </ScrollAnimation>

            {/* Category Filter */}
            <ScrollAnimation delay={0.3}>
              <div className="mb-8">
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((category, index) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category.id)}
                      className="rounded-xl gap-2"
                    >
                      <category.icon className="w-4 h-4" />
                      {category.label[language === 'ar' ? 'ar' : 'en']}
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollAnimation>

            {/* FAQs */}
            <ScrollAnimation delay={0.4}>
              <Card className="rounded-3xl shadow-xl border-2">
                <CardHeader>
                  <CardTitle className="text-2xl" dir={language}>
                    {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
                  </CardTitle>
                  <CardDescription dir={language}>
                    {language === 'ar' 
                      ? `عرض ${filteredFAQs.length} سؤال`
                      : `Showing ${filteredFAQs.length} questions`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredFAQs.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400" dir={language}>
                        {language === 'ar' 
                          ? 'لم يتم العثور على نتائج. جرب كلمات بحث مختلفة.'
                          : 'No results found. Try different search terms.'}
                      </p>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                      {filteredFAQs.map((faq, index) => (
                        <AccordionItem 
                          key={faq.id} 
                          value={faq.id}
                          className="border-2 rounded-xl px-4 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                        >
                          <AccordionTrigger className="hover:no-underline dark:hover:no-underline px-4 rounded-xl py-4" dir={language}>
                            <div className="flex items-start gap-3 text-left">
                              <Badge variant="outline" className="mt-1">
                                {index + 1}
                              </Badge>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {faq.question[language === 'ar' ? 'ar' : 'en']}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-11" dir={language}>
                              {faq.answer[language === 'ar' ? 'ar' : 'en']}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </ScrollAnimation>

            {/* Contact Support */}
            <ScrollAnimation delay={0.5}>
              <Card className="mt-12 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8 text-center">
                  <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" dir={language}>
                    {language === 'ar' ? 'لا يزال بحاجة للمساعدة؟' : 'Still Need Help?'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto" dir={language}>
                    {language === 'ar'
                      ? 'إذا لم تجد ما تبحث عنه، فريق الدعم لدينا هنا لمساعدتك. اتصل بنا وسنعود إليك في أقرب وقت ممكن.'
                      : 'If you didn\'t find what you\'re looking for, our support team is here to help. Contact us and we\'ll get back to you as soon as possible.'}
                  </p>
                  <Button 
                    size="lg" 
                    className="rounded-xl gap-2"
                    onClick={() => window.location.href = '/contact'}
                  >
                    <Mail className="w-4 h-4" />
                    {language === 'ar' ? 'اتصل بالدعم' : 'Contact Support'}
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}
