import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReward } from '../contexts/reward-context';
import { useHealthKit } from '../hooks/useHealthKit';
import type { RewardBox } from '../types/rewards';

interface RewardBoxComponentProps {
  box: RewardBox;
  onCollect: () => void;
}

function RewardBoxComponent({ box, onCollect }: RewardBoxComponentProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.rewardBox,
        box.collected && styles.rewardBoxCollected
      ]}
      onPress={onCollect}
      disabled={box.collected}
    >
      <Text style={styles.rewardBoxText}>
        {box.collected ? '✓' : '🎁'}
      </Text>
      <Text style={styles.rewardBoxSteps}>
        {box.stepMilestone} steps
      </Text>
    </TouchableOpacity>
  );
}

export default function Home() {
  const { coins, todayStats, collectReward } = useReward();
  const { isAuthorized, error } = useHealthKit();

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

  const uncollectedBoxes = todayStats.rewardBoxes.filter(box => !box.collected).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Step Tracker</Text>
        <Text style={styles.steps}>{todayStats.steps.toLocaleString()} steps</Text>
        <Text style={styles.coins}>🪙 {coins}</Text>
        
        {uncollectedBoxes > 0 && (
          <Text style={styles.availableRewards}>
            {uncollectedBoxes} rewards available!
          </Text>
        )}

        <View style={styles.rewardBoxContainer}>
          {todayStats.rewardBoxes.map((box) => (
            <RewardBoxComponent
              key={box.id}
              box={box}
              onCollect={() => collectReward(box.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
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
    marginBottom: 20,
  },
  text: {
    color: '#fff',
    marginTop: 10,
  },
  error: {
    color: '#ff4444',
  },
  availableRewards: {
    fontSize: 18,
    color: '#F203AF',
    marginBottom: 20,
  },
  rewardBoxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
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