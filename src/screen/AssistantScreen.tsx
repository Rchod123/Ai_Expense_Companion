import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/fontawesome-free-solid';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import MyPressable from '../components/MyPressable';
import { TextComponent } from '../components/TextComp';
import { RootStackParamList } from '../types/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';
import { useExpenses } from '../zustand/store';

export const AssistantScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const expenses = useExpenses(state => state.expenses);
  const [question, setQuestion] = useState('');
  const [isListening, setListening] = useState(false);
  const [reply, setReply] = useState(
    'Ask about your spending, income, or say “add an expense”.',
  );
  const ask = () => {
    const spent = expenses
      .filter(item => item.transactionType === 'spent')
      .reduce((sum, item) => sum + Number(item.transactionAmount), 0);
    if (question.toLowerCase().includes('add')) {
      navigation.navigate('AddExpense', {
        type: question.toLowerCase().includes('income') ? 'received' : 'spent',
      });
      return;
    }
    setReply(
      expenses.length
        ? `You have recorded ₹${spent.toLocaleString(
            'en-IN',
          )} in expenses. Try “add an expense” to record another one.`
        : 'There are no transactions yet. Say “add an expense” to get started.',
    );
  };
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <TextComponent
          testID="Assistant_Title"
          value="Expense assistant"
          size="GMedium"
          variant="bold"
        />
        <View style={styles.space} />
      </View>
      <View style={styles.reply}>
        <Icon name="wand-magic-sparkles" size={20} color={COLORS.brandStrong} />
        <TextComponent value={reply} style={styles.replyText} />
      </View>
      <View style={styles.listening}>
        <MyPressable
          testID="Assistant_Voice_Button"
          style={[styles.mic, isListening && styles.listeningMic]}
          onPress={() => setListening(value => !value)}
        >
          <Icon name="microphone" size={30} color={COLORS.surface} />
        </MyPressable>
        <TextComponent
          value={isListening ? 'Listening…' : 'Tap to speak'}
          variant="bold"
        />
        <TextComponent
          value="Voice capture requires microphone permission and speech-to-text setup."
          size="Small"
          color={COLORS.textSecondary}
          style={styles.center}
        />
      </View>
      <View style={styles.inputRow}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask about your expenses"
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          onSubmitEditing={ask}
        />
        <MyPressable
          testID="Assistant_Send_Button"
          onPress={ask}
          style={styles.send}
        >
          <Icon name="arrow-up" color={COLORS.surface} />
        </MyPressable>
      </View>
    </SafeAreaView>
  );
};
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
  reply: {
    backgroundColor: COLORS.brandLight,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  replyText: { lineHeight: 22 },
  listening: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  mic: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.brandStrong,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  listeningMic: { backgroundColor: COLORS.danger },
  center: { textAlign: 'center' },
  inputRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    padding: SPACING.xs,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  input: { flex: 1, paddingHorizontal: SPACING.sm, color: COLORS.textPrimary },
  send: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.brandStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
