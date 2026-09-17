import Icon from '@react-native-vector-icons/fontawesome-free-solid';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingButton from '../components/FloatingButton';
import { ProfileHeader } from '../components/ProfileHeader';
import { TextComponent } from '../components/TextComp';
import { Expense } from '../types/expense.types';
import { RootStackParamList } from '../types/types';
import MyPressable from '../components/MyPressable';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';
import { STRINGS } from '../constants/strings';
import { BalanceCard } from './dashboard/BalanceCard';
import { SpendCard } from './dashboard/SpentCard';
import { useExpenseStore } from '../store/expenseStore';

const iconForCategory = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('food') || normalized.includes('dining'))
    return 'utensils';
  if (normalized.includes('travel') || normalized.includes('transport'))
    return 'car';
  if (normalized.includes('salary') || normalized.includes('income'))
    return 'money-bill-wave';
  return 'bag-shopping';
};

const currency = (value: string | number) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
const transactionDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(
    new Date(value),
  );

export const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const expenses = useExpenseStore(state => state.expenses);
  const spent = expenses
    .filter(item => item.transactionType === 'spent')
    .reduce((total, item) => total + item.amount, 0);
  const income = expenses
    .filter(item => item.transactionType === 'received')
    .reduce((total, item) => total + item.amount, 0);
  const balance = income - spent;

  const renderItem: ListRenderItem<Expense> = ({ item }) => {
    const isIncome = item.transactionType === 'received';
    return (
      <MyPressable
        testID={`Dashboard_Transaction_${item.id}`}
        style={styles.transaction}
        onPress={() =>
          navigation.navigate('ExpenseDetail', { expenseId: item.id })
        }
      >
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.categoryIcon,
              isIncome ? styles.incomeIcon : styles.expenseIcon,
            ]}
          >
            <Icon
              name={iconForCategory(item.category ?? '')}
              size={16}
              color={isIncome ? COLORS.success : COLORS.danger}
            />
          </View>
          <View style={styles.transactionDetails}>
            <TextComponent
              value={
                item.note || item.subCategory || item.category || 'Transaction'
              }
              variant="bold"
              size="Small"
            />
            <TextComponent
              value={`${transactionDate(item.date)} · ${
                item.category || 'Uncategorized'
              }`}
              size="ExtraSmall"
              color={COLORS.textMuted}
            />
          </View>
        </View>
        <TextComponent
          value={`${isIncome ? '+' : '-'}${currency(item.amount)}`}
          variant="bold"
          size="Small"
          color={isIncome ? COLORS.success : COLORS.textPrimary}
        />
      </MyPressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <ProfileHeader
              onProfilePress={() => navigation.navigate('Profile')}
              onNotificationPress={() =>
                navigation.navigate('NotificationCenter')
              }
            />
            <BalanceCard balance={balance} />
            <SpendCard spent={spent} income={income} />
            <View style={styles.sectionHeader}>
              <TextComponent
                testID="Dashboard_Title"
                value={STRINGS.dashboard.recentTransactions}
                variant="bold"
                size="GMedium"
              />
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="receipt" size={26} color={COLORS.brand} />
            <TextComponent
              value={STRINGS.dashboard.emptyTitle}
              variant="bold"
            />
            <TextComponent
              value={STRINGS.dashboard.emptyMessage}
              color={COLORS.textSecondary}
              size="Small"
              style={styles.emptyCopy}
            />
          </View>
        }
      />
      <FloatingButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.backgroundColor },
  content: { padding: SPACING.lg, paddingBottom: 112, gap: SPACING.sm },
  sectionHeader: { marginTop: SPACING.md, marginBottom: SPACING.xs },
  transaction: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeIcon: { backgroundColor: '#E3F5EC' },
  expenseIcon: { backgroundColor: '#FDEBE9' },
  transactionDetails: { flex: 1, marginLeft: SPACING.sm, gap: 2 },
  emptyState: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  emptyCopy: { textAlign: 'center' },
});
