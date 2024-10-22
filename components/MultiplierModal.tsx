import { useEffect, useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { 
  RewardedAd, 
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { loadRewardAd } from '../utils/ads';
import type { Multiplier } from '../types/rewards';

interface MultiplierModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMultiplier: (multiplier: Multiplier) => void;
}

export function MultiplierModal({ 
  visible, 
  onClose, 
  onSelectMultiplier 
}: MultiplierModalProps) {
  const [adLoading, setAdLoading] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  useEffect(() => {
    if (visible) {
      loadAd();
    }
    return () => {
      setRewardedAd(null);
      setAdLoaded(false);
    };
  }, [visible]);

  const loadAd = async () => {
    setAdLoading(true);
    try {
      const ad = await loadRewardAd();
      setRewardedAd(ad);
      setAdLoaded(true);
    } catch (error) {
      console.error('Failed to load ad:', error);
      Alert.alert(
        'Ad Error',
        'Failed to load reward video. Please try again later.',
        [{ text: 'OK', onPress: onClose }]
      );
    } finally {
      setAdLoading(false);
    }
  };

  const handleWatchAd = async (multiplier: Multiplier) => {
    if (!rewardedAd) return;

    ReactNativeHapticFeedback.trigger('impactMedium');

    const cleanupListeners = new Set<() => void>();

    try {
      // Listen for reward
      const unsubscribeReward = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,  // "rewarded_earned_reward"
        () => {
          onSelectMultiplier(multiplier);
          onClose();
        }
      );
      cleanupListeners.add(unsubscribeReward);

      // Listen for errors
      const unsubscribeError = rewardedAd.addAdEventListener(
        AdEventType.ERROR,  // "error"
        () => {
          Alert.alert(
            'Ad Error',
            'Failed to play reward video. Please try again later.',
            [{ text: 'OK', onPress: onClose }]
          );
        }
      );
      cleanupListeners.add(unsubscribeError);

      // Listen for ad closed
      const unsubscribeClose = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,  // "closed"
        () => {
          // Clean up after ad is closed
          onClose();
        }
      );
      cleanupListeners.add(unsubscribeClose);

      await rewardedAd.show();
    } catch (error) {
      console.error('Failed to show ad:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK', onPress: onClose }]
      );
    } finally {
      // Cleanup all listeners
      cleanupListeners.forEach(cleanup => cleanup());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Multiply Your Reward!</Text>
          <Text style={styles.subtitle}>Watch a video to multiply your coins</Text>

          {adLoading ? (
            <ActivityIndicator size="large" color="#F203AF" />
          ) : (
            <View style={styles.multiplierContainer}>
              {([1.5, 2, 3] as const).map((multiplier) => (
                <TouchableOpacity
                  key={multiplier}
                  style={[styles.multiplierButton]}
                  onPress={() => handleWatchAd(multiplier)}
                  disabled={!adLoaded}
                >
                  <Text style={styles.multiplierText}>{multiplier}x</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Text style={styles.closeText}>No Thanks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F203AF',
  },
  title: {
    fontSize: 24,
    color: '#F203AF',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  multiplierContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  multiplierButton: {
    backgroundColor: '#F203AF22',
    borderRadius: 10,
    padding: 15,
    width: 70,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F203AF',
  },
  multiplierText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
  },
  closeText: {
    color: '#666',
    fontSize: 16,
  },
});