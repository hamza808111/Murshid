import { Card } from '@/components/ui/card';
import { FileText, MessageSquare, Heart, CheckCircle, Flame } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import type { UserStats } from '@/types/gamification';

interface StatsCardProps {
  stats: UserStats;
  className?: string;
}

export default function StatsCard({ stats, className }: StatsCardProps) {
  const { language } = useI18n();

  const statItems = [
    {
      icon: FileText,
      label: language === 'ar' ? 'المنشورات' : 'Posts',
      value: stats.total_posts,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: MessageSquare,
      label: language === 'ar' ? 'الإجابات' : 'Answers',
      value: stats.total_answers,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: Heart,
      label: language === 'ar' ? 'الإعجابات' : 'Likes Received',
      value: stats.total_likes_received,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      icon: CheckCircle,
      label: language === 'ar' ? 'إجابات مقبولة' : 'Accepted Answers',
      value: stats.accepted_answers_count,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: Flame,
      label: language === 'ar' ? 'السلسلة الحالية' : 'Current Streak',
      value: stats.current_streak,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {language === 'ar' ? 'الإحصائيات' : 'Statistics'}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="text-center">
              <div className={`inline-flex p-3 rounded-lg ${item.bgColor} mb-2`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {item.value}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
      {stats.longest_streak > stats.current_streak && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'أطول سلسلة: ' : 'Longest Streak: '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.longest_streak} {language === 'ar' ? 'يوم' : 'days'}
            </span>
          </p>
        </div>
      )}
    </Card>
  );
}

