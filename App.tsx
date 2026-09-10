import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./src/types/types";
import { LoginScreen } from "./src/screen/LoginScreen";
import SplashScreen from "./src/screen/splash/SplashScreen";
import { SignupScreen } from './src/screen/SignupScreen';
import { DashboardScreen } from './src/screen/DashboardScreen';
import { AddExpenseScreen } from './src/screen/AddExpenseScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  

  return(
   <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen}/>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Signup" component={SignupScreen}/>
        <Stack.Screen name="Dashboard" component={DashboardScreen}/>
        <Stack.Screen name="AddExpense" component={AddExpenseScreen}/>
      </Stack.Navigator>
   </NavigationContainer>
  )
};

export default App;
