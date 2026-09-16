import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/fontawesome-free-solid';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { TextComponent } from '../components/TextComp';
import { STRINGS } from '../constants/strings';
import { RootStackParamList } from '../types/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';
import { useExpenses } from '../zustand/store';

export const NotificationCenterScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const hasTransactions = useExpenses(state => state.expenses.length > 0);
  const notices = hasTransactions
    ? [
        {
          icon: 'chart-line',
          title: STRINGS.notifications.monthlyReview,
          text: STRINGS.notifications.monthlyReviewText,
        },
        {
          icon: 'clock',
          title: STRINGS.notifications.reminder,
          text: STRINGS.notifications.reminderText,
        },
      ]
    : [];
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
          <View key={notice.title} style={styles.notice}>
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
