import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/fontawesome-free-solid';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { TextComponent } from '../components/TextComp';
import { STRINGS } from '../constants/strings';
import { RootStackParamList } from '../types/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';
import { useExpenseStore } from '../store/expenseStore';

export const NotificationCenterScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const expenses = useExpenseStore(state => state.expenses);
  const reminders = expenses
    .filter(expense => expense.isRecurring && expense.reminderDate)
    .sort((first, second) =>
      (first.reminderDate ?? '').localeCompare(second.reminderDate ?? ''),
    );
  const notices = [
    ...reminders.map(expense => ({
      id: expense.id,
      icon: 'clock',
      title: `Recurring reminder: ${
        expense.note || expense.category || 'Transaction'
      }`,
      text: `Scheduled for ${new Date(
        `${expense.reminderDate}T12:00:00`,
      ).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}.`,
    })),
    ...(expenses.length
      ? [
          {
            id: 'monthly-review',
            icon: 'chart-line',
            title: STRINGS.notifications.monthlyReview,
            text: STRINGS.notifications.monthlyReviewText,
          },
        ]
      : []),
  ];
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <TextComponent
          testID="NotificationCenter_Title"
          value={STRINGS.notifications.title}
          size="GMedium"
          variant="bold"
        />
        <View style={styles.spacer} />
      </View>
      {notices.length ? (
        notices.map(notice => (
          <View key={notice.id} style={styles.notice}>
            <View style={styles.icon}>
              <Icon name={notice.icon as any} color={COLORS.brandStrong} />
            </View>
            <View style={styles.copy}>
              <TextComponent value={notice.title} variant="bold" />
              <TextComponent
                value={notice.text}
                size="Small"
                color={COLORS.textSecondary}
              />
            </View>
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Icon name="bell-slash" size={28} color={COLORS.brand} />
          <TextComponent
            value={STRINGS.notifications.emptyTitle}
            variant="bold"
          />
          <TextComponent
            value={STRINGS.notifications.emptyMessage}
            color={COLORS.textSecondary}
            size="Small"
            style={styles.center}
          />
        </View>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  spacer: { width: 56 },
  notice: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 4 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  center: { textAlign: 'center' },
});
