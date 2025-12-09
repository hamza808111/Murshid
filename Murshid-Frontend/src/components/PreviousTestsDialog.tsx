import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  TrendingUp, 
  X,
  Calendar,
  Eye,
  Loader2
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/lib/supabase';
import { AssessmentResult } from '@/services/geminiService';

interface PreviousTest {
  id: string;
  taken_at: string;
  results: AssessmentResult;
}

interface PreviousTestsDialogProps {
  userId: string;
  onClose: () => void;
  onViewResult: (result: AssessmentResult) => void;
}

export const PreviousTestsDialog = ({ userId, onClose, onViewResult }: PreviousTestsDialogProps) => {
  const { language } = useI18n();
  const [previousTests, setPreviousTests] = useState<PreviousTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreviousTests();
  }, [userId]);

  const fetchPreviousTests = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', userId)
        .order('taken_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setPreviousTests(data || []);
    } catch (error) {
      console.error('Failed to fetch previous tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return language === 'ar' ? 'اليوم' : 'Today';
    } else if (diffInHours < 48) {
      return language === 'ar' ? 'أمس' : 'Yesterday';
    } else {
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4">
      <Card className="w-full max-w-2xl sm:max-w-3xl max-h-[90vh] sm:max-h-[80vh] shadow-2xl border-2 overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 flex-shrink-0">
          <div className="space-y-1 flex-1 min-w-0" dir={language}>
            <CardTitle className="text-lg sm:text-2xl break-words">
              {language === 'ar' ? 'الاختبارات السابقة' : 'Previous Tests'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {language === 'ar' 
                ? `لديك ${previousTests.length} من أصل 3 اختبارات متاحة`
                : `You have ${previousTests.length} out of 3 tests available`}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl flex-shrink-0 ml-2">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : previousTests.length === 0 ? (
            <div className="text-center py-8 sm:py-12 space-y-4">
              <Clock className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400" dir={language}>
                {language === 'ar' 
                  ? 'لم تجري أي اختبارات بعد' 
                  : 'You haven\'t taken any tests yet'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] sm:h-[500px] pr-3 sm:pr-4">
              <div className="space-y-3 sm:space-y-4" dir={language}>
                {previousTests.map((test, index) => (
                  <Card 
                    key={test.id} 
                    className="border-2 hover:border-blue-400 transition-colors dark:hover:border-blue-600"
                  >
                    <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs sm:text-sm">
                              {language === 'ar' ? `اختبار ${index + 1}` : `Test ${index + 1}`}
                            </Badge>
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 h-3 sm:h-4 sm:w-4" />
                              {formatDate(test.taken_at)}
                            </span>
                          </div>
                          
                          {test.results.recommendations && test.results.recommendations.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                {language === 'ar' ? 'أفضل توصية:' : 'Top Recommendation:'}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                                <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white break-words">
                                  {test.results.recommendations[0].majorName}
                                </span>
                                <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 flex-shrink-0">
                                  {test.results.recommendations[0].matchPercentage}%
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => {
                            onViewResult(test.results);
                            onClose();
                          }}
                          size="sm"
                          className="shrink-0 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {language === 'ar' ? 'عرض' : 'View'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
