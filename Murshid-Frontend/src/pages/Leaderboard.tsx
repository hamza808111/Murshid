import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageAnimation } from "@/components/animations/PageAnimation";
import { ScrollAnimation } from "@/components/animations/ScrollAnimation";
import { ArrowLeft, Trophy, Medal, Award, Crown, Zap } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { getLeaderboard } from '@/lib/gamificationApi';
import type { LeaderboardEntry } from '@/types/gamification';
import { toast } from 'sonner';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard(100);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error(language === 'ar' ? 'فشل تحميل لوحة المتصدرين' : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <Trophy className="w-5 h-5 text-gray-400" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700';
    if (rank === 2) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    if (rank === 3) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700';
  };

  if (loading) {
    return (
      <PageAnimation>
        <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
          <Navbar />
          <div className="py-20 flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </div>
      </PageAnimation>
    );
  }

  return (
    <PageAnimation>
      <div className="min-h-screen bg-gradient-to-br from-[#e3e8ff] via-[#f5f7ff] to-[#cbd4ff] dark:from-[#0f172a] dark:via-[#1e2a4a] dark:to-[#2a3b6b]">
        <Navbar />
        
        <div className="py-12 sm:py-20">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-10">
            <ScrollAnimation>
              <div className="mb-6 sm:mb-8">
                <Button
                  onClick={() => navigate('/community')}
                  variant="ghost"
                  className="mb-3 sm:mb-4 rounded-2xl text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'العودة إلى المجتمع' : 'Back to Community'}
                </Button>
                
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 break-words" dir={language}>
                    {language === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard'}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400" dir={language}>
                  {language === 'ar' 
                    ? 'أفضل المساهمين في المجتمع بناءً على النقاط'
                    : 'Top contributors in the community based on points'
                  }
                </p>
              </div>
            </ScrollAnimation>

            {leaderboard.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2" dir={language}>
                  {language === 'ar' ? 'لا توجد بيانات' : 'No Data'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400" dir={language}>
                  {language === 'ar' 
                    ? 'ابدأ التفاعل مع المجتمع لظهورك في لوحة المتصدرين!'
                    : 'Start interacting with the community to appear on the leaderboard!'
                  }
                </p>
              </Card>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = user && entry.user_id === user.id;
                  return (
                    <ScrollAnimation key={entry.user_id}>
                      <Card 
                        className={`p-3 sm:p-6 transition-all hover:shadow-lg cursor-pointer ${
                          isCurrentUser 
                            ? 'border-2 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' 
                            : ''
                        } ${
                          entry.rank <= 3 
                            ? 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10' 
                            : ''
                        }`}
                        onClick={() => navigate(`/user/${entry.user_id}`)}
                      >
                        <div className="flex items-center gap-2 sm:gap-4">
                          {/* Rank */}
                          <div className="flex-shrink-0 w-8 sm:w-12 flex items-center justify-center">
                            {getRankIcon(entry.rank)}
                          </div>

                          {/* Avatar */}
                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <AvatarImage src={entry.user_avatar} alt={entry.user_name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs sm:text-base">
                              {entry.user_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {entry.user_name}
                              </h3>
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {language === 'ar' ? 'أنت' : 'You'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                                <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="truncate">{entry.points.toLocaleString()} {language === 'ar' ? 'ن' : 'pt'}</span>
                              </div>
                              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="truncate">{language === 'ar' ? `L${entry.level}` : `L${entry.level}`}</span>
                              </div>
                              {entry.badges_count > 0 && (
                                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                                  <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="truncate">{entry.badges_count}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Rank Badge */}
                          <Badge className={`${getRankBadgeColor(entry.rank)} text-xs sm:text-sm flex-shrink-0`}>
                            #{entry.rank}
                          </Badge>
                        </div>
                      </Card>
                    </ScrollAnimation>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}

