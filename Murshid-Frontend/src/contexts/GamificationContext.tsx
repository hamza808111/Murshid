import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
  getUserStats,
  getUserBadges,
  getUserPointsHistory,
  calculateLevelInfo,
} from '@/lib/gamificationApi';
import type { UserStats, Badge, PointsHistory, LevelInfo } from '@/types/gamification';

interface GamificationContextType {
  stats: UserStats | null;
  badges: Badge[];
  pointsHistory: PointsHistory[];
  levelInfo: LevelInfo | null;
  loading: boolean;
  refreshStats: () => Promise<void>;
  refreshBadges: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};

interface GamificationProviderProps {
  children: ReactNode;
}

export const GamificationProvider = ({ children }: GamificationProviderProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshStats = useCallback(async () => {
    if (!user) {
      setStats(null);
      setLevelInfo(null);
      return;
    }

    try {
      setLoading(true);
      const userStats = await getUserStats(user.id);
      setStats(userStats);
      setLevelInfo(calculateLevelInfo(userStats.points));
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshBadges = useCallback(async () => {
    if (!user) {
      setBadges([]);
      return;
    }

    try {
      const userBadges = await getUserBadges(user.id);
      setBadges(userBadges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  }, [user]);

  const refreshPointsHistory = useCallback(async () => {
    if (!user) {
      setPointsHistory([]);
      return;
    }

    try {
      const history = await getUserPointsHistory(user.id, 20);
      setPointsHistory(history);
    } catch (error) {
      console.error('Error fetching points history:', error);
    }
  }, [user]);

  // Load data on mount and when user changes
  useEffect(() => {
    refreshStats();
    refreshBadges();
    refreshPointsHistory();
  }, [refreshStats, refreshBadges, refreshPointsHistory]);

  return (
    <GamificationContext.Provider
      value={{
        stats,
        badges,
        pointsHistory,
        levelInfo,
        loading,
        refreshStats,
        refreshBadges,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

