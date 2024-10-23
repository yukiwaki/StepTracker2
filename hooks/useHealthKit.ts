import { useEffect, useState, useCallback } from 'react';
import AppleHealthKit, { 
  HealthValue, 
  HealthKitPermissions,
  HealthObserver
} from 'react-native-health';
import { useReward } from '../contexts/reward-context';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.StepCount],
    write: [],
  },
};

export function useHealthKit() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addSteps, todayStats } = useReward();

  // Initialize HealthKit
  useEffect(() => {
    console.log('Initializing HealthKit...');
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log('HealthKit initialization error:', error);
        setError('Cannot access HealthKit: ' + error);
        return;
      }
      
      console.log('HealthKit initialized successfully');
      setIsAuthorized(true);
    });
  }, []);

  const fetchSteps = useCallback(() => {
    if (!isAuthorized) {
      console.log('Not authorized to fetch steps');
      return;
    }

    // Get start of today
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    // Get current time
    const endDate = new Date();

    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      includeManuallyAdded: true,
    };

    console.log('Fetching steps with options:', options);

    // First try getting daily samples
    AppleHealthKit.getDailyStepCountSamples(
      options,
      (err: string, results: Array<HealthValue>) => {
        if (err) {
          console.log('Error fetching daily steps:', err);
          
          // Fallback to getStepCount
          const todayOptions = {
            date: new Date().toISOString(),
            includeManuallyAdded: true,
          };
          
          AppleHealthKit.getStepCount(
            todayOptions,
            (fallbackErr: string, fallbackResults: { value: number }) => {
              if (fallbackErr) {
                console.log('Fallback step count failed:', fallbackErr);
                setError('Failed to fetch steps: ' + fallbackErr);
                return;
              }
              
              console.log('Fallback step count:', fallbackResults.value);
              addSteps(fallbackResults.value);
            }
          );
          return;
        }
        
        // Calculate total steps from samples
        const todaySteps = results.reduce((sum, sample) => {
          return sum + (sample.value || 0);
        }, 0);
        
        console.log('Daily step samples:', results);
        console.log('Calculated total steps:', todaySteps);
        
        addSteps(todaySteps);
      }
    );
  }, [isAuthorized, addSteps]);

  // Initial fetch when authorized
  useEffect(() => {
    if (isAuthorized) {
      console.log('Initial step fetch triggered');
      fetchSteps();
    }
  }, [isAuthorized, fetchSteps]);

  // Set up background updates
  useEffect(() => {
    if (!isAuthorized) return;

    console.log('Setting up step count background updates');
    
    // Set up periodic updates
    const interval = setInterval(fetchSteps, 30000);

    // Instead of observer, we'll use more frequent polling for testing
    const quickUpdateInterval = setInterval(fetchSteps, 5000); // Check every 5 seconds

    return () => {
      clearInterval(interval);
      clearInterval(quickUpdateInterval);
    };
  }, [isAuthorized, fetchSteps]);

  return {
    isAuthorized,
    steps: todayStats.steps,
    error,
    refreshSteps: fetchSteps,
  };
}