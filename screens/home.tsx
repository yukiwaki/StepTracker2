import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReward } from '../contexts/reward-context';
import { useHealthKit } from '../hooks/useHealthKit';
import { RewardBoxComponent } from '../components/RewardBox';
import { CollectionCelebration } from '../components/CollectionCelebration';
import { MultiplierModal } from '../components/MultiplierModal';
import { MultipliedRewardCelebration } from '../components/MultipliedRewardCelebration';
import type { Multiplier } from '../types/rewards';

export default function Home() {
  const { coins, todayStats, collectReward, applyMultiplier } = useReward();
  const { isAuthorized, error, refreshSteps } = useHealthKit();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMultiplier, setShowMultiplier] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [showMultipliedCelebration, setShowMultipliedCelebration] = useState(false);
  const [multipliedAmount, setMultipliedAmount] = useState<Multiplier | null>(null);

  const handleCollectReward = (boxId: string) => {
    collectReward(boxId);
    setSelectedBoxId(boxId);
    setShowCelebration(true);
    
    // Show multiplier modal after celebration
    setTimeout(() => {
      setShowMultiplier(true);
    }, 1600);
  };

  const handleMultiplier = (multiplier: Multiplier) => {
    if (selectedBoxId) {
      setMultipliedAmount(multiplier);
      setShowMultipliedCelebration(true);
      applyMultiplier(selectedBoxId, multiplier);
    }
  };
    

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
              onCollect={() => handleCollectReward(box.id)}
            />
          ))}
        </View>
      </ScrollView>

      <CollectionCelebration
        visible={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
          setShowMultiplier(true);
        }}
      />

      {selectedBoxId && (
        <MultiplierModal
          visible={showMultiplier}
          onClose={() => {
            setShowMultiplier(false);
            setSelectedBoxId(null);
          }}
          onSelectMultiplier={handleMultiplier}
          boxId={selectedBoxId}
        />
      )}

      {/* Add MultipliedRewardCelebration outside the modal */}
      {multipliedAmount && (
        <MultipliedRewardCelebration
          visible={showMultipliedCelebration}
          baseAmount={1}
          multiplier={multipliedAmount}
          onComplete={() => {
            setShowMultipliedCelebration(false);
            setMultipliedAmount(null);
          }}
        />
      )}
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
  debugButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  debugButtonText: {
    color: '#fff',
  },
});
