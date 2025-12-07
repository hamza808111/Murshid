import { Trophy, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/contexts/I18nContext';

interface PointsDisplayProps {
  points: number;
  level: number;
  className?: string;
}

export default function PointsDisplay({ points, level, className }: PointsDisplayProps) {
  const { language } = useI18n();

  return (
    <Card className={`p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'ar' ? 'النقاط' : 'Points'}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {points.toLocaleString()}
            </p>
          </div>
        </div>
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700">
          <Zap className="w-3 h-3 mr-1" />
          {language === 'ar' ? `المستوى ${level}` : `Level ${level}`}
        </Badge>
      </div>
    </Card>
  );
}

