import mobileAds, { 
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Initialize mobile ads
mobileAds()
  .initialize()
  .then(() => {
    console.log('Mobile ads initialized successfully');
  })
  .catch(error => {
    console.error('Mobile ads initialization failed:', error);
  });

const adUnitId = __DEV__ 
  ? TestIds.REWARDED 
  : 'ca-app-pub-7806909697893666/6712672687';

export function loadRewardAd(): Promise<RewardedAd> {
  const rewarded = RewardedAd.createForAdRequest(adUnitId);

  return new Promise((resolve, reject) => {
    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,  // "rewarded_loaded"
      () => {
        unsubscribeLoaded();
        resolve(rewarded);
      }
    );

    const unsubscribeError = rewarded.addAdEventListener(
      AdEventType.ERROR,  // "error"
      (error) => {
        unsubscribeError();
        reject(error);
      }
    );

    rewarded.load();
  });
}
