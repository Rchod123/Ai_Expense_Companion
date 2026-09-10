import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import MyPressable from './MyPressable';
import { heightPercentageToDP, widthPercentageToDP } from '../utils/responsive';
import { TextComponent } from './TextComp';
import { COLORS } from '../utils/colors';

type Props = {
  onPress: Function;
  value: string;
  testID?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export const LinkText: React.FC<Props> = ({
  onPress,
  value,
  testID,
  style,
  textStyle,
}) => {
  return (
    <MyPressable
      testID={testID}
      onPress={() => onPress()}
      style={style ? style : styles.rightAligntext}
    >
      <TextComponent
        color={COLORS.ink}
        style={textStyle ? textStyle : styles.textdecoration}
        value={value}
      />
    </MyPressable>
  );
};

const styles = StyleSheet.create({
  rightAligntext: {
    alignSelf: 'flex-end',
    paddingHorizontal: widthPercentageToDP(10),
    paddingVertical: heightPercentageToDP(2),
  },
  textdecoration: {
    textDecorationLine: 'underline',
  },
});
