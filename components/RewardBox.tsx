import { StyleSheet, Text, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  runOnJS,
  useSharedValue,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import type { RewardBox } from '../types/rewards';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

interface RewardBoxComponentProps {
  box: RewardBox;
  onCollect: () => void;
}

export function RewardBoxComponent({ box, onCollect }: RewardBoxComponentProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handleCollection = () => {
    if (box.collected) return;

    // Trigger haptic feedback
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);

    // Start animation
    scale.value = withSequence(
      withSpring(1.2, { damping: 2 }),
      withSpring(0.8, { damping: 2 }),
      withSpring(1, { damping: 2 })
    );

    // Call the collection callback
    onCollect();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable onPress={handleCollection} disabled={box.collected}>
      <Animated.View
        style={[
          styles.rewardBox,
          box.collected && styles.rewardBoxCollected,
          animatedStyle,
        ]}
      >
        <Text style={styles.rewardBoxText}>
          {box.collected ? '✓' : '🎁'}
        </Text>
        <Text style={styles.rewardBoxSteps}>
          {box.stepMilestone} steps
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rewardBox: {
    width: 100,
    height: 100,
    backgroundColor: '#F203AF22',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F203AF',
  },
  rewardBoxCollected: {
    backgroundColor: '#F203AF44',
    borderColor: '#F203AF88',
  },
  rewardBoxText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 5,
  },
  rewardBoxSteps: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
});