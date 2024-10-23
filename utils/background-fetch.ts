// utils/background-fetch.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { scheduleStepMilestoneNotification } from './notifications';
import AppleHealthKit from 'react-native-health';
import { BackgroundFetchResult } from 'expo-background-fetch';

const BACKGROUND_FETCH_TASK = 'background-fetch';

// Helper function to get current steps
const getCurrentSteps = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();

    const options = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      includeManuallyAdded: true,
    };

    AppleHealthKit.getDailyStepCountSamples(options, (error, results) => {
      if (error) {
        reject(error);
        return;
      }

      const totalSteps = results.reduce((sum, sample) => sum + (sample.value || 0), 0);
      resolve(totalSteps);
    });
  });
};

// Define background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('[Background Fetch] Checking steps...');
    
    const steps = await getCurrentSteps();
    console.log('[Background Fetch] Current steps:', steps);
    
    await scheduleStepMilestoneNotification(steps);
    
    return BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[Background Fetch] Failed:', error);
    return BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetch() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background fetch registered successfully');
  } catch (error) {
    console.error('Background fetch registration failed:', error);
  }
}
