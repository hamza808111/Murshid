import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  TrendingUp,
  Briefcase,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Download,
  Share2,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { AssessmentResult } from '@/services/geminiService';
import { useI18n } from '@/contexts/I18nContext';
import { ScrollAnimation } from './animations/ScrollAnimation';
import { Link } from 'react-router-dom';

interface AssessmentResultsProps {
  result: AssessmentResult;
  onRetake: () => void;
  onSave?: () => void;
}

export const AssessmentResults = ({ result, onRetake, onSave }: AssessmentResultsProps) => {
  const { language } = useI18n();

  const handleDownload = () => {
    const text = `
Assessment Results
==================

${result.personalityProfile}

${result.overallAnalysis}

Recommended Majors:
${result.recommendations
  .map(
    (rec, i) => `
${i + 1}. ${rec.majorName} (${rec.matchPercentage}% Match)
   ${rec.reasoning}
   
   Key Strengths:
   ${rec.keyStrengths.map((s) => `   - ${s}`).join('\n')}
   
   Career Paths:
   ${rec.careerPaths.map((c) => `   - ${c}`).join('\n')}
   
   Considerations: ${rec.potentialChallenges}
`
  )
  .join('\n')}
    `;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'murshid-assessment-results.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <div className="mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetake}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'ar' ? 'العودة للتقييم' : 'Back to assessment'}
        </Button>
      </div>

      {/* Header */}
      <ScrollAnimation>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white" dir={language}>
            {language === 'ar' ? 'نتائج التقييم الخاصة بك' : 'Your Assessment Results'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300" dir={language}>
            {language === 'ar'
              ? 'بناءً على إجاباتك، إليك توصياتنا المخصصة لك'
              : 'Based on your responses, here are your personalized recommendations'}
          </p>
        </div>
      </ScrollAnimation>

      {/* Personality Profile */}
      <ScrollAnimation delay={0.1}>
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" dir={language}>
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {language === 'ar' ? 'ملفك الشخصي' : 'Your Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed" dir={language}>
              {result.personalityProfile}
            </p>
          </CardContent>
        </Card>
      </ScrollAnimation>

      {/* Overall Analysis */}
      <ScrollAnimation delay={0.2}>
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" dir={language}>
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {language === 'ar' ? 'التحليل الشامل' : 'Overall Analysis'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed" dir={language}>
              {result.overallAnalysis}
            </p>
          </CardContent>
        </Card>
      </ScrollAnimation>

      {/* Recommended Majors */}
      <div className="space-y-6">
        <h2
          className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
          dir={language}
        >
          <GraduationCap className="w-6 h-6" />
          {language === 'ar' ? 'التخصصات الموصى بها' : 'Recommended Majors'}
        </h2>

        {result.recommendations.map((recommendation, index) => (
          <ScrollAnimation key={index} delay={0.3 + index * 0.1}>
            <Card className="hover:shadow-xl transition-shadow border-2">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="text-lg px-3 py-1">#{index + 1}</Badge>
                      <CardTitle className="text-xl" dir={language}>
                        {recommendation.majorName}
                      </CardTitle>
                    </div>
                    <CardDescription dir={language}>{recommendation.reasoning}</CardDescription>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {recommendation.matchPercentage}%
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'توافق' : 'Match'}
                    </p>
                  </div>
                </div>
                <Progress value={recommendation.matchPercentage} className="h-2 mt-3" />
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Strengths */}
                <div>
                  <h4
                    className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                    dir={language}
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {language === 'ar' ? 'نقاط القوة الرئيسية' : 'Key Strengths'}
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {recommendation.keyStrengths.map((strength, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                        dir={language}
                      >
                        <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Career Paths */}
                <div>
                  <h4
                    className="font-semibold text-gray-900 dark:text:white mb-2 flex items-center gap-2"
                    dir={language}
                  >
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    {language === 'ar' ? 'المسارات المهنية' : 'Career Paths'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.careerPaths.map((career, i) => (
                      <Badge key={i} variant="secondary" className="text-sm" dir={language}>
                        {career}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Challenges */}
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <h4
                    className="font-semibold text-orange-900 dark:text-orange-200 mb-2 flex items-center gap-2"
                    dir={language}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {language === 'ar' ? 'اعتبارات مهمة' : 'Important Considerations'}
                  </h4>
                  <p className="text-sm text-orange-800 dark:text-orange-300" dir={language}>
                    {recommendation.potentialChallenges}
                  </p>
                </div>

                {/* Universities offering this major */}
                {recommendation.universities && recommendation.universities.length > 0 && (
                  <div className="space-y-2">
                    <h4
                      className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2"
                      dir={language}
                    >
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {language === 'ar'
                        ? 'الجامعات التي تقدم هذا التخصص'
                        : 'Universities offering this major'}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {recommendation.universities.map((uni) => (
                        <Badge
                          key={uni.id}
                          variant="outline"
                          className="text-sm px-3 py-1"
                          dir={language}
                        >
                          <Link to={`/universities/${uni.id}`}>
                            {uni.name}
                            {uni.city ? ` • ${uni.city}` : ''}
                          </Link>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detail Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {recommendation.majorId && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm color:gray-700 dark:text-gray-300 dark:hover:text-gray-100 hover:text-blue-600 dark:hover:text-blue-800"
                    >
                      <Link to={`/majors/${recommendation.majorId}`}>
                        <GraduationCap className="w-4 h-4" />
                        {language === 'ar' ? ' تفاصيل التخصص والجامعات' : 'Major details And universities'}
                      </Link>
                    </Button>
                  )}

                 
                </div>
              </CardContent>
            </Card>
          </ScrollAnimation>
        ))}
      </div>

      {/* Action Buttons */}
      <ScrollAnimation delay={0.8}>
        <div className="flex flex-wrap gap-4 justify-center pt-6">
          <Button onClick={onRetake} variant="outline" size="lg" className="rounded-2xl px-8 py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-md">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'إعادة التقييم' : 'Retake Assessment'}
          </Button>

          {onSave && (
            <Button onClick={onSave} className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl px-8 py-6 shadow-lg transition-all hover:shadow-xl" size="lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'حفظ النتائج' : 'Save Results'}
            </Button>
          )}

          <Button onClick={handleDownload} variant="outline" size="lg" className="rounded-2xl px-8 py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-md">
            <Download className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'تحميل' : 'Download'}
          </Button>

          <Button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My Murshid Assessment Results',
                  text: 'Check out my major recommendations from Murshid!',
                });
              }
            }}
            variant="outline"
            size="lg"
            className="rounded-2xl px-8 py-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-md"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'مشاركة' : 'Share'}
          </Button>
        </div>
      </ScrollAnimation>
    </div>
  );
};
