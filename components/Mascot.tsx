import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/colors';

type MascotProps = {
  emotion?: 'happy' | 'excited' | 'thinking' | 'sad';
  size?: number;
};

export default function Mascot({ emotion = 'happy', size = 80 }: MascotProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (emotion === 'excited') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (emotion === 'thinking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [emotion, bounceAnim, scaleAnim]);

  const getEyeStyle = () => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return styles.eyeHappy;
      case 'sad':
        return styles.eyeSad;
      default:
        return styles.eye;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size, transform: [{ translateY: bounceAnim }, { scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.body, { width: size, height: size }]}>
        <View style={styles.ears}>
          <View style={[styles.ear, styles.earLeft, { width: size * 0.25, height: size * 0.35 }]} />
          <View style={[styles.ear, styles.earRight, { width: size * 0.25, height: size * 0.35 }]} />
        </View>

        <View style={styles.face}>
          <View style={[getEyeStyle(), { width: size * 0.12, height: size * 0.12 }]} />
          <View style={[getEyeStyle(), { width: size * 0.12, height: size * 0.12 }]} />
        </View>

        <View style={[styles.nose, { width: size * 0.15, height: size * 0.12 }]} />

        <View style={[styles.tail, { width: size * 0.4, height: size * 0.15 }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    backgroundColor: '#FF8C42',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ears: {
    position: 'absolute',
    top: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  ear: {
    backgroundColor: '#FF8C42',
    borderRadius: 100,
  },
  earLeft: {
    transform: [{ rotate: '-20deg' }],
  },
  earRight: {
    transform: [{ rotate: '20deg' }],
  },
  face: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  eye: {
    backgroundColor: Colors.text,
    borderRadius: 100,
  },
  eyeHappy: {
    backgroundColor: Colors.text,
    borderRadius: 100,
    transform: [{ scaleY: 0.5 }],
  },
  eyeSad: {
    backgroundColor: Colors.text,
    borderRadius: 100,
    transform: [{ scaleY: 0.7 }],
  },
  nose: {
    backgroundColor: '#2C3E50',
    borderRadius: 100,
    marginTop: 4,
  },
  tail: {
    position: 'absolute',
    right: -20,
    bottom: 10,
    backgroundColor: '#FF8C42',
    borderRadius: 100,
    transform: [{ rotate: '45deg' }],
  },
});
