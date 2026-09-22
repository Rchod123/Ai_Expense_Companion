import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/fontawesome-free-solid';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import MyPressable from '../components/MyPressable';
import { TextComponent } from '../components/TextComp';
import { RootStackParamList } from '../types/types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';
import { useAuthStore } from '../store/authStore';

const options: Array<{
  label: string;
  subtitle: string;
  icon: string;
  screen:
    | 'ProfileDetails'
    | 'Security'
    | 'Devices'
    | 'Notifications'
    | 'Wearables';
}> = [
  {
    label: 'Profile',
    subtitle: 'Manage your details',
    icon: 'user-pen',
    screen: 'ProfileDetails',
  },
  {
    label: 'Security',
    subtitle: 'Biometric, app lock and password',
    icon: 'shield-halved',
    screen: 'Security',
  },
  {
    label: 'Devices',
    subtitle: 'Manage signed-in devices',
    icon: 'mobile-screen',
    screen: 'Devices',
  },
  {
    label: 'Notifications',
    subtitle: 'Alerts and reminders',
    icon: 'bell',
    screen: 'Notifications',
  },
  {
    label: 'Connect a watch',
    subtitle: 'Apple Watch, Wear OS or fitness band',
    icon: 'watch',
    screen: 'Wearables',
  },
];
export const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const confirmLogout = () =>
    Alert.alert('Log out?', 'Choose which sessions to sign out from.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'This device',
        style: 'destructive',
        onPress: async () => { await logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); },
      },
      {
        text: 'All devices',
        style: 'destructive',
        onPress: async () => { await logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); },
      },
    ]);
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <TextComponent
            testID="Profile_Title"
            value="Profile & settings"
            size="GMedium"
            variant="bold"
          />
          <View style={styles.space} />
        </View>
        <View style={styles.profile}>
          <Icon name="circle-user" size={62} color={COLORS.brandStrong} />
          <View>
            <TextComponent
              value={user?.name || 'Your companion'}
              variant="bold"
              size="MMedium"
            />
            <TextComponent
              value={user?.email || 'Manage your financial workspace'}
              size="Small"
              color={COLORS.textSecondary}
            />
          </View>
        </View>
        {options.map(option => (
          <MyPressable
            key={option.label}
            style={styles.option}
            onPress={() => navigation.navigate(option.screen)}
          >
            <Icon
              name={option.icon as any}
              size={18}
              color={COLORS.brandStrong}
            />
            <View style={styles.optionCopy}>
              <TextComponent value={option.label} variant="bold" />
              <TextComponent
                value={option.subtitle}
                size="Small"
                color={COLORS.textSecondary}
              />
            </View>
            <Icon name="chevron-right" size={14} color={COLORS.textMuted} />
          </MyPressable>
        ))}
        <MyPressable
          testID="Profile_Logout_Button"
          style={styles.logout}
          onPress={confirmLogout}
        >
          <Icon name="arrow-right-from-bracket" color={COLORS.danger} />
          <TextComponent value="Log out" color={COLORS.danger} variant="bold" />
        </MyPressable>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.backgroundColor },
  content: { padding: SPACING.lg, gap: SPACING.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  space: { width: 56 },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.brandLight,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.card,
  },
  optionCopy: { flex: 1, gap: 2 },
  logout: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
});
