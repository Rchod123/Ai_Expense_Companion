import { ButtonsIDs } from '../types/testIds';
import { Values } from '../types/constants';
import CustomInput from '../components/TextInputComponet';
import {
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppImages } from '../assets';
import { heightPercentageToDP, widthPercentageToDP } from '../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/colors';
import { PrimaryButton } from '../components/PrimaryButtonComponent';
import { LinkText } from '../components/LinkTextComponent';
import { TextComponent } from '../components/TextComp';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={{ backgroundColor: COLORS.backgroundColor, flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, alignItems: 'center' }}
      >
        <Image
          source={AppImages.moscot_image}
          style={{
            width: widthPercentageToDP(100),
            height: heightPercentageToDP(35),
          }}
        />
        <TextComponent
          testID="Login_Title"
          accessibilityLabel="Login_Title"
          value="Welcome back"
          size="MidSection"
          variant="bold"
        />
        <CustomInput name="Email" testID="Login_Email_Input" keyboardType="email-address" />
        <CustomInput name="Password" testID="Login_Password_Input" secureTextEntry />

        <LinkText testID="Login_ForgotPassword_Link" onPress={() => {}} value="Forgot password?" />

        <PrimaryButton
          testID={ButtonsIDs(Values.Screens.LoginScreen)}
          onPress={() => navigation.navigate('Dashboard')}
          value="Login"
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
