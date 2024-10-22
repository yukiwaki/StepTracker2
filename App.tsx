import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Home from './screens/home';
import { RewardProvider } from './contexts/reward-context';

export default function App() {
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
