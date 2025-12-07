import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useI18n } from '@/contexts/I18nContext';
import type { Badge as BadgeType } from '@/types/gamification';
import { Award } from 'lucide-react';

interface BadgesDisplayProps {
  badges: BadgeType[];
  maxDisplay?: number;
  className?: string;
}

export default function BadgesDisplay({ badges, maxDisplay = 10, className }: BadgesDisplayProps) {
  const { language } = useI18n();
  const displayedBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  if (badges.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === 'ar' ? 'لا توجد شارات بعد' : 'No badges yet'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {language === 'ar' 
              ? 'ابدأ التفاعل مع المجتمع لفتح الشارات!'
              : 'Start interacting with the community to unlock badges!'
            }
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {language === 'ar' ? 'الشارات' : 'Badges'}
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {badges.length}
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <TooltipProvider>
          {displayedBadges.map((badge) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow cursor-help">
                  <span className="text-3xl mb-1">{badge.badge_icon || '🏆'}</span>
                  <p className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 line-clamp-2">
                    {badge.badge_name}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  <p className="font-semibold">{badge.badge_name}</p>
                  {badge.badge_description && (
                    <p className="text-xs text-gray-400">{badge.badge_description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(badge.unlocked_at).toLocaleDateString()}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
        {remainingCount > 0 && (
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="text-2xl mb-1">+{remainingCount}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {language === 'ar' ? 'المزيد' : 'More'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

