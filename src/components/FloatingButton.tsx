import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/fontawesome-free-solid';
import { useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { RootStackParamList } from '../types/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';
import MyPressable from './MyPressable';
import { TextComponent } from './TextComp';

const FloatingButton = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    Animated.timing(animation, {
      toValue: nextOpen ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const openTransaction = (type: 'spent' | 'received') => {
    setIsOpen(false);
    animation.setValue(0);
    navigation.navigate('AddExpense', { type });
  };

  const openScreen = (screen: 'Analytics' | 'Assistant') => {
    setIsOpen(false);
    animation.setValue(0);
    navigation.navigate(screen);
  };

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.actionRow, { opacity: animation }]}
      >
        <TextComponent
          value="Ask assistant"
          color={COLORS.surface}
          size="Small"
          variant="medium"
          style={styles.actionLabel}
        />
        <MyPressable
          testID="Dashboard_Assistant_Button"
          style={styles.actionButton}
          onPress={() => openScreen('Assistant')}
        >
          <Icon name="comment-dots" size={18} color={COLORS.brandStrong} />
        </MyPressable>
      </Animated.View>
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.actionRow, { opacity: animation }]}
      >
        <TextComponent
          value="Analytics"
          color={COLORS.surface}
          size="Small"
          variant="medium"
          style={styles.actionLabel}
        />
        <MyPressable
          testID="Dashboard_Analytics_Button"
          style={styles.actionButton}
          onPress={() => openScreen('Analytics')}
        >
          <Icon name="chart-column" size={18} color={COLORS.brandStrong} />
        </MyPressable>
      </Animated.View>
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[
          styles.actionRow,
          styles.incomeAction,
          {
            opacity: animation,
            transform: [
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TextComponent
          value="Add income"
          color={COLORS.surface}
          size="Small"
          variant="medium"
          style={styles.actionLabel}
        />
        <MyPressable
          testID="Dashboard_AddIncome_Button"
          style={styles.actionButton}
          onPress={() => openTransaction('received')}
        >
          <Icon name="wallet" size={18} color={COLORS.brandStrong} />
        </MyPressable>
      </Animated.View>
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[
          styles.actionRow,
          {
            opacity: animation,
            transform: [
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [6, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TextComponent
          value="Add expense"
          color={COLORS.surface}
          size="Small"
          variant="medium"
          style={styles.actionLabel}
        />
        <MyPressable
          testID="Dashboard_AddExpense_Button"
          style={styles.actionButton}
          onPress={() => openTransaction('spent')}
        >
          <Icon name="receipt" size={18} color={COLORS.brandStrong} />
        </MyPressable>
      </Animated.View>
      <MyPressable
        testID="Dashboard_FloatingAction_Button"
        accessibilityLabel={
          isOpen ? 'Close quick actions' : 'Open quick actions'
        }
        style={styles.mainButton}
        onPress={toggleMenu}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                }),
              },
            ],
          }}
        >
          <Icon name="plus" size={22} color={COLORS.surface} />
        </Animated.View>
      </MyPressable>
    </View>
  );
};

export default FloatingButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  incomeAction: { marginBottom: SPACING.xs },
  actionLabel: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.brandStrong,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
});
