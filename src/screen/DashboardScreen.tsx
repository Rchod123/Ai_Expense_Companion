import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButtonComponent';
import { TextComponent } from '../components/TextComp';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';

export const DashboardScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SafeAreaView style={styles.safeArea}>
        <TextComponent testID="Dashboard_Title" accessibilityLabel="Dashboard_Title" value="Your money, at a glance" size="MidSection" variant="bold" />
        <View testID="Dashboard_Balance_Card" accessibilityLabel="Dashboard_Balance_Card" style={styles.balanceCard}>
          <TextComponent value="Available this month" color={COLORS.surfaceMuted} />
          <TextComponent value="₹ 24,500" size="Large" variant="bold" color={COLORS.surface} />
          <TextComponent value="On track with your budget" color={COLORS.brandLight} />
        </View>
        <View style={styles.card}>
          <TextComponent value="AI insight" size="GMedium" variant="bold" />
          <TextComponent value="Food spending is 12% lower than last month. Nice work!" color={COLORS.textSecondary} />
        </View>
        <View style={styles.card}>
          <TextComponent value="Recent activity" size="GMedium" variant="bold" />
          <TextComponent value="No expenses added yet." color={COLORS.textSecondary} />
        </View>
        <PrimaryButton testID="Dashboard_AddExpense_Button" value="Add an expense" onPress={() => navigation.navigate('AddExpense')} />
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.backgroundColor },
  content: { flexGrow: 1 },
  safeArea: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  balanceCard: { backgroundColor: COLORS.brandStrong, borderRadius: RADIUS.xl, padding: SPACING.xl, gap: SPACING.xs, ...SHADOWS.card },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.xs, ...SHADOWS.card },
});
