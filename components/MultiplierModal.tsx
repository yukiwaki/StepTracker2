import { useEffect, useState, useCallback } from 'react';
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
import { MultipliedRewardCelebration } from './MultipliedRewardCelebration';

interface MultiplierModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMultiplier: (multiplier: Multiplier) => void;
  boxId: string; // Add this to track which reward box we're working with
}

export function MultiplierModal({ 
  visible, 
  onClose, 
  onSelectMultiplier,
  boxId 
}: MultiplierModalProps) {
  const [adLoading, setAdLoading] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);
  const [showMultipliedReward, setShowMultipliedReward] = useState(false);
  const [selectedMultiplier, setSelectedMultiplier] = useState<Multiplier | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  console.log('MultiplierModal state:', {
    visible,
    adLoaded,
    showMultipliedReward,
    selectedMultiplier,
    boxId
  });

  const loadAd = async () => {
    console.log('Loading ad for box:', boxId);
    setAdLoading(true);
    setAdLoaded(false);
    
    try {
      const ad = await loadRewardAd();
      console.log('Ad loaded successfully for box:', boxId);
      setRewardedAd(ad);
      setAdLoaded(true);
    } catch (error) {
      console.error('Failed to load ad:', error);
      if (loadAttempts < 3) {
        setLoadAttempts(prev => prev + 1);
        setTimeout(loadAd, 2000);
      } else {
        Alert.alert(
          'Ad Error',
          'Failed to load reward video. Please try again later.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } finally {
      setAdLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      console.log('Modal became visible for box:', boxId);
      setLoadAttempts(0);
      loadAd();
    }
    return () => {
      console.log('Modal cleanup for box:', boxId);
      setRewardedAd(null);
      setAdLoaded(false);
      setShowMultipliedReward(false);
      setSelectedMultiplier(null);
    };
  }, [visible, boxId]);

  const handleWatchAd = async (multiplier: Multiplier) => {
    if (!rewardedAd || !adLoaded) {
      console.log('Ad not ready:', { hasAd: !!rewardedAd, isLoaded: adLoaded });
      return;
    }

    console.log('Starting ad for multiplier:', multiplier, 'box:', boxId);
    ReactNativeHapticFeedback.trigger('impactMedium');
    setSelectedMultiplier(multiplier);

    try {
      const unsubscribeReward = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          console.log('Reward earned for box:', boxId, 'multiplier:', multiplier);
          setShowMultipliedReward(true);
        }
      );

      const unsubscribeClose = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          console.log('Ad closed for box:', boxId);
          unsubscribeReward();
          unsubscribeClose();
          if (!showMultipliedReward) {
            onClose();
          }
        }
      );

      console.log('Showing ad for box:', boxId);
      await rewardedAd.show();
    } catch (error) {
      console.error('Failed to show ad:', error);
      onClose();
    }
  };

  const handleCelebrationComplete = useCallback(() => {
    console.log('Celebration complete for box:', boxId, 'multiplier:', selectedMultiplier);
    if (selectedMultiplier) {
      onSelectMultiplier(selectedMultiplier);
    }
    setShowMultipliedReward(false);
    onClose();
  }, [selectedMultiplier, boxId, onSelectMultiplier, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {showMultipliedReward ? (
          <MultipliedRewardCelebration
            visible={true}
            baseAmount={1}
            multiplier={selectedMultiplier || 1}
            onComplete={handleCelebrationComplete}
          />
        ) : (
          <View style={styles.content}>
            <Text style={styles.title}>Multiply Your Reward!</Text>
            <Text style={styles.subtitle}>Watch a video to multiply your coins</Text>

            {adLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F203AF" />
                <Text style={styles.loadingText}>Loading reward video...</Text>
              </View>
            ) : (
              <View style={styles.multiplierContainer}>
                {([1.5, 2, 3] as const).map((multiplier) => (
                  <TouchableOpacity
                    key={multiplier}
                    style={[
                      styles.multiplierButton,
                      !adLoaded && styles.multiplierButtonDisabled
                    ]}
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
        )}
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
  multiplierButtonDisabled: {
    opacity: 0.5,
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
  debugText: {
    position: 'absolute',
    top: 50,
    left: 20,
    color: '#fff',
    zIndex: 9999,
  },
    loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
});