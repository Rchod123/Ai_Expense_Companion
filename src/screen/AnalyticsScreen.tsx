import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import { BackButton } from '../components/BackButton';
import MyPressable from '../components/MyPressable';
import { TextComponent } from '../components/TextComp';
import { RootStackParamList } from '../types/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';
import { useExpenses } from '../zustand/store';

const months = [
  'All months',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
export const AnalyticsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [monthIndex, setMonthIndex] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [picker, setPicker] = useState<'month' | 'year' | null>(null);
  const expenses = useExpenses(state => state.expenses).filter(item => {
    const date = new Date(item.date);
    return (
      date.getFullYear() === year &&
      (!monthIndex || date.getMonth() + 1 === monthIndex)
    );
  });
  const income = expenses
    .filter(item => item.transactionType === 'received')
    .reduce((sum, item) => sum + Number(item.transactionAmount), 0);
  const spent = expenses
    .filter(item => item.transactionType === 'spent')
    .reduce((sum, item) => sum + Number(item.transactionAmount), 0);
  const bars = expenses
    .filter(item => item.transactionType === 'spent')
    .slice(0, 6)
    .map(item => Number(item.transactionAmount));
  const maximum = Math.max(...bars, 1);
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <TextComponent
          testID="Analytics_Title"
          value="Analytics"
          size="GMedium"
          variant="bold"
        />
        <View style={styles.space} />
      </View>
      <View style={styles.filters}>
        <MyPressable style={styles.filter} onPress={() => setPicker('month')}>
          <TextComponent value={months[monthIndex]} size="Small" />
        </MyPressable>
        <MyPressable style={styles.filter} onPress={() => setPicker('year')}>
          <TextComponent value={`${year}`} size="Small" />
        </MyPressable>
      </View>
      <View style={styles.summary}>
        <Metric label="Income" value={income} color={COLORS.success} />
        <Metric label="Expenses" value={spent} color={COLORS.danger} />
      </View>
      <View style={styles.chartCard}>
        <TextComponent value="Expense trend" variant="bold" />
        <Svg width="100%" height={180} viewBox="0 0 300 180">
          {bars.length ? (
            bars.map((value, index) => (
              <Rect
                key={`${value}-${index}`}
                x={index * 48 + 18}
                y={160 - (value / maximum) * 130}
                width="28"
                height={(value / maximum) * 130}
                rx="8"
                fill={COLORS.brand}
              />
            ))
          ) : (
            <Rect
              x="18"
              y="154"
              width="264"
              height="6"
              rx="3"
              fill={COLORS.border}
            />
          )}
        </Svg>
        <TextComponent
          value={
            bars.length
              ? 'Each bar is one of your recent expenses.'
              : 'Add transactions to see your spending trend.'
          }
          color={COLORS.textSecondary}
          size="Small"
        />
      </View>
      <Modal
        visible={picker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPicker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TextComponent
              value={picker === 'month' ? 'Select month' : 'Select year'}
              variant="bold"
              size="GMedium"
            />
            {(picker === 'month'
              ? months
              : [
                  new Date().getFullYear(),
                  new Date().getFullYear() - 1,
                  new Date().getFullYear() - 2,
                ]
            ).map((option, index) => (
              <MyPressable
                key={`${option}`}
                style={styles.choice}
                onPress={() => {
                  if (picker === 'month') setMonthIndex(index);
                  else setYear(option as number);
                  setPicker(null);
                }}
              >
                <TextComponent value={`${option}`} />
              </MyPressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
const Metric = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <View style={styles.metric}>
    <TextComponent value={label} color={COLORS.textSecondary} size="Small" />
    <TextComponent
      value={`₹${value.toLocaleString('en-IN')}`}
      variant="bold"
      color={color}
    />
  </View>
);
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  space: { width: 56 },
  filters: { flexDirection: 'row', gap: SPACING.sm },
  filter: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    ...SHADOWS.card,
  },
  summary: { flexDirection: 'row', gap: SPACING.sm },
  metric: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.xs,
    ...SHADOWS.card,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  choice: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});
