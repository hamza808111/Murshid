import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  ArrowUpRight, 
  RefreshCw,
  ChevronRight,
  Sparkles,
  Trophy,
  Calendar
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { getRankedMajors, RankedMajor, RankedMajorsResponse } from '@/services/rankedMajorsService';
import { ScrollAnimation } from './animations/ScrollAnimation';

export const RankedMajorsList = () => {
  const { language } = useI18n();
  const [rankedData, setRankedData] = useState<RankedMajorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRankedMajors();
  }, [language]);

  const fetchRankedMajors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRankedMajors(language as 'en' | 'ar');
      setRankedData(data);
    } catch (err) {
      setError(language === 'ar' 
        ? 'فشل تحميل البيانات. يرجى المحاولة مرة أخرى.'
        : 'Failed to load data. Please try again.');
      console.error('Error fetching ranked majors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRankedMajors();
    setRefreshing(false);
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white';
    if (rank <= 5) return 'bg-gradient-to-br from-blue-400 to-blue-500 text-white';
    if (rank <= 10) return 'bg-gradient-to-br from-green-400 to-green-500 text-white';
    return 'bg-gradient-to-br from-purple-400 to-purple-500 text-white';
  };

  const getDemandBadgeColor = (score: number): string => {
    if (score >= 90) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    if (score >= 80) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    if (score >= 70) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center rounded-3xl border-2 border-red-200 dark:border-red-800">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white" dir={language}>
            {error}
          </h3>
          <Button onClick={fetchRankedMajors} className="rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        </div>
      </Card>
    );
  }

  if (!rankedData) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollAnimation>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white" dir={language}>
                {language === 'ar' ? 'تصنيف التخصصات العالمي' : 'Global Majors Ranking'}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2" dir={language}>
              <Calendar className="w-4 h-4" />
              {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {rankedData.lastUpdated}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="rounded-xl gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
        </div>
      </ScrollAnimation>

      {/* Market Trends */}
      <ScrollAnimation delay={0.1}>
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2" dir={language}>
                  {language === 'ar' ? 'اتجاهات السوق 2025' : '2025 Market Trends'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed" dir={language}>
                  {rankedData.marketTrends}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollAnimation>

      {/* Ranked Majors List */}
      <div className="space-y-4">
        {rankedData.topMajors.map((major, index) => (
          <ScrollAnimation key={major.rank} delay={0.05 * (index + 1)}>
            <Card className="rounded-2xl border-2 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-xl group">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Rank Badge */}
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl ${getRankColor(major.rank)} flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0`}>
                      {major.rank === 1 && <Trophy className="w-8 h-8" />}
                      {major.rank !== 1 && `#${major.rank}`}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    {/* Title and Demand Score */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white" dir={language}>
                          {language === 'ar' ? major.nameAr : major.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400" dir={language}>
                          {major.jobOutlook}
                        </p>
                      </div>
                      <Badge className={`${getDemandBadgeColor(major.demandScore)} text-sm font-semibold px-3 py-1 whitespace-nowrap`}>
                        {language === 'ar' ? 'الطلب:' : 'Demand:'} {major.demandScore}/100
                      </Badge>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400" dir={language}>
                            {language === 'ar' ? 'نطاق الراتب' : 'Salary Range'}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {major.salaryRange}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400" dir={language}>
                            {language === 'ar' ? 'معدل النمو' : 'Growth Rate'}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {major.growthRate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400" dir={language}>
                            {language === 'ar' ? 'الصناعات الرئيسية' : 'Top Industries'}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white text-xs">
                            {major.topIndustries.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-200 dark:border-gray-700 pt-3" dir={language}>
                      {major.reasoning}
                    </p>

                    {/* Key Skills */}
                    <div className="flex flex-wrap gap-2">
                      {major.keySkills.slice(0, 4).map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs bg-gray-50 dark:bg-gray-800"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="hidden lg:flex items-center">
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollAnimation>
        ))}
      </div>

      {/* Footer Note */}
      <ScrollAnimation>
        <Card className="rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-0">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400" dir={language}>
              {language === 'ar'
                ? '💡 هذه التصنيفات مبنية على بيانات السوق العالمية الحالية واتجاهات الصناعة. قد تختلف الفرص حسب المنطقة والمهارات الفردية.'
                : '💡 These rankings are based on current global market data and industry trends. Opportunities may vary by region and individual skills.'}
            </p>
          </CardContent>
        </Card>
      </ScrollAnimation>
    </div>
  );
};
