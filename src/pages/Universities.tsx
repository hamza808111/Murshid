import Navbar from "@/components/Navbar";
import { useState } from 'react';
import { Search, Building, MapPin, Star, BookOpen, GraduationCap, Users, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { useNavigate } from 'react-router-dom';

export default function UniversitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t, language } = useI18n();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: t('universityCategories.all'), icon: BookOpen },
    { id: 'public', label: t('universityCategories.public'), icon: Building },
    { id: 'private', label: t('universityCategories.private'), icon: GraduationCap },
    { id: 'research', label: t('universityCategories.research'), icon: Award },
    { id: 'technical', label: t('universityCategories.technical'), icon: Users },
  ];

  const universities = [
    {
      id: 1,
      title: language === 'ar' ? 'جامعة الملك سعود' : 'King Saud University',
      category: 'public',
      icon: Building,
      description: language === 'ar' 
        ? 'أكبر وأعرق الجامعات في المملكة العربية السعودية'
        : 'The largest and oldest university in the Kingdom of Saudi Arabia',
      location: language === 'ar' ? 'الرياض' : 'Riyadh',
      rating: 4.8,
      students: language === 'ar' ? '85,000+ طالب' : '85,000+ Students',
      established: '1957',
      color: 'from-blue-400 to-blue-500',
    },
    {
      id: 2,
      title: language === 'ar' ? 'جامعة الملك عبدالعزيز' : 'King Abdulaziz University',
      category: 'public',
      icon: Building,
      description: language === 'ar' 
        ? 'جامعة رائدة في البحث العلمي والابتكار'
        : 'Leading university in scientific research and innovation',
      location: language === 'ar' ? 'جدة' : 'Jeddah',
      rating: 4.7,
      students: language === 'ar' ? '180,000+ طالب' : '180,000+ Students',
      established: '1967',
      color: 'from-green-400 to-green-500',
    },
    {
      id: 3,
      title: language === 'ar' ? 'جامعة البترول والمعادن' : 'KFUPM',
      category: 'research',
      icon: Award,
      description: language === 'ar' 
        ? 'أفضل جامعة في الهندسة والتقنية'
        : 'Top university for engineering and technology',
      location: language === 'ar' ? 'الظهران' : 'Dhahran',
      rating: 4.9,
      students: language === 'ar' ? '10,000+ طالب' : '10,000+ Students',
      established: '1963',
      color: 'from-purple-400 to-purple-500',
    },
    {
      id: 4,
      title: language === 'ar' ? 'جامعة الأمير محمد بن فهد' : 'PMU',
      category: 'private',
      icon: GraduationCap,
      description: language === 'ar' 
        ? 'جامعة أهلية معتمدة في المنطقة الشرقية'
        : 'Accredited private university in the Eastern Region',
      location: language === 'ar' ? 'الخبر' : 'Khobar',
      rating: 4.6,
      students: language === 'ar' ? '12,000+ طالب' : '12,000+ Students',
      established: '2006',
      color: 'from-red-400 to-red-500',
    },
    {
      id: 5,
      title: language === 'ar' ? 'الجامعة الإسلامية' : 'Islamic University',
      category: 'public',
      icon: BookOpen,
      description: language === 'ar' 
        ? 'جامعة متخصصة في العلوم الإسلامية والعربية'
        : 'University specializing in Islamic and Arabic studies',
      location: language === 'ar' ? 'المدينة المنورة' : 'Medina',
      rating: 4.5,
      students: language === 'ar' ? '45,000+ طالب' : '45,000+ Students',
      established: '1961',
      color: 'from-indigo-400 to-indigo-500',
    },
    {
      id: 6,
      title: language === 'ar' ? 'جامعة الملك خالد' : 'King Khalid University',
      category: 'public',
      icon: Building,
      description: language === 'ar' 
        ? 'جامعة شاملة في منطقة عسير'
        : 'Comprehensive university in the Asir region',
      location: language === 'ar' ? 'أبها' : 'Abha',
      rating: 4.4,
      students: language === 'ar' ? '65,000+ طالب' : '65,000+ Students',
      established: '1998',
      color: 'from-cyan-400 to-cyan-500',
    },
    {
      id: 7,
      title: language === 'ar' ? 'جامعة أم القرى' : 'Umm Al-Qura University',
      category: 'public',
      icon: Building,
      description: language === 'ar' 
        ? 'جامعة عريقة في مكة المكرمة'
        : 'Historic university in Makkah',
      location: language === 'ar' ? 'مكة المكرمة' : 'Makkah',
      rating: 4.5,
      students: language === 'ar' ? '55,000+ طالب' : '55,000+ Students',
      established: '1981',
      color: 'from-orange-400 to-orange-500',
    },
    {
      id: 8,
      title: language === 'ar' ? 'الكلية التقنية بالرياض' : 'RCT - Riyadh',
      category: 'technical',
      icon: Users,
      description: language === 'ar' 
        ? 'أكبر الكليات التقنية في المملكة'
        : 'Largest technical college in the Kingdom',
      location: language === 'ar' ? 'الرياض' : 'Riyadh',
      rating: 4.3,
      students: language === 'ar' ? '25,000+ طالب' : '25,000+ Students',
      established: '1987',
      color: 'from-teal-400 to-teal-500',
    },
    {
      id: 9,
      title: language === 'ar' ? 'الجامعة السعودية الإلكترونية' : 'SEU',
      category: 'public',
      icon: BookOpen,
      description: language === 'ar' 
        ? 'رائدة التعليم الإلكتروني في المملكة'
        : 'Leader in e-learning in the Kingdom',
      location: language === 'ar' ? 'الرياض' : 'Riyadh',
      rating: 4.2,
      students: language === 'ar' ? '35,000+ طالب' : '35,000+ Students',
      established: '2011',
      color: 'from-pink-400 to-pink-500',
    },
  ];

  const filteredUniversities = universities.filter((university) => {
    const matchesCategory = selectedCategory === 'all' || university.category === selectedCategory;
    const matchesSearch = university.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         university.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         university.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              {t('universities.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" dir={language}>
              {t('universities.subtitle')}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <Input
                type="text"
                placeholder={t('universities.searchPlaceholder')}
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
              {t('universities.resultsCount', { count: filteredUniversities.length })}
            </p>
          </div>

          {/* Universities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.map((university) => (
              <Card
                key={university.id}
                className="p-6 rounded-3xl shadow-md hover:shadow-xl transition-all border-0 bg-white dark:bg-gray-800 cursor-pointer group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${university.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <university.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-gray-900 dark:text-gray-100 mb-2" dir={language}>
                  {university.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4" dir={language}>
                  {university.description}
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{university.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{university.rating}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">({t('universities.rating')})</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{university.students}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
                    {university.established}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  className="w-full rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                  dir={language}
                >
                  {t('universities.learnMore')} {language === 'ar' ? '←' : '→'}
                </Button>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredUniversities.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-gray-900 dark:text-gray-100 mb-2" dir={language}>
                {t('universities.noResults')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300" dir={language}>
                {t('universities.noResultsDesc')}
              </p>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-20 bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-600 dark:to-purple-600 rounded-3xl p-12 text-center shadow-xl">
            <h2 className="text-white mb-4" dir={language}>
              {t('universities.stillConfused')}
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto" dir={language}>
              {t('universities.stillConfusedDesc')}
            </p>
            <Button 
              onClick={handleStartTest}
              className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-2xl px-8 py-6 shadow-lg"
            >
              {t('universities.startTestNow')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
