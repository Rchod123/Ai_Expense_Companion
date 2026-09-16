import { StyleSheet, View } from 'react-native';
import CircularProgress from '../../components/CircularProgress';
import { TextComponent } from '../../components/TextComp';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../utils/colors';

type Props = { spent: number; income: number };

export const SpendCard = ({ spent, income }: Props) => {
  const savingsRate =
    income > 0 ? Math.max(0, Math.round(((income - spent) / income) * 100)) : 0;
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TextComponent
          value="Spent this month"
          size="Small"
          color={COLORS.textSecondary}
        />
        <TextComponent
          value={`₹${spent.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
          })}`}
          variant="bold"
          size="MMedium"
        />
      </View>
      <View style={[styles.card, styles.savingsCard]}>
        <View>
          <TextComponent
            value="Savings rate"
            size="Small"
            color={COLORS.textSecondary}
          />
          <TextComponent
            value={`${savingsRate}%`}
            variant="bold"
            size="MMedium"
          />
        </View>
        <CircularProgress progress={savingsRate} size={38} strokeWidth={5} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: SPACING.sm },
  card: {
    flex: 1,
    minHeight: 82,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    justifyContent: 'space-between',
    ...SHADOWS.card,
  },
  savingsCard: { flexDirection: 'row', alignItems: 'center' },
});
