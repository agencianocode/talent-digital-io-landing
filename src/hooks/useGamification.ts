import { useState, useEffect, useCallback } from 'react';
import { useAnnouncement } from '@/components/AccessibilityWrapper';

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GamificationState {
  level: number;
  totalXP: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  streak: number;
  lastActivityDate?: Date;
}

interface UseGamificationReturn {
  state: GamificationState;
  awardXP: (amount: number, reason: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: () => void;
  getProgressPercentage: () => number;
  isLevelUp: boolean;
  recentAchievements: Achievement[];
}

const XP_PER_LEVEL = 100;
const LEVEL_MULTIPLIER = 1.5;

export const useGamification = (userId?: string): UseGamificationReturn => {
  const { announceToScreenReader } = useAnnouncement();
  const [state, setState] = useState<GamificationState>({
    level: 1,
    totalXP: 0,
    currentLevelXP: 0,
    xpToNextLevel: XP_PER_LEVEL,
    achievements: [],
    streak: 0
  });
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  // Calculate level from total XP
  const calculateLevel = useCallback((totalXP: number) => {
    let level = 1;
    let xpRequired = XP_PER_LEVEL;
    let accumulatedXP = 0;

    while (totalXP >= accumulatedXP + xpRequired) {
      accumulatedXP += xpRequired;
      level++;
      xpRequired = Math.floor(XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));
    }

    const currentLevelXP = totalXP - accumulatedXP;
    const xpToNextLevel = xpRequired - currentLevelXP;

    return { level, currentLevelXP, xpToNextLevel };
  }, []);

  // Award XP and handle level ups
  const awardXP = useCallback((amount: number, reason: string) => {
    setState(prevState => {
      const newTotalXP = prevState.totalXP + amount;
      const levelInfo = calculateLevel(newTotalXP);
      
      // Check for level up
      const didLevelUp = levelInfo.level > prevState.level;
      
      if (didLevelUp) {
        setIsLevelUp(true);
        announceToScreenReader(
          `¡Felicitaciones! Subiste al nivel ${levelInfo.level}. Ganaste ${amount} XP por ${reason}.`,
          'assertive'
        );
        
        // Auto-clear level up state after animation
        setTimeout(() => setIsLevelUp(false), 3000);
      } else {
        announceToScreenReader(`Ganaste ${amount} XP por ${reason}.`);
      }

      return {
        ...prevState,
        totalXP: newTotalXP,
        ...levelInfo
      };
    });
  }, [calculateLevel, announceToScreenReader]);

  // Unlock achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    setState(prevState => {
      const achievement = prevState.achievements.find(a => a.id === achievementId);
      if (!achievement || achievement.earned) return prevState;

      const updatedAchievement = {
        ...achievement,
        earned: true,
        earnedAt: new Date()
      };

      const updatedAchievements = prevState.achievements.map(a =>
        a.id === achievementId ? updatedAchievement : a
      );

      // Add to recent achievements
      setRecentAchievements(prev => [updatedAchievement, ...prev.slice(0, 4)]);

      // Award XP for achievement
      const newTotalXP = prevState.totalXP + achievement.points;
      const levelInfo = calculateLevel(newTotalXP);

      announceToScreenReader(
        `¡Logro desbloqueado! ${achievement.title}: ${achievement.description}. Ganaste ${achievement.points} XP.`,
        'assertive'
      );

      return {
        ...prevState,
        totalXP: newTotalXP,
        ...levelInfo,
        achievements: updatedAchievements
      };
    });
  }, [calculateLevel, announceToScreenReader]);

  // Update activity streak
  const updateStreak = useCallback(() => {
    setState(prevState => {
      const today = new Date();
      const lastActivity = prevState.lastActivityDate;
      
      if (!lastActivity) {
        return {
          ...prevState,
          streak: 1,
          lastActivityDate: today
        };
      }

      const daysSinceLastActivity = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStreak = prevState.streak;
      
      if (daysSinceLastActivity === 1) {
        // Consecutive day
        newStreak += 1;
        announceToScreenReader(`¡Racha extendida! ${newStreak} días consecutivos.`);
      } else if (daysSinceLastActivity > 1) {
        // Streak broken
        newStreak = 1;
        if (prevState.streak > 1) {
          announceToScreenReader('Tu racha se reinició. ¡Comienza una nueva!');
        }
      }
      // Same day = no change to streak

      return {
        ...prevState,
        streak: newStreak,
        lastActivityDate: today
      };
    });
  }, [announceToScreenReader]);

  // Get progress percentage for current level
  const getProgressPercentage = useCallback(() => {
    const totalXPForLevel = state.currentLevelXP + state.xpToNextLevel;
    return totalXPForLevel > 0 ? (state.currentLevelXP / totalXPForLevel) * 100 : 0;
  }, [state.currentLevelXP, state.xpToNextLevel]);

  // Initialize achievements
  useEffect(() => {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first-login',
        title: 'Bienvenido',
        description: 'Inicia sesión por primera vez',
        points: 50,
        icon: 'user-check',
        earned: false,
        rarity: 'common'
      },
      {
        id: 'profile-complete',
        title: 'Perfil Completo',
        description: 'Completa toda la información de tu perfil',
        points: 200,
        icon: 'user',
        earned: false,
        rarity: 'rare'
      },
      {
        id: 'first-application',
        title: 'Primera Postulación',
        description: 'Postúlate a tu primera oportunidad',
        points: 100,
        icon: 'send',
        earned: false,
        rarity: 'common'
      },
      {
        id: 'weekly-streak',
        title: 'Constancia Semanal',
        description: 'Mantén una racha de 7 días',
        points: 300,
        icon: 'flame',
        earned: false,
        progress: 0,
        maxProgress: 7,
        rarity: 'epic'
      },
      {
        id: 'network-builder',
        title: 'Constructor de Red',
        description: 'Conecta con 10 profesionales',
        points: 500,
        icon: 'users',
        earned: false,
        progress: 0,
        maxProgress: 10,
        rarity: 'legendary'
      }
    ];

    setState(prevState => ({
      ...prevState,
      achievements: defaultAchievements
    }));
  }, []);

  // Clear recent achievements after some time
  useEffect(() => {
    if (recentAchievements.length > 0) {
      const timer = setTimeout(() => {
        setRecentAchievements([]);
      }, 10000); // Clear after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [recentAchievements.length]);

  return {
    state,
    awardXP,
    unlockAchievement,
    updateStreak,
    getProgressPercentage,
    isLevelUp,
    recentAchievements
  };
};

export default useGamification;