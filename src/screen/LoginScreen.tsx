import { ButtonsIDs } from '../types/testIds';
import { Values } from '../types/constants';
import CustomInput from '../components/TextInputComponet';
import { Alert, Image, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AppImages } from '../assets';
import { heightPercentageToDP, widthPercentageToDP } from '../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/colors';
import { PrimaryButton } from '../components/PrimaryButtonComponent';
import { LinkText } from '../components/LinkTextComponent';
import { TextComponent } from '../components/TextComp';
import { useAuthStore } from '../store/authStore';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const login = useAuthStore(state => state.login);
  const loading = useAuthStore(state => state.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = async () => {
    if (!email.trim() || !password) return Alert.alert('Enter your details', 'Email and password are required.');
    try {
      await login(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (error: any) {
      Alert.alert('Could not sign in', error?.response?.data?.error?.message ?? 'Check the API server and try again.');
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView style={styles.safeArea}>
        <Image source={AppImages.moscot_image} style={styles.image} />
        <TextComponent
          testID="Login_Title"
          accessibilityLabel="Login_Title"
          value="Welcome back"
          size="MidSection"
          variant="bold"
        />
        <CustomInput
          name="Email"
          testID="Login_Email_Input"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <CustomInput
          name="Password"
          testID="Login_Password_Input"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <LinkText
          testID="Login_ForgotPassword_Link"
          onPress={() => {}}
          value="Forgot password?"
        />

        <PrimaryButton
          testID={ButtonsIDs(Values.Screens.LoginScreen)}
          onPress={submit}
          value={loading ? 'Logging in…' : 'Login'}
        />
        <TextComponent value="Don't have an account?" />
        <LinkText
          testID="Login_Signup_Link"
          onPress={() => navigation.navigate('Signup')}
          value={Values.Button.signup}
        />
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.backgroundColor },
  content: { flexGrow: 1 },
  safeArea: { flex: 1, alignItems: 'center' },
  image: {
    width: widthPercentageToDP(100),
    height: heightPercentageToDP(35),
    resizeMode: 'contain',
  },
});
