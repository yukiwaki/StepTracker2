import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleStepMilestoneNotification } from './notifications';
import { BackgroundFetchResult } from 'expo-background-fetch';

const BACKGROUND_FETCH_TASK = 'background-fetch';

// Define the task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Get current steps
    const stepsData = await AsyncStorage.getItem('rewardState');
    if (stepsData) {
      const { todayStats } = JSON.parse(stepsData);
      const currentSteps = todayStats.steps;
      
      // Check if we need to send a notification
      await scheduleStepMilestoneNotification(currentSteps);
    }
    
    return BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetchResult.Failed;
  }
});

// Register the background fetch task
export async function registerBackgroundFetch() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background fetch registered');
  } catch (err) {
    console.error('Background fetch registration failed:', err);
  }
}
