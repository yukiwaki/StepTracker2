import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

interface CelebrationProps {
  visible: boolean;
  onComplete: () => void;
}

export function CollectionCelebration({ visible, onComplete }: CelebrationProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(1000, withTiming(0, { duration: 300 }))
      );
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1),
        withDelay(1000, withTiming(0.3))
      );

      // Call onComplete after animation
      setTimeout(onComplete, 1600);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, animatedStyle]}>
        +1 🪙
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  text: {
    fontSize: 48,
    color: '#F203AF',
    fontWeight: 'bold',
  },
});