import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/fontawesome-free-solid';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { TextComponent } from '../components/TextComp';
import { RootStackParamList } from '../types/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';
import { useExpenseStore } from '../store/expenseStore';
import { PrimaryButton } from '../components/PrimaryButtonComponent';

export const ExpenseDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ExpenseDetail'>>();
  const expense = useExpenseStore(state =>
    state.expenses.find(item => item.id === route.params.expenseId),
  );
  const deleteExpense = useExpenseStore(state => state.deleteExpense);
  if (!expense)
    return (
      <SafeAreaView style={styles.screen}>
        <BackButton onPress={() => navigation.goBack()} />
        <TextComponent value="Transaction not found" variant="bold" />
      </SafeAreaView>
    );
  const isIncome = expense.transactionType === 'received';
  const amount = `₹${expense.amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
  const confirmDelete = () => Alert.alert(
    'Delete transaction?',
    'This transaction will be removed from this device and the connected account.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteExpense(expense.id); navigation.goBack(); }
        catch { Alert.alert('Could not delete transaction', 'Please try again.'); }
      } },
    ],
  );
  return (
    <ScrollView>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <TextComponent
            value={
              expense.note ||
              expense.subCategory ||
              expense.category ||
              'Transaction'
            }
            size="MidSection"
            variant="bold"
            style={styles.center}
          />
        </View>

        <View style={[styles.icon, isIncome ? styles.income : styles.expense]}>
          <Icon
            name={isIncome ? 'arrow-trend-up' : 'receipt'}
            size={26}
            color={isIncome ? COLORS.success : COLORS.danger}
          />
        </View>

        <TextComponent
          value={`${isIncome ? '+' : '-'}${amount}`}
          size="MidSection"
          variant="bold"
          color={isIncome ? COLORS.success : COLORS.textPrimary}
          style={styles.center}
        />
        <View style={styles.card}>
          <Detail
            label="Transaction type"
            value={isIncome ? 'Income' : 'Expense'}
          />
          <Detail
            label="Category"
            value={expense.category || 'Uncategorized'}
          />
          <Detail
            label="Payment method"
            value={expense.paymentMethod || 'Not specified'}
          />
          {expense.merchant ? (
            <Detail label="Merchant / source" value={expense.merchant} />
          ) : null}
          {expense.isRecurring ? (
            <Detail
              label="Recurring reminder"
              value={expense.reminderDate || 'Recurring transaction'}
            />
          ) : null}
          <Detail
            label="Transaction date"
            value={new Date(expense.date).toLocaleString('en-IN', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          />
          <Detail label="Reference" value={`#${expense.id.slice(-8)}`} />
        </View>
        <PrimaryButton
          testID="ExpenseDetail_Edit_Button"
          value="Edit transaction"
          onPress={() => navigation.navigate('AddExpense', { expenseId: expense.id, type: expense.transactionType })}
        />
        <PrimaryButton
          testID="ExpenseDetail_Delete_Button"
          value="Delete transaction"
          onPress={confirmDelete}
          style={styles.deleteButton}
        />
      </SafeAreaView>
    </ScrollView>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detail}>
    <TextComponent value={label} color={COLORS.textSecondary} size="Small" />
    <TextComponent
      value={value}
      variant="medium"
      size="Small"
      style={styles.detailValue}
    />
  </View>
);
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  center: { textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center' },
  icon: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  income: { backgroundColor: '#E3F5EC' },
  expense: { backgroundColor: '#FDEBE9' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.card,
  },
  detail: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.xs,
  },
  detailValue: { textAlign: 'right' },
  deleteButton: { backgroundColor: COLORS.danger, marginBottom: SPACING.xl },
});
