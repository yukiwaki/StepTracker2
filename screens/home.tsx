import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReward } from '../contexts/reward-context';

export default function Home() {
  const { coins } = useReward();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Step Tracker</Text>
        <Text style={styles.coins}>🪙 {coins}</Text>
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
  coins: {
    fontSize: 20,
    color: '#fff',
  },
});
