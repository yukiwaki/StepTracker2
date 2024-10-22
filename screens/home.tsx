import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReward } from '../contexts/reward-context';
import { useHealthKit } from '../hooks/useHealthKit';

export default function Home() {
  const { coins } = useReward();
  const { steps, isAuthorized, error } = useHealthKit();

  if (!isAuthorized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#F203AF" />
          <Text style={styles.text}>Requesting Health Access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.text, styles.error]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stepsToNextReward = 100 - (steps % 100);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Step Tracker</Text>
        <Text style={styles.steps}>{steps.toLocaleString()} steps</Text>
        <Text style={styles.coins}>🪙 {coins}</Text>
        <Text style={styles.nextReward}>
          {stepsToNextReward} steps until next coin
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F203AF',
    marginBottom: 20,
  },
  steps: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 10,
  },
  coins: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  nextReward: {
    fontSize: 16,
    color: '#666',
  },
  text: {
    color: '#fff',
    marginTop: 10,
  },
  error: {
    color: '#ff4444',
  },
});