import { useNavigation } from '@react-navigation/native';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppImages } from '../assets';
import { LinkText } from '../components/LinkTextComponent';
import { PrimaryButton } from '../components/PrimaryButtonComponent';
import { TextComponent } from '../components/TextComp';
import CustomInput from '../components/TextInputComponet';
import { COLORS, SPACING } from '../utils/colors';
import { useAuthStore } from '../store/authStore';

export const SignupScreen = () => {
  const navigation = useNavigation<any>();
  const register = useAuthStore(state => state.register);
  const loading = useAuthStore(state => state.loading);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) return Alert.alert('Complete your details', 'Enter a name, valid email, and password with at least 8 characters.');
    try {
      await register({ name: name.trim(), email: email.trim(), password, currency: 'INR' });
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (error: any) {
      Alert.alert('Could not create account', error?.response?.data?.error?.message ?? 'Check the API server and try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SafeAreaView style={styles.safeArea}>
        <Image source={AppImages.signUp_image} style={styles.image} />
        <TextComponent
          testID="Signup_Title"
          accessibilityLabel="Signup_Title"
          value="Create your account"
          size="MidSection"
          variant="bold"
        />
        <TextComponent value="Start building better money habits today." color={COLORS.textSecondary} />
        <View style={styles.form}>
          <CustomInput name="Full name" testID="Signup_Name_Input" value={name} onChangeText={setName} />
          <CustomInput name="Email" testID="Signup_Email_Input" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <CustomInput name="Password" testID="Signup_Password_Input" secureTextEntry value={password} onChangeText={setPassword} />
        </View>
        <PrimaryButton
          testID="Signup_Submit_Button"
          value={loading ? 'Creating account…' : 'Create account'}
          onPress={submit}
        />
        <TextComponent value="Already have an account?" />
        <LinkText testID="Signup_Login_Link" value="Log in" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.backgroundColor },
  content: { flexGrow: 1 },
  safeArea: { flex: 1, alignItems: 'center', padding: SPACING.lg, gap: SPACING.sm },
  image: { width: 210, height: 180, resizeMode: 'contain' },
  form: { width: '100%', alignItems: 'center', marginVertical: SPACING.sm },
});
