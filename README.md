# Step Tracker App

A React Native + Expo app that tracks users' steps and rewards them with coins. Users can multiply their rewards by watching ads.

## Features

- Step tracking integration with Apple Health (iOS) and Google Fit (Android)
- Reward system: earn coins for every 500 steps
- Ad-based reward multiplier system (1.5x, 2x, or 3x)
- Persistent storage of coins and progress
- Animated reward celebrations
- Dark theme with custom branding
- Push notification every 500 steps

## Tech Stack

- React Native with Expo
- TypeScript
- react-native-health for iOS Health Kit integration
- react-native-google-mobile-ads for AdMob integration
- react-native-reanimated for animations
- react-native-haptic-feedback for haptic feedback
- AsyncStorage for data persistence
- expo-notifications for push notification

## Prerequisites

- Node.js (v14 or later)
- Xcode (for iOS development)
- Android Studio (for Android development)
- Expo CLI (`npm install -g expo-cli`)
- AdMob account with test/production ad unit IDs

## Installation

1. Clone the repository:
```bash
git clone 
cd StepTracker
```

2. Install dependencies:
```bash
npm install
```

3. Install pods for iOS:
```bash
cd ios
pod install
cd ..
```

## Configuration

### 1. AdMob Setup

1. Add your AdMob application ID to `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "android": true,
          "ios": {
            "appId": "ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyyyy"
          }
        }
      ]
    ]
  }
}
```

2. Update `ios/StepTracker/Info.plist` with AdMob configuration:
```xml
GADApplicationIdentifier
ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyyyy
SKAdNetworkItems

  
    SKAdNetworkIdentifier
    cstr6suwn9.skadnetwork
  

```

### 2. Health Kit Setup

Add required permissions to `ios/StepTracker/Info.plist`:
```xml
NSHealthShareUsageDescription
Read steps data to give you coins rewards
NSHealthUpdateUsageDescription
Read steps data to give you coins rewards
```

## Running the App

### Development Build

```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

### Production Build

1. Update app.json with your production configuration
2. Replace test ad units with production ad unit IDs
3. Build:
```bash
eas build --platform ios
eas build --platform android
```

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── RewardBox.tsx
│   └── MultipliedRewardCelebration.tsx
├── contexts/            # React Context providers
│   └── reward-context.tsx
├── hooks/              # Custom hooks
│   └── useHealthKit.ts
├── types/              # TypeScript type definitions
│   └── rewards.ts
├── utils/              # Utility functions
│   └── ads.ts
└── screens/            # App screens
    └── home.tsx
```

## Key Features Implementation

### Step Tracking
- Uses react-native-health to connect with HealthKit
- Updates every minute to fetch new step data
- Automatically calculates reward boxes for every 500 steps

### Reward System
- Base reward: 1 coin per 500 steps
- Multiplier options: 1.5x, 2x, or 3x through reward ads
- Animated celebrations for rewards
- Persistent storage of earned coins

### Ad Integration
- Uses Google AdMob for reward ads
- Test ads in development
- Configurable ad unit IDs for production
- Error handling and retry mechanism

## Customization

### Styling
Main colors and styles can be modified in respective component files:
- Primary color: #F203AF
- Background color: #000000
- Accent colors defined in component styles

### Reward Configuration
Modify in `reward-context.tsx`:
- Steps per reward (default: 500)
- Base coin reward (default: 1)
- Available multipliers (default: 1.5x, 2x, 3x)

## Testing

### Test Ads
- Development builds use test ad unit IDs
- Test ads can be loaded without real ad credentials
- Use Google's test device IDs for testing

### Health Data
- Use Health app to add test step data
- Monitor step updates in the app
- Test reward calculations and multipliers

## Troubleshooting

Common issues and solutions:

1. Ad Loading Issues
- Verify AdMob configuration
- Check internet connection
- Confirm ad unit IDs
- Check console logs for detailed error messages

2. Health Kit Integration
- Ensure proper permissions in Info.plist
- Check authorization status
- Verify Health app data availability

## License

[Your License Here]

## Contributing

[Contribution Guidelines]

## Contact

[Your Contact Information]
