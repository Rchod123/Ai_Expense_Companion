import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import { PrimaryButton } from '../components/PrimaryButtonComponent';
import { TextComponent } from '../components/TextComp';
import CustomInput from '../components/TextInputComponet';
import { COLORS, SPACING } from '../utils/colors';

export const AddExpenseScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton testID="AddExpense_Back_Button" onPress={() => navigation.goBack()} />
          <TextComponent testID="AddExpense_Title" accessibilityLabel="AddExpense_Title" value="Add expense" size="GMedium" variant="bold" />
          <View style={styles.placeholder} />
        </View>
        <TextComponent value="Record it now — it will be ready to sync when you're online." color={COLORS.textSecondary} />
        <CustomInput name="Amount" testID="AddExpense_Amount_Input" keyboardType="decimal-pad" placeholder="0.00" />
        <CustomInput name="Description" testID="AddExpense_Description_Input" placeholder="e.g. Groceries" />
        <CustomInput name="Category" testID="AddExpense_Category_Input" placeholder="Food & dining" />
        <PrimaryButton testID="AddExpense_Save_Button" value="Save expense" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.backgroundColor },
  content: { flexGrow: 1 },
  safeArea: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  placeholder: { width: 56 },
});
