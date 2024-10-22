import { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface MultipliedRewardCelebrationProps {
  visible: boolean;
  baseAmount: number;
  multiplier: number;
  onComplete: () => void;
}

export function MultipliedRewardCelebration({
  visible,
  baseAmount,
  multiplier,
  onComplete,
}: MultipliedRewardCelebrationProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      ReactNativeHapticFeedback.trigger('notificationSuccess');
      
      // Start animations
      opacity.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 400 })
      );

      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1),
        withTiming(0.3, { duration: 400 })
      );

      translateY.value = withSequence(
        withSpring(0),
        withTiming(0, { duration: 1500 }),
        withTiming(-50, { duration: 400 })
      );

      // Call onComplete after animation
      setTimeout(onComplete, 2300);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ],
  }));

  if (!visible) return null;

  const multipliedAmount = baseAmount * multiplier;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.rewardText}>Reward Multiplied!</Text>
        <View style={styles.calculation}>
          <Text style={styles.baseAmount}>{baseAmount} 🪙</Text>
          <Text style={styles.multiplier}>×{multiplier}</Text>
          <Text style={styles.equals}>=</Text>
          <Text style={styles.finalAmount}>{multipliedAmount} 🪙</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F203AF',
  },
  rewardText: {
    fontSize: 24,
    color: '#F203AF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  calculation: {
    alignItems: 'center',
    gap: 10,
  },
  baseAmount: {
    fontSize: 32,
    color: '#fff',
  },
  multiplier: {
    fontSize: 24,
    color: '#F203AF',
    fontWeight: 'bold',
  },
  equals: {
    fontSize: 24,
    color: '#fff',
  },
  finalAmount: {
    fontSize: 40,
    color: '#F203AF',
    fontWeight: 'bold',
  },
});