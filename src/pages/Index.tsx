import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { 
  Search, 
  Target, 
  CheckCircle, 
  Star, 
  GraduationCap, 
  BookOpen, 
  Users, 
  TrendingUp 
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const { user } = useAuth();
  
  const steps = [
    {
      icon: Search,
      title: t('homepage.exploreInterests'),
      description: t('homepage.exploreInterestsDesc'),
      color: 'from-blue-300 to-blue-400',
    },
    {
      icon: Target,
      title: t('homepage.getRecommendations'),
      description: t('homepage.getRecommendationsDesc'),
      color: 'from-purple-300 to-purple-400',
    },
    {
      icon: CheckCircle,
      title: t('homepage.makeDecision'),
      description: t('homepage.makeDecisionDesc'),
      color: 'from-green-300 to-green-400',
    },
  ];

  const features = [
    {
      icon: GraduationCap,
      title: t('homepage.diverseMajors'),
      description: t('homepage.diverseMajorsDesc'),
      color: 'bg-blue-50 text-blue-500 dark:bg-blue-950/50 dark:text-blue-300',
    },
    {
      icon: BookOpen,
      title: t('homepage.comprehensiveInfo'),
      description: t('homepage.comprehensiveInfoDesc'),
      color: 'bg-purple-50 text-purple-500 dark:bg-purple-950/50 dark:text-purple-300',
    },
    {
      icon: Users,
      title: t('homepage.supportiveCommunity'),
      description: t('homepage.supportiveCommunityDesc'),
      color: 'bg-pink-50 text-pink-500 dark:bg-pink-950/50 dark:text-pink-300',
    },
    {
      icon: TrendingUp,
      title: t('homepage.futureVision'),
      description: t('homepage.futureVisionDesc'),
      color: 'bg-green-50 text-green-500 dark:bg-green-950/50 dark:text-green-300',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Ahmed',
      major: language === 'ar' ? 'طالبة هندسة' : 'Engineering Student',
      text: language === 'ar' 
        ? 'ساعدني مرشد في اكتشاف شغفي بالهندسة المعمارية. الآن أنا في السنة الثانية وسعيدة بقراري!'
        : 'Murshid helped me discover my passion for architecture. Now I\'m in my second year and happy with my decision!',
      rating: 5,
    },
    {
      name: 'Mohammed Ali',
      major: language === 'ar' ? 'طالب طب' : 'Medical Student',
      text: language === 'ar'
        ? 'كنت محتاراً بين عدة تخصصات. الاختبار في مرشد ساعدني كثيراً في فهم ميولي الحقيقية.'
        : 'I was confused between several majors. The test in Murshid helped me a lot in understanding my true tendencies.',
      rating: 5,
    },
    {
      name: 'Nora Khalid',
      major: language === 'ar' ? 'طالبة تقنية معلومات' : 'IT Student',
      text: language === 'ar'
        ? 'المنصة سهلة الاستخدام والمعلومات دقيقة ومفيدة. أنصح كل طالب ثانوي باستخدامها.'
        : 'The platform is easy to use and the information is accurate and useful. I recommend every high school student to use it.',
      rating: 5,
    },
  ];

  const onNavigate = (page: string) => {
    if (page === 'quiz' || page === 'assessment') {
      // If user is logged in, go to assessment, otherwise go to login
      if (user) {
        navigate('/assessment');
      } else {
        navigate('/login');
      }
    } else if (page === 'majors') {
      // If user is logged in, go to majors, otherwise go to login
      if (user) {
        navigate('/majors');
      } else {
        navigate('/login');
      }
    } else if (page === 'universities') {
      // If user is logged in, go to universities, otherwise go to login
      if (user) {
        navigate('/universities');
      } else {
        navigate('/login');
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className={`text-center ${language === 'ar' ? 'lg:text-right order-2 lg:order-1' : 'lg:text-left order-2 lg:order-1'}`} dir={language}>
              <div className="inline-block mb-6">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full">
                  {t('homepage.welcome')}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {t('homepage.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                {t('homepage.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => onNavigate('quiz')}
                  className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl px-8 py-6 shadow-lg"
                >
                  {t('homepage.startNow')}
                </Button>
                <Button
                  onClick={() => onNavigate('majors')}
                  variant="outline"
                  className="rounded-2xl px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {t('homepage.browseMajors')}
                </Button>
                <Button
                  onClick={() => onNavigate('universities')}
                  variant="outline"
                  className="rounded-2xl px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {t('homepage.browseUniversities')}
                </Button>
              </div>
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8">
                <div className="text-center">
                  <div className="text-gray-900 dark:text-gray-100 font-bold text-xl">5000+</div>
                  <div className="text-gray-600 dark:text-gray-400">{t('homepage.students')}</div>
                </div>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-gray-900 dark:text-gray-100 font-bold text-xl">150+</div>
                  <div className="text-gray-600 dark:text-gray-400">{t('homepage.majors')}</div>
                </div>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-gray-900 dark:text-gray-100 font-bold text-xl">98%</div>
                  <div className="text-gray-600 dark:text-gray-400">{t('homepage.satisfaction')}</div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-yellow-200 dark:bg-yellow-400/30 rounded-full opacity-50 blur-2xl"></div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-200 dark:bg-blue-400/30 rounded-full opacity-50 blur-2xl"></div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1729824186959-ba83cbd1978d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnQlMjBzdHVkeWluZ3xlbnwxfHx8fDE3NjA5MDQ3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Happy student"
                  className="relative rounded-3xl shadow-2xl w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4" dir={language}>
              {t('homepage.howItWorks')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" dir={language}>
              {t('homepage.threeSteps')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={step.title} className="relative p-8 text-center rounded-3xl shadow-lg hover:shadow-xl transition-shadow border-0 bg-white dark:bg-gray-800">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-12">
                  <h3 className="text-gray-900 dark:text-gray-100 mb-3 font-semibold" dir={language}>{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300" dir={language}>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block absolute top-1/2 -right-4 w-8 text-gray-300 dark:text-gray-600`}>
                    {language === 'ar' ? '←' : '→'}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4" dir={language}>
              {t('homepage.whyChooseMurshid')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" dir={language}>
              {t('homepage.whyChooseDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 rounded-3xl shadow-md hover:shadow-lg transition-all border-0 bg-white dark:bg-gray-800">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-gray-900 dark:text-gray-100 mb-2 font-semibold" dir={language}>{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300" dir={language}>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4" dir={language}>
              {t('homepage.testimonials')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" dir={language}>
              {t('homepage.testimonialsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="p-8 rounded-3xl shadow-md hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <Star key={`star-${i}`} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-right" dir={language}>
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language}>
                    <div className="text-gray-900 dark:text-gray-100 font-semibold">{testimonial.name}</div>
                    <div className="text-gray-500 dark:text-gray-400">{testimonial.major}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" dir={language}>
            {t('homepage.readyToDiscover')}
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto" dir={language}>
            {t('homepage.readyToDiscoverDesc')}
          </p>
          <Button
            onClick={() => onNavigate('quiz')}
            className="bg-white text-blue-600 hover:bg-gray-100 rounded-2xl px-8 py-6 shadow-lg"
          >
            {t('homepage.startFreeTest')}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
