export interface RewardBox {
    id: string;
    stepMilestone: number;
    collected: boolean;
    multiplier?: number;
  }
  
  export interface DailyStats {
    date: string;
    steps: number;
    rewardBoxes: RewardBox[];
  }
  