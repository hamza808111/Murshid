import { Progress } from '@/components/ui/progress';
import { useI18n } from '@/contexts/I18nContext';
import type { LevelInfo } from '@/types/gamification';

interface LevelProgressProps {
  levelInfo: LevelInfo;
  className?: string;
}

export default function LevelProgress({ levelInfo, className }: LevelProgressProps) {
  const { language } = useI18n();
  const pointsNeeded = levelInfo.points_for_next_level - levelInfo.current_points;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {language === 'ar' ? `المستوى ${levelInfo.current_level}` : `Level ${levelInfo.current_level}`}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {levelInfo.current_points} / {levelInfo.points_for_next_level}
        </span>
      </div>
      <Progress value={levelInfo.progress_percentage} className="h-2" />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {language === 'ar' 
          ? `${pointsNeeded} نقطة للوصول إلى المستوى ${levelInfo.current_level + 1}`
          : `${pointsNeeded} points to reach level ${levelInfo.current_level + 1}`
        }
      </p>
    </div>
  );
}

