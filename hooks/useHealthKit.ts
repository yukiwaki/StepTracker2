import { useEffect, useState } from 'react';
import AppleHealthKit from 'react-native-health';
import { useReward } from '../contexts/reward-context';

const permissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.StepCount],
    write: [],
  },
};

export function useHealthKit() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addSteps, todayStats } = useReward();

  useEffect(() => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        setError('Cannot access HealthKit: ' + error);
        return;
      }
      
      setIsAuthorized(true);
    });
  }, []);

  const fetchSteps = () => {
    if (!isAuthorized) return;

    const options = {
      date: new Date().toISOString(), // Today
      includeManuallyAdded: true, // Include steps added manually in Health app
    };

    AppleHealthKit.getStepCount(
      options,
      (err: string, results: { value: number }) => {
        if (err) {
          setError('Failed to fetch steps: ' + err);
          return;
        }
        
        console.log('New steps count:', results.value); // Debug log
        addSteps(results.value);
      },
    );
  };

  // Initial fetch when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchSteps();
    }
  }, [isAuthorized]);

  // Set up periodic updates
  useEffect(() => {
    if (isAuthorized) {
      // Fetch immediately
      fetchSteps();
      
      // Then fetch every 30 seconds (you can adjust this interval)
      const interval = setInterval(fetchSteps, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  return {
    isAuthorized,
    steps: todayStats.steps,
    error,
    refreshSteps: fetchSteps,
  };
}