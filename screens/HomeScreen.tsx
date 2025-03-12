import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [tapCount, setTapCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const [currentMessage, setCurrentMessage] = useState('');

  const funnyMessages = [
    "Still going?",
    "You must be really bored.",
    "Halfway there! (Kind of.)",
    "Almost done... not really.",
    "Your finger must be tired!",
    "Why are you still here?",
    "This is dedication!",
    "Or maybe it's madness?",
    "Keep tapping, I guess?",
    "You're doing great! (At wasting time)",
  ];

  useEffect(() => {
    loadBestTime();
  }, []);

  useEffect(() => {
    if (startTime && !gameComplete) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [startTime, gameComplete]);

  const loadBestTime = async () => {
    try {
      const savedTime = await AsyncStorage.getItem('bestTime');
      if (savedTime) setBestTime(parseFloat(savedTime));
    } catch (error) {
      console.error('Error loading best time:', error);
    }
  };

  const saveBestTime = async (time: number) => {
    try {
      if (!bestTime || time < bestTime) {
        await AsyncStorage.setItem('bestTime', time.toString());
        setBestTime(time);
      }
    } catch (error) {
      console.error('Error saving best time:', error);
    }
  };

  const showMessage = (message: string) => {
    setCurrentMessage(message);
    messageOpacity.setValue(1);
    Animated.sequence([
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTap = () => {
    if (gameComplete) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (tapCount === 0) {
      setStartTime(Date.now());
    }

    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount % 50 === 0) {
      showMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
    }

    if (newCount >= 1000) {
      const finalTime = Date.now() - (startTime || Date.now());
      setGameComplete(true);
      saveBestTime(finalTime);
      showMessage("You win absolutely nothing :)");
    }
  };

  const resetGame = () => {
    setTapCount(0);
    setStartTime(null);
    setCurrentTime(0);
    setGameComplete(false);
    setCurrentMessage('');
  };

  const formatTime = (time: number) => {
    return (time / 1000).toFixed(2);
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <TouchableOpacity
        style={styles.darkModeToggle}
        onPress={() => setIsDarkMode(!isDarkMode)}
      >
        <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={isDarkMode ? 'white' : 'black'} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>Tap 1000</Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>
          Best Time: {bestTime ? `${formatTime(bestTime)}s` : 'No record yet'}
        </Text>
      </View>

      <View style={styles.gameContainer}>
        <TouchableOpacity
          style={[styles.tapButton, isDarkMode && styles.darkTapButton]}
          onPress={handleTap}
          activeOpacity={0.7}
        >
          <Text style={[styles.tapCount, isDarkMode && styles.darkText]}>
            {tapCount}
          </Text>
        </TouchableOpacity>

        <Animated.Text style={[styles.messageText, { opacity: messageOpacity }, isDarkMode && styles.darkText]}>
          {currentMessage}
        </Animated.Text>

        <ProgressBar progress={tapCount / 1000} isDarkMode={isDarkMode} />

        <Text style={[styles.timeText, isDarkMode && styles.darkText]}>
          Time: {formatTime(currentTime)}s
        </Text>

        {gameComplete && (
          <TouchableOpacity
            style={[styles.resetButton, isDarkMode && styles.darkResetButton]}
            onPress={resetGame}
          >
            <Text style={[styles.resetButtonText, isDarkMode && styles.darkText]}>
              Try Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  tapButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  darkTapButton: {
    backgroundColor: '#0A84FF',
  },
  tapCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  messageText: {
    fontSize: 20,
    marginVertical: 20,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 24,
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  darkResetButton: {
    backgroundColor: '#0A84FF',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  darkText: {
    color: 'white',
  },
  darkModeToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
});