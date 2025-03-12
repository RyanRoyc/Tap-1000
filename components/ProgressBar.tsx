import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface ProgressBarProps {
  progress: number;
  isDarkMode: boolean;
}

export default function ProgressBar({ progress, isDarkMode }: ProgressBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      tension: 20,
      friction: 3,
    }).start();
  }, [progress]);

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Animated.View
        style={[
          styles.progress,
          isDarkMode && styles.darkProgress,
          {
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  darkContainer: {
    backgroundColor: '#333',
  },
  progress: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  darkProgress: {
    backgroundColor: '#0A84FF',
  },
});