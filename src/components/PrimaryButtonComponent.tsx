import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS } from '../utils/colors';
import MyPressable from './MyPressable';
import { TextComponent } from './TextComponent';

type Props = {
  testID: string;
  onPress: () => void;
  value: string;
  style?: StyleProp<ViewStyle>;
};

export const PrimaryButton: React.FC<Props> = ({
  style,
  testID,
  onPress,
  value,
}) => {
  return (
    <MyPressable
      style={[styles.button, style]}
      testID={testID}
      android_ripple={{ color: 'powderblue' }}
      touchOpacity={0.6}
      onPress={onPress}
    >
      <TextComponent style={styles.buttonText}>{value}</TextComponent>
    </MyPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 58,
    backgroundColor: COLORS.brandStrong,
    paddingVertical: 16,
    paddingHorizontal: 56,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
  },
  buttonText: {
    fontSize: 18,
    color: COLORS.surface,
  },
});
