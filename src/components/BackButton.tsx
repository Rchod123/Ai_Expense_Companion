import { StyleSheet } from 'react-native';
import MyPressable from './MyPressable';
import Icon from '@react-native-vector-icons/material-icons';

type Props = {
  onPress: Function;
  testID?: string;
};

export const BackButton: React.FC<Props> = ({
  onPress,
  testID = 'Back_Button',
}) => {
  return (
    <MyPressable
      testID={testID}
      style={styles.backBtn}
      android_ripple={{ color: 'darkgrey', borderless: true, radius: 28 }}
      onPress={() => onPress()}
    >
      <Icon name="arrow-back-ios" size={24} color="black" />
    </MyPressable>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    width: 56,
    height: 56,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
