import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function setupNotifications() {
  // Configure how notifications are handled when app is in foreground

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, // This will show notifications even in foreground
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('steps', [
      {
        identifier: 'collect',
        buttonTitle: 'Collect Reward',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  }

  return true;
}

// Add this test function
export async function testNotification() {
  try {
    const permission = await setupNotifications(); // Ensure permissions are set
    if (!permission) {
      console.log('No notification permission');
      return;
    }

    console.log('Scheduling test notification...'); // Debug log
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification 🔔',
        body: 'If you see this, notifications are working!',
        sound: true,
      },
      trigger: null, // null means show immediately
    });
    
    console.log('Test notification scheduled'); // Debug log
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}

export async function scheduleStepMilestoneNotification(steps: number) {
  const currentMilestone = Math.floor(steps / 500) * 500;
  const nextMilestone = currentMilestone + 500;
  
  // Only notify if we've just passed a milestone
  if (steps < nextMilestone) {
    return;
  }

  console.log('Scheduling milestone notification for:', currentMilestone);

  // Different messages for variety
  const messages = [
    `Amazing! You've reached ${currentMilestone} steps! 🎉`,
    `Great job! ${currentMilestone} steps completed! 💪`,
    `Keep going! You've hit ${currentMilestone} steps! ⭐️`,
    `Fantastic progress! ${currentMilestone} steps achieved! 🌟`
  ];
  
  const messageIndex = Math.floor(Math.random() * messages.length);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Step Milestone Reached! 🎉',
      body: messages[messageIndex],
      data: { milestone: currentMilestone },
      categoryIdentifier: 'steps',
      sound: true,
    },
    trigger: null, // Show immediately
  });
}