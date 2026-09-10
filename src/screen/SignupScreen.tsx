import { useNavigation } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppImages } from '../assets';
import { LinkText } from '../components/LinkTextComponent';
import { PrimaryButton } from '../components/PrimaryButtonComponent';
import { TextComponent } from '../components/TextComp';
import CustomInput from '../components/TextInputComponet';
import { COLORS, SPACING } from '../utils/colors';

export const SignupScreen = () => {
  const navigation = useNavigation<any>();

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
          <CustomInput name="Full name" testID="Signup_Name_Input" />
          <CustomInput name="Email" testID="Signup_Email_Input" keyboardType="email-address" />
          <CustomInput name="Password" testID="Signup_Password_Input" secureTextEntry />
        </View>
        <PrimaryButton
          testID="Signup_Submit_Button"
          value="Create account"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] })}
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
