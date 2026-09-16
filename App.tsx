import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/types';
import { LoginScreen } from './src/screen/LoginScreen';
import SplashScreen from './src/screen/splash/SplashScreen';
import { SignupScreen } from './src/screen/SignupScreen';
import { DashboardScreen } from './src/screen/DashboardScreen';
import { AddExpenseScreen } from './src/screen/AddExpenseScreen';
import { ExpenseDetailScreen } from './src/screen/ExpenseDetailScreen';
import { AnalyticsScreen } from './src/screen/AnalyticsScreen';
import { AssistantScreen } from './src/screen/AssistantScreen';
import { ProfileScreen } from './src/screen/ProfileScreen';
import {
  DevicesScreen,
  NotificationsScreen,
  ProfileDetailsScreen,
  SecurityScreen,
  WearablesScreen,
} from './src/screen/SettingsScreens';
import { NotificationCenterScreen } from './src/screen/NotificationCenterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Assistant" component={AssistantScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="Devices" component={DevicesScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Wearables" component={WearablesScreen} />
        <Stack.Screen
          name="NotificationCenter"
          component={NotificationCenterScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
