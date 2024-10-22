export interface RewardBox {
  id: string;
  stepMilestone: number;
  collected: boolean;
  multiplier?: number;
}

export type Multiplier = 1.5 | 2 | 3;
  
  export interface DailyStats {
    date: string;
    steps: number;
    rewardBoxes: RewardBox[];
  }
  