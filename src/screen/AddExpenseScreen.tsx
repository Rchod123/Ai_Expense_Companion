import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { PrimaryButton } from '../components/PrimaryButtonComponent';
import { TextComponent } from '../components/TextComp';
import CustomInput from '../components/TextInputComponet';
import { RootStackParamList } from '../types/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';
import { useExpenses } from '../zustand/store';

type AddExpenseRoute = RouteProp<RootStackParamList, 'AddExpense'>;

export const AddExpenseScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<AddExpenseRoute>();
  const addExpense = useExpenses(state => state.addExpense);
  const type = route.params?.type ?? 'spent';
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const title = type === 'received' ? 'Add income' : 'Add expense';
  const actionLabel = useMemo(
    () => `Save ${type === 'received' ? 'income' : 'expense'}`,
    [type],
  );

  const onSubmit = () => {
    const value = Number(amount);
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      !description.trim() ||
      !category.trim()
    ) {
      Alert.alert(
        'Complete the details',
        'Enter a positive amount, description, and category.',
      );
      return;
    }
    addExpense({
      id: `${Date.now()}`,
      transactionType: type,
      transactionAmount: value.toFixed(2),
      SubCategory: description.trim(),
      Category: category.trim(),
      date: new Date().toISOString(),
    });
    navigation.goBack();
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
          </View>
          <PrimaryButton
            testID="AddExpense_Save_Button"
            value={actionLabel}
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
  saveButton: { marginTop: 'auto' },
});
