import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { COLORS } from '../utils/colors';

interface CircularProgressProps {
  progress: number; 
  size?: number;
  strokeWidth?: number;
  title?: string;
  value?: string;
}

const CircularProgress = ({
  progress,
  size = 160,
  strokeWidth = 14,
  title,
  value,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const safeProgress = Math.min(Math.max(progress, 0), 100);

  const strokeDashoffset =
    circumference - (safeProgress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <Defs>
          <LinearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={COLORS.purple} />
            <Stop offset="100%" stopColor={COLORS.purple} />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#DDE8E3"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
       {value && <Text style={styles.value}>{value}</Text>}

        {title && <Text style={styles.title}>
          {title}
        </Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#172B2A',
  },

  title: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7C78',
  },
});

export default CircularProgress;