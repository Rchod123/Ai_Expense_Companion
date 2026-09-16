import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/BackButton';
import MyPressable from '../components/MyPressable';
import { PrimaryButton } from '../components/PrimaryButtonComponent';
import { TextComponent } from '../components/TextComp';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/colors';

const Layout = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <TextComponent value={title} size="GMedium" variant="bold" />
          <View style={styles.space} />
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};
const Toggle = ({
  label,
  note,
  value,
  onChange,
}: {
  label: string;
  note: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) => (
  <View style={styles.row}>
    <View style={styles.copy}>
      <TextComponent value={label} variant="bold" />
      <TextComponent value={note} size="Small" color={COLORS.textSecondary} />
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ true: COLORS.brand }}
    />
  </View>
);
const Input = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <View style={styles.field}>
    <TextComponent value={label} size="Small" color={COLORS.textSecondary} />
    <TextInput value={value} onChangeText={onChange} style={styles.input} />
  </View>
);

export const ProfileDetailsScreen = () => {
  const [nickname, setNickname] = useState('Your companion');
  const [email, setEmail] = useState('you@example.com');
  const [mobile, setMobile] = useState('');
  return (
    <Layout title="Manage profile">
      <View style={styles.avatar}>
        <TextComponent
          value="YC"
          variant="bold"
          size="MMedium"
          color={COLORS.surface}
        />
      </View>
      <MyPressable
        style={styles.photoButton}
        onPress={() =>
          Alert.alert(
            'Profile photo',
            'Connect an image picker to select a profile photo.',
          )
        }
      >
        <TextComponent
          value="Change profile picture"
          color={COLORS.brandStrong}
          variant="bold"
        />
      </MyPressable>
      <Input label="Nickname" value={nickname} onChange={setNickname} />
      <Input label="Email" value={email} onChange={setEmail} />
      <Input label="Mobile number" value={mobile} onChange={setMobile} />
      <PrimaryButton
        testID="Profile_Save_Button"
        value="Save changes"
        onPress={() =>
          Alert.alert('Saved', 'Your profile details have been updated.')
        }
      />
    </Layout>
  );
};
export const SecurityScreen = () => {
  const [biometric, setBiometric] = useState(false);
  const [appLock, setAppLock] = useState(false);
  const [autoLock, setAutoLock] = useState(true);
  return (
    <Layout title="Security">
      <Toggle
        label="Biometric unlock"
        note="Use Face ID, Touch ID, or fingerprint"
        value={biometric}
        onChange={setBiometric}
      />
      <Toggle
        label="App lock"
        note="Require unlock before opening the app"
        value={appLock}
        onChange={setAppLock}
      />
      <Toggle
        label="Auto lock"
        note="Lock the app after inactivity"
        value={autoLock}
        onChange={setAutoLock}
      />
      <MyPressable
        style={styles.action}
        onPress={() =>
          Alert.alert(
            'Change password',
            'Connect this action to your authentication provider.',
          )
        }
      >
        <TextComponent
          value="Change password"
          variant="bold"
          color={COLORS.brandStrong}
        />
      </MyPressable>
    </Layout>
  );
};
export const DevicesScreen = () => {
  const [password, setPassword] = useState('');
  const [devices, setDevices] = useState([
    'This iPhone · Active now',
    'MacBook Pro · 2 days ago',
  ]);
  const logout = (device: string) => {
    if (!password)
      return Alert.alert(
        'Password required',
        'Enter your password before signing out a device.',
      );
    setDevices(items => items.filter(item => item !== device));
    setPassword('');
  };
  return (
    <Layout title="Signed-in devices">
      <TextComponent
        value="Enter your password to force a device to sign out."
        color={COLORS.textSecondary}
        size="Small"
      />
      <Input label="Current password" value={password} onChange={setPassword} />
      {devices.map(device => (
        <View key={device} style={styles.row}>
          <TextComponent value={device} style={styles.copy} />
          <MyPressable
            style={styles.deviceLogout}
            onPress={() => logout(device)}
          >
            <TextComponent
              value="Sign out"
              color={COLORS.danger}
              size="Small"
              variant="bold"
            />
          </MyPressable>
        </View>
      ))}
    </Layout>
  );
};
export const NotificationsScreen = () => {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [reminders, setReminders] = useState(true);
  return (
    <Layout title="Notifications">
      <Toggle
        label="Push notifications"
        note="Transaction and budget alerts"
        value={push}
        onChange={setPush}
      />
      <Toggle
        label="Email notifications"
        note="Monthly summaries and account activity"
        value={email}
        onChange={setEmail}
      />
      <Toggle
        label="Payment reminders"
        note="Reminders for recurring expenses"
        value={reminders}
        onChange={setReminders}
      />
    </Layout>
  );
};
export const WearablesScreen = () => {
  const [connected, setConnected] = useState(false);
  return (
    <Layout title="Connect a watch">
      <TextComponent
        value="See quick balances and get spending alerts on your wrist."
        color={COLORS.textSecondary}
      />
      <View style={styles.wearable}>
        <TextComponent
          value={connected ? 'Watch connected' : 'No watch connected'}
          variant="bold"
          size="MMedium"
        />
        <TextComponent
          value={
            connected
              ? 'Sync is ready for your wearable.'
              : 'Apple Watch, Wear OS, and compatible fitness bands are supported after native integration.'
          }
          color={COLORS.textSecondary}
          size="Small"
        />
      </View>
      <PrimaryButton
        testID="Wearable_Connect_Button"
        value={connected ? 'Disconnect watch' : 'Connect a watch'}
        onPress={() => setConnected(value => !value)}
      />
    </Layout>
  );
};
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.backgroundColor },
  content: { padding: SPACING.lg, gap: SPACING.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  space: { width: 56 },
  row: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  copy: { flex: 1, gap: 2 },
  field: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.xs,
    ...SHADOWS.card,
  },
  input: { padding: 0, color: COLORS.textPrimary, fontSize: 16 },
  avatar: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.brandStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButton: { alignSelf: 'center', padding: SPACING.sm },
  action: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.card,
  },
  deviceLogout: { padding: SPACING.xs },
  wearable: {
    backgroundColor: COLORS.brandLight,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
});
