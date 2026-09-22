export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  AddExpense: { type?: 'spent' | 'received'; expenseId?: string } | undefined;
  ExpenseDetail: { expenseId: string };
  Analytics: undefined;
  Assistant: undefined;
  Profile: undefined;
  ProfileDetails: undefined;
  Security: undefined;
  Devices: undefined;
  Notifications: undefined;
  NotificationCenter: undefined;
  Wearables: undefined;
};
