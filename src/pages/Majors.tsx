import Navbar from "@/components/Navbar";
import { useState } from 'react';
import { Search, Code, Stethoscope, Building, Calculator, Palette, FlaskConical, Briefcase, Globe, Cpu, BookOpen, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { useNavigate } from 'react-router-dom';

export default function MajorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: t('categories.all'), icon: BookOpen },
    { id: 'engineering', label: t('categories.engineering'), icon: Wrench },
    { id: 'medical', label: t('categories.medical'), icon: Stethoscope },
    { id: 'business', label: t('categories.business'), icon: Briefcase },
    { id: 'tech', label: t('categories.tech'), icon: Cpu },
    { id: 'science', label: t('categories.science'), icon: FlaskConical },
    { id: 'arts', label: t('categories.arts'), icon: Palette },
  ];

  const majors = [
    {
      id: 1,
      title: language === 'ar' ? 'علوم الحاسب' : 'Computer Science',
      category: 'tech',
      icon: Code,
      description: language === 'ar' 
        ? 'تطوير البرمجيات، الذكاء الاصطناعي، وأمن المعلومات'
        : 'Software development, artificial intelligence, and information security',
      demand: language === 'ar' ? 'عالي' : 'High',
      duration: language === 'ar' ? '4 سنوات' : '4 years',
      color: 'from-blue-400 to-blue-500',
    },
    {
      id: 2,
      title: language === 'ar' ? 'الطب البشري' : 'Human Medicine',
      category: 'medical',
      icon: Stethoscope,
      description: language === 'ar' 
        ? 'تشخيص وعلاج الأمراض والعناية بصحة المرضى'
        : 'Diagnosing and treating diseases and caring for patient health',
      demand: language === 'ar' ? 'عالي جداً' : 'Very High',
      duration: language === 'ar' ? '7 سنوات' : '7 years',
      color: 'from-red-400 to-red-500',
    },
    {
      id: 3,
      title: language === 'ar' ? 'الهندسة المعمارية' : 'Architecture Engineering',
      category: 'engineering',
      icon: Building,
      description: language === 'ar' 
        ? 'تصميم وتخطيط المباني والمنشآت'
        : 'Designing and planning buildings and structures',
      demand: language === 'ar' ? 'متوسط' : 'Medium',
      duration: language === 'ar' ? '5 سنوات' : '5 years',
      color: 'from-gray-400 to-gray-500',
    },
    {
      id: 4,
      title: language === 'ar' ? 'المحاسبة' : 'Accounting',
      category: 'business',
      icon: Calculator,
      description: language === 'ar' 
        ? 'إدارة السجلات المالية والتدقيق المحاسبي'
        : 'Managing financial records and accounting audit',
      demand: language === 'ar' ? 'متوسط' : 'Medium',
      duration: language === 'ar' ? '4 سنوات' : '4 years',
      color: 'from-green-400 to-green-500',
    },
    {
      id: 5,
      title: language === 'ar' ? 'التصميم الجرافيكي' : 'Graphic Design',
      category: 'arts',
      icon: Palette,
      description: language === 'ar' 
        ? 'الإبداع البصري والتواصل من خلال التصميم'
        : 'Visual creativity and communication through design',
      demand: language === 'ar' ? 'متوسط' : 'Medium',
      duration: language === 'ar' ? '4 سنوات' : '4 years',
      color: 'from-pink-400 to-pink-500',
    },
    {
      id: 6,
      title: language === 'ar' ? 'الكيمياء' : 'Chemistry',
      category: 'science',
      icon: FlaskConical,
      description: language === 'ar' 
        ? 'دراسة المواد وخصائصها وتفاعلاتها'
        : 'Studying materials, their properties and interactions',
      demand: language === 'ar' ? 'متوسط' : 'Medium',
      duration: language === 'ar' ? '4 سنوات' : '4 years',
      color: 'from-purple-400 to-purple-500',
    },
    {
      id: 7,
      title: language === 'ar' ? 'إدارة الأعمال' : 'Business Administration',
      category: 'business',
      icon: Briefcase,
      description: language === 'ar' 
        ? 'تخطيط وإدارة الموارد والعمليات التجارية'
        : 'Planning and managing resources and business operations',
      demand: language === 'ar' ? 'عالي' : 'High',
      duration: language === 'ar' ? '4 سنوات' : '4 years',
      color: 'from-indigo-400 to-indigo-500',
    },
    {
      id: 8,
      title: language === 'ar' ? 'العلاقات الدولية' : 'International Relations',
      category: 'arts',
      icon: Globe,
      description: language === 'ar' 
        ? 'دراسة السياسة والدبلوماسية العالمية'
        : 'Studying global politics and diplomacy',
      demand: language === 'ar' ? 'متوسط' : 'Medium',
      duration: language === 'ar' ? '4 سنوات' : '4 years',
      color: 'from-cyan-400 to-cyan-500',
    },
    {
      id: 9,
      title: language === 'ar' ? 'هندسة الحاسب' : 'Computer Engineering',
      category: 'engineering',
      icon: Cpu,
      description: language === 'ar' 
        ? 'تصميم وتطوير الأجهزة والأنظمة الحاسوبية'
        : 'Designing and developing computer hardware and systems',
      demand: language === 'ar' ? 'عالي' : 'High',
      duration: language === 'ar' ? '5 سنوات' : '5 years',
      color: 'from-yellow-400 to-yellow-500',
    },
  ];

  const filteredMajors = majors.filter((major) => {
    const matchesCategory = selectedCategory === 'all' || major.category === selectedCategory;
    const matchesSearch = major.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         major.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDemandColor = (demand: string) => {
    const isHigh = language === 'ar' 
      ? (demand === 'عالي' || demand === 'عالي جداً')
      : (demand === 'High' || demand === 'Very High');
    
    return isHigh 
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  };

  const handleStartTest = () => {
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <Navbar />
      
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4" dir={language}>
              {t('majors.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" dir={language}>
              {t('majors.subtitle')}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <Input
                type="text"
                placeholder={t('majors.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${language === 'ar' ? 'pr-12' : 'pl-12'} py-6 rounded-2xl border-0 bg-white dark:bg-gray-800 shadow-md`}
                dir={language}
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className={`rounded-2xl px-6 gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                dir={language}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-300" dir={language}>
              {t('majors.resultsCount', { count: filteredMajors.length })}
            </p>
          </div>

          {/* Majors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMajors.map((major) => (
              <Card
                key={major.id}
                className="p-6 rounded-3xl shadow-md hover:shadow-xl transition-all border-0 bg-white dark:bg-gray-800 cursor-pointer group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${major.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <major.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-gray-900 dark:text-gray-100 mb-2" dir={language}>
                  {major.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4" dir={language}>
                  {major.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full ${getDemandColor(major.demand)}`} dir={language}>
                    {t('majors.demand')}: {major.demand}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {major.duration}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  className="w-full rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                  dir={language}
                >
                  {t('majors.learnMore')} {language === 'ar' ? '←' : '→'}
                </Button>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredMajors.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-gray-900 dark:text-gray-100 mb-2" dir={language}>
                {t('majors.noResults')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300" dir={language}>
                {t('majors.noResultsDesc')}
              </p>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-20 bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-600 dark:to-purple-600 rounded-3xl p-12 text-center shadow-xl">
            <h2 className="text-white mb-4" dir={language}>
              {t('majors.stillConfused')}
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto" dir={language}>
              {t('majors.stillConfusedDesc')}
            </p>
            <Button 
              onClick={handleStartTest}
              className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-2xl px-8 py-6 shadow-lg"
            >
              {t('majors.startTestNow')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
