import { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DailyStats, RewardBox } from '../types/rewards';
import type { Multiplier } from '../types/rewards';

interface RewardState {
  coins: number;
  todayStats: DailyStats;
}

interface RewardContextType extends RewardState {
  addSteps: (steps: number) => void;
  collectReward: (boxId: string) => void;
  applyMultiplier: (boxId: string, multiplier: Multiplier) => void;
}

const STEPS_PER_REWARD = 500;

const RewardContext = createContext<RewardContextType | null>(null);

type RewardAction = 
  | { type: 'UPDATE_STEPS'; payload: number }
  | { type: 'COLLECT_REWARD'; payload: string }
  | { type: 'APPLY_MULTIPLIER'; payload: { boxId: string; multiplier: Multiplier } }
  | { type: 'LOAD_SAVED_STATE'; payload: RewardState };

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function createRewardBoxes(steps: number): RewardBox[] {
  const numBoxes = Math.floor(steps / STEPS_PER_REWARD);
  return Array.from({ length: numBoxes }, (_, index) => ({
    id: `reward-${index}`,
    stepMilestone: (index + 1) * STEPS_PER_REWARD,
    collected: false
  }));
}

function rewardReducer(state: RewardState, action: RewardAction): RewardState {
  switch (action.type) {
    case 'UPDATE_STEPS': {
      const today = getToday();
      
      // Reset daily stats if it's a new day
      if (today !== state.todayStats.date) {
        state.todayStats = {
          date: today,
          steps: 0,
          rewardBoxes: []
        };
      }

      const newSteps = action.payload;
      const currentBoxes = state.todayStats.rewardBoxes;
      const newBoxes = createRewardBoxes(newSteps);
      
      // Preserve collection status for existing boxes
      const updatedBoxes = newBoxes.map(newBox => {
        const existingBox = currentBoxes.find(box => box.id === newBox.id);
        return existingBox || newBox;
      });

      const newState = {
        ...state,
        todayStats: {
          date: today,
          steps: newSteps,
          rewardBoxes: updatedBoxes
        }
      };

      AsyncStorage.setItem('rewardState', JSON.stringify(newState));
      return newState;
    }

    case 'APPLY_MULTIPLIER': {
      const { boxId, multiplier } = action.payload;
      const box = state.todayStats.rewardBoxes.find(b => b.id === boxId);
      if (!box || !box.collected) return state;

      const newState = {
        coins: state.coins + Math.floor(multiplier - 1), // Add the multiplier bonus
        todayStats: {
          ...state.todayStats,
          rewardBoxes: state.todayStats.rewardBoxes.map(b => 
            b.id === boxId ? { ...b, multiplier } : b
          ),
        }
      }
    }

    case 'COLLECT_REWARD': {
      const today = getToday();
      if (state.todayStats.date !== today) {
        return state;
      }

      const updatedBoxes = state.todayStats.rewardBoxes.map(box => 
        box.id === action.payload ? 
          { ...box, collected: true } : 
          box
      );

      const newState = {
        coins: state.coins + 1,
        todayStats: {
          ...state.todayStats,
          rewardBoxes: updatedBoxes
        }
      };

      AsyncStorage.setItem('rewardState', JSON.stringify(newState));
      return newState;
    }

    case 'LOAD_SAVED_STATE':
      return action.payload;

    default:
      return state;
  }
}



export function RewardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rewardReducer, {
    coins: 0,
    todayStats: {
      date: getToday(),
      steps: 0,
      rewardBoxes: []
    }
  });

  useEffect(() => {
    async function loadSavedState() {
      try {
        const savedState = await AsyncStorage.getItem('rewardState');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          dispatch({ type: 'LOAD_SAVED_STATE', payload: parsedState });
        }
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
    loadSavedState();
  }, []);

  const addSteps = (steps: number) => {
    dispatch({ type: 'UPDATE_STEPS', payload: steps });
  };

  const collectReward = (boxId: string) => {
    dispatch({ type: 'COLLECT_REWARD', payload: boxId });
  };

  const applyMultiplier = (boxId: string, multiplier: Multiplier) => {
    dispatch({ type: 'APPLY_MULTIPLIER', payload: { boxId, multiplier } });
  };
  
  // Add applyMultiplier to context value
  return (
    <RewardContext.Provider 
      value={{ ...state, addSteps, collectReward, applyMultiplier }}
    >
      {children}
    </RewardContext.Provider>
  );

}

export function useReward() {
  const context = useContext(RewardContext);
  if (!context) {
    throw new Error('useReward must be used within a RewardProvider');
  }
  return context;
}