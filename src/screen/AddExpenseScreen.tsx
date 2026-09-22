import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import MyPressable from '../components/MyPressable';
import { PrimaryButton } from '../components/PrimaryButtonComponent';
import { TextComponent } from '../components/TextComp';
import CustomInput from '../components/TextInputComponet';
import { RootStackParamList } from '../types/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';
import { useExpenseStore } from '../store/expenseStore';

type AddExpenseRoute = RouteProp<RootStackParamList, 'AddExpense'>;

const paymentMethods = ['UPI', 'Cash', 'Card', 'Bank transfer', 'Wallet'];
const today = () => new Date().toISOString().slice(0, 10);
const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

export const AddExpenseScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<AddExpenseRoute>();
  const createExpense = useExpenseStore(state => state.createExpense);
  const updateExpense = useExpenseStore(state => state.updateExpense);
  const existing = useExpenseStore(state =>
    route.params?.expenseId
      ? state.expenses.find(item => item.id === route.params?.expenseId)
      : undefined,
  );
  const type = route.params?.type ?? 'spent';
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(today);
  const [isRecurring, setIsRecurring] = useState(false);
  const [reminderDate, setReminderDate] = useState(today);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(existing);
  const transactionType = existing?.transactionType ?? type;
  useEffect(() => {
    if (!existing) return;
    setAmount(String(existing.amount));
    setDescription(existing.note ?? '');
    setCategory(existing.category ?? '');
    setMerchant(existing.merchant ?? '');
    setPaymentMethod(existing.paymentMethod ?? 'UPI');
    setDate(existing.date);
    setIsRecurring(Boolean(existing.isRecurring));
    setReminderDate(existing.reminderDate ?? today());
  }, [existing]);
  const title = isEditing
    ? transactionType === 'received' ? 'Edit income' : 'Edit expense'
    : type === 'received' ? 'Add income' : 'Add expense';
  const actionLabel = useMemo(
    () => isEditing ? 'Save changes' : `Save ${transactionType === 'received' ? 'income' : 'expense'}`,
    [isEditing, transactionType],
  );

  const onSubmit = async () => {
    const value = Number(amount);
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      !description.trim() ||
      !category.trim() ||
      !isValidDate(date) ||
      (isRecurring && !isValidDate(reminderDate))
    ) {
      Alert.alert(
        'Complete the details',
        'Add an amount, description, category, and valid dates in YYYY-MM-DD format.',
      );
      return;
    }
    try {
      setIsSaving(true);
      const input = {
        amount: value,
        currency: 'INR',
        transactionType,
        category: category.trim(),
        merchant: merchant.trim(),
        paymentMethod,
        date,
        reminderDate: isRecurring ? reminderDate : undefined,
        note: description.trim(),
        isRecurring,
      } as const;
      if (existing) await updateExpense(existing.id, input);
      else await createExpense(input);
      navigation.goBack();
    } catch {
      Alert.alert('Could not save transaction', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <BackButton
              testID="AddExpense_Back_Button"
              onPress={() => navigation.goBack()}
            />
            <TextComponent
              testID="AddExpense_Title"
              value={title}
              size="GMedium"
              variant="bold"
            />
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.intro}>
            <TextComponent
              value={
                type === 'received'
                  ? 'Keep track of every amount you earn.'
                  : 'A quick record now makes your spending clearer later.'
              }
              color={COLORS.textSecondary}
            />
          </View>
          <View style={styles.formCard}>
            <CustomInput
              value={amount}
              onChangeText={setAmount}
              name="Amount"
              testID="AddExpense_Amount_Input"
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <CustomInput
              value={description}
              onChangeText={setDescription}
              name="Description"
              testID="AddExpense_Description_Input"
              placeholder="e.g. Groceries"
            />
            <CustomInput
              value={category}
              onChangeText={setCategory}
              name="Category"
              testID="AddExpense_Category_Input"
              placeholder="e.g. Food & dining"
            />
            <CustomInput
              value={merchant}
              onChangeText={setMerchant}
              name={
                type === 'received'
                  ? 'Source (optional)'
                  : 'Merchant (optional)'
              }
              testID="AddExpense_Merchant_Input"
              placeholder={
                type === 'received' ? 'e.g. Acme Ltd.' : 'e.g. Grocery store'
              }
            />
            <CustomInput
              value={date}
              onChangeText={setDate}
              name="Transaction date"
              testID="AddExpense_Date_Input"
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.selectionCard}>
            <TextComponent value="Payment method" variant="medium" />
            <View style={styles.chips}>
              {paymentMethods.map(method => {
                const selected = paymentMethod === method;
                return (
                  <MyPressable
                    key={method}
                    testID={`AddExpense_Payment_${method.replace(/\\s/g, '_')}`}
                    onPress={() => setPaymentMethod(method)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <TextComponent
                      value={method}
                      size="Small"
                      variant={selected ? 'bold' : 'medium'}
                      color={selected ? COLORS.surface : COLORS.textSecondary}
                    />
                  </MyPressable>
                );
              })}
            </View>
          </View>
          <View style={styles.recurringCard}>
            <View style={styles.recurringCopy}>
              <TextComponent value="Recurring transaction" variant="bold" />
              <TextComponent
                value="Save a reminder date for bills, subscriptions, or regular income."
                size="Small"
                color={COLORS.textSecondary}
              />
            </View>
            <Switch
              testID="AddExpense_Recurring_Switch"
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: COLORS.border, true: COLORS.brand }}
              thumbColor={COLORS.surface}
            />
          </View>
          {isRecurring && (
            <View style={styles.formCard}>
              <CustomInput
                value={reminderDate}
                onChangeText={setReminderDate}
                name="Reminder date"
                testID="AddExpense_Reminder_Date_Input"
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
              />
            </View>
          )}
          <PrimaryButton
            testID="AddExpense_Save_Button"
            value={isSaving ? 'Saving…' : actionLabel}
            onPress={onSubmit}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: COLORS.backgroundColor },
  content: { flexGrow: 1, padding: SPACING.lg, gap: SPACING.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: { width: 56 },
  intro: { paddingHorizontal: SPACING.xs },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.sm,
    ...SHADOWS.card,
  },
  selectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  chipSelected: {
    backgroundColor: COLORS.brandStrong,
    borderColor: COLORS.brandStrong,
  },
  recurringCard: {
    backgroundColor: COLORS.brandLighter,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  recurringCopy: { flex: 1, gap: SPACING.xs },
  saveButton: { marginTop: 'auto' },
});
