import { useEffect, useState } from 'react';
import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
} from 'react-native-health';

const permissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.StepCount],
    write: [],
  },
} as HealthKitPermissions;

export function useHealthKit() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [steps, setSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        setError('Cannot access HealthKit: ' + error);
        return;
      }
      
      setIsAuthorized(true);
      fetchSteps();
    });
  }, []);

  const fetchSteps = () => {
    const options = {
      date: new Date().toISOString(), // Today
    };

    AppleHealthKit.getStepCount(
      options,
      (err: string, results: { value: number }) => {
        if (err) {
          setError('Failed to fetch steps: ' + err);
          return;
        }
        
        setSteps(results.value);
      },
    );
  };

  // Fetch steps periodically
  useEffect(() => {
    if (isAuthorized) {
      const interval = setInterval(fetchSteps, 60000); // every minute
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  return {
    isAuthorized,
    steps,
    error,
    refreshSteps: fetchSteps,
  };
}