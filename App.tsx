import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeAds } from './utils/ads';
import Home from './screens/home';
import { RewardProvider } from './contexts/reward-context';
import { setupNotifications } from './utils/notifications';
import { registerBackgroundFetch } from './utils/background-fetch';


export default function App() {
  useEffect(() => {
    initializeAds();
  }, []);

  useEffect(() => {
    const init = async () => {
      await initializeAds();
      await setupNotifications();
      await registerBackgroundFetch(); // Add this
    };
    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      await initializeAds();
      await setupNotifications();
    };
    init();
  }, []);

  return (
    <SafeAreaProvider>
      <RewardProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          <Home />
        </View>
      </RewardProvider>
    </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});