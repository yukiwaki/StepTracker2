import { createContext, useContext, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RewardState {
  coins: number;
  stepsToNextReward: number;
}

interface RewardContextType extends RewardState {
  addCoins: (amount: number) => void;
  updateSteps: (steps: number) => void;
}

const RewardContext = createContext<RewardContextType | null>(null);

type RewardAction =
  | { type: 'ADD_COINS'; payload: number }
  | { type: 'UPDATE_STEPS'; payload: number };

function rewardReducer(state: RewardState, action: RewardAction): RewardState {
  switch (action.type) {
    case 'ADD_COINS':
      const newCoins = state.coins + action.payload;
      AsyncStorage.setItem('coins', String(newCoins));
      return { ...state, coins: newCoins };
    case 'UPDATE_STEPS':
      return { ...state, stepsToNextReward: action.payload };
    default:
      return state;
  }
}

export function RewardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rewardReducer, {
    coins: 0,
    stepsToNextReward: 100,
  });

  const addCoins = (amount: number) => dispatch({ type: 'ADD_COINS', payload: amount });
  const updateSteps = (steps: number) => dispatch({ type: 'UPDATE_STEPS', payload: steps });

  return (
    <RewardContext.Provider value={{ ...state, addCoins, updateSteps }}>
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