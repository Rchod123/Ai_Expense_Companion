import { StyleSheet, ViewStyle } from 'react-native';
import MyPressable from './MyPressable';
import { TextComponent } from './TextComponent';
import { widthPercentageToDP } from '../utils/responsive';

type Props = {
  
  testID: string;
  onPress: Function;
  value: string;
  style?: ViewStyle;
};

export const PrimaryButton: React.FC<Props> = ({ style, testID, onPress,value }) => {
  return (
    <MyPressable
      style={style ? style: styles.button}
      testID={testID}
      android_ripple={{ color: 'powderblue' }}
      touchOpacity={0.6}
      onPress={() => onPress()}
    >
      <TextComponent style={styles.buttonText}>
        {value}
      </TextComponent>
    </MyPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 58,
    backgroundColor: 'rgb(21, 32, 54)',
    paddingVertical: 16,
    paddingHorizontal: 56,
    borderRadius: widthPercentageToDP(5),
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'WorkSans-Regular',
    color: 'white',
  },
});
