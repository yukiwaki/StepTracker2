import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function setupNotifications() {
  // Configure how notifications are handled when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, // This will show notifications even in foreground
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

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
  const milestone = Math.floor(steps / 500) * 500 + 500;
  
  // Different messages based on milestones
  const messages = [
    `Woohoo! You've hit ${milestone} steps! 🎉`,
    `Amazing progress! ${milestone} steps reached! 💪`,
    `You're on fire! ${milestone} steps and counting! 🔥`,
    `Incredible! You've reached ${milestone} steps! ⭐️`
  ];
  
  // Randomly select a message
  const messageIndex = Math.floor(Math.random() * messages.length);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Step Milestone Reached! 🎉',
      body: messages[messageIndex],
      data: { milestone },
      categoryIdentifier: 'steps',
      sound: true,
    },
    trigger: null,
  });
}