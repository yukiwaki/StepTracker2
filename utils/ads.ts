import mobileAds, { 
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
  RequestConfiguration,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// Test IDs
export const AD_UNIT_IDS = {
  REWARDED: __DEV__ 
    ? TestIds.REWARDED
    : 'ca-app-pub-7806909697893666/6712672687'
};

// Add your iOS app ID here
const IOS_APP_ID = 'ca-app-pub-7806909697893666~7500479473'; // Replace with your iOS app ID

console.log('Current AD_UNIT_ID:', AD_UNIT_IDS.REWARDED);

let isInitialized = false;

// Initialize mobile ads
export async function initializeAds() {
  console.log('Starting ads initialization...');
  try {
    // Configure the mobile ads SDK
    const requestConfig: RequestConfiguration = {
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
    };

    // Initialize with iOS App ID
    if (Platform.OS === 'ios') {
      console.log('Initializing iOS ads with app ID:', IOS_APP_ID);
      await mobileAds().setRequestConfiguration(requestConfig);
      const result = await mobileAds().initialize();
      console.log('Mobile ads initialization response:', result);
    } else {
      // For Android or other platforms
      const result = await mobileAds().initialize();
      console.log('Mobile ads initialization response:', result);
    }
    
    // Wait a bit after initialization before marking as ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    isInitialized = true;
    console.log('Mobile ads initialization completed');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Mobile ads initialization failed:', {
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Mobile ads initialization failed with unknown error:', error);
    }
    return false;
  }
}

// Rest of your code remains the same...

// Check initialization status
export function checkAdsInitialization(): Promise<boolean> {
  return new Promise((resolve) => {
    if (isInitialized) {
      resolve(true);
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;
    const checkInterval = setInterval(() => {
      attempts++;
      console.log(`Checking ads initialization... Attempt ${attempts}`);
      
      if (isInitialized) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log('Ads initialization check timed out');
        resolve(false);
      }
    }, 1000);
  });
}

// Use this in your App.tsx
export function loadRewardAd(): Promise<RewardedAd> {
  console.log('=== Starting to load reward ad ===');
  
  return new Promise(async (resolve, reject) => {
    try {
      // Check initialization first
      const isReady = await checkAdsInitialization();
      if (!isReady) {
        throw new Error('Ads not properly initialized');
      }

      console.log('Creating ad request for unit ID:', AD_UNIT_IDS.REWARDED);
      const rewarded = RewardedAd.createForAdRequest(AD_UNIT_IDS.REWARDED, {
        requestNonPersonalizedAdsOnly: true,
        keywords: ['game', 'fitness', 'health'],
      });

      console.log('Rewarded ad instance created');
      let hasResolved = false;
      const startTime = Date.now();

      // Track all possible ad events for debugging
      const eventSubscriptions = new Map();

      const cleanup = () => {
        console.log('Cleaning up event listeners');
        eventSubscriptions.forEach((unsub) => unsub());
        eventSubscriptions.clear();
      };

      const addEventListener = (eventType: string, handler: (...args: any[]) => void) => {
        const unsubscribe = rewarded.addAdEventListener(eventType as any, (...args) => {
          console.log(`Ad event fired: ${eventType}`, ...args);
          handler(...args);
        });
        eventSubscriptions.set(eventType, unsubscribe);
      };

      addEventListener(RewardedAdEventType.LOADED, () => {
        const loadTime = Date.now() - startTime;
        console.log(`Ad loaded successfully (took ${loadTime}ms)`);
        hasResolved = true;
        cleanup();
        resolve(rewarded);
      });

      addEventListener(AdEventType.ERROR, (error: { message: string; code: string; domain: string }) => {
        console.error('Ad loading error:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          domain: error.domain
        });
        
        if (!hasResolved) {
          cleanup();
          reject(error);
        }
      });

      addEventListener(AdEventType.OPENED, () => console.log('Ad opened'));
      addEventListener(AdEventType.CLOSED, () => console.log('Ad closed'));
      addEventListener(RewardedAdEventType.EARNED_REWARD, () => console.log('Reward earned'));

      const timeoutDuration = 30000;
      const timeoutId = setTimeout(() => {
        if (!hasResolved) {
          cleanup();
          reject(new Error(`Ad load timeout after ${timeoutDuration}ms`));
        }
      }, timeoutDuration);

      console.log('Calling load() on rewarded ad');
      rewarded.load();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error in loadRewardAd:', {
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unknown error in loadRewardAd:', error);
      }
      reject(error);
    }
  });
}
