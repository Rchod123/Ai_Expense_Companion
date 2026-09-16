import Icon from '@react-native-vector-icons/fontawesome-free-solid';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../utils/colors';
import MyPressable from '../../components/MyPressable';
import { TextComponent } from '../../components/TextComp';

type Props = { balance: number };

export const BalanceCard = ({ balance }: Props) => {
  const [isVisible, setIsVisible] = useState(true);
  const displayValue = `₹${Math.abs(balance).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
  return (
    <View testID="Dashboard_Balance_Card" style={styles.card}>
      <View style={styles.copy}>
        <TextComponent
          value="Net balance"
          color={COLORS.surfaceMuted}
          size="Small"
        />
        <TextComponent
          value={
            isVisible ? `${balance < 0 ? '-' : ''}${displayValue}` : '₹ ••••••'
          }
          size="Large"
          variant="bold"
          color={COLORS.surface}
        />
        <TextComponent
          value="This month"
          color={COLORS.surfaceMuted}
          size="ExtraSmall"
        />
      </View>
      <MyPressable
        testID="Dashboard_BalanceVisibility_Button"
        style={styles.visibilityButton}
        onPress={() => setIsVisible(value => !value)}
      >
        <Icon
          name={isVisible ? 'eye-slash' : 'eye'}
          size={16}
          color={COLORS.surface}
        />
      </MyPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.brandStrong,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginVertical: SPACING.lg,
    ...SHADOWS.card,
  },
  copy: { gap: SPACING.xs },
  visibilityButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
