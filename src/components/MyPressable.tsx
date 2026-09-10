import React from 'react';
import { Pressable, StyleProp, ViewStyle, PressableProps } from 'react-native';
import Config from '../Config';

interface Props extends PressableProps {
  style?: StyleProp<ViewStyle>;
  touchOpacity?: number;
}

const MyPressable: React.FC<Props> = ({
  style,
  android_ripple = { color: 'lightgrey' },
  testID,
  accessibilityLabel,
  touchOpacity = 0.4,
  children,
  ...restOfProps
}) => {
  return (
    <Pressable
    {...restOfProps}
      style={({ pressed }) => [
        style,
        { opacity: !Config.isAndroid && pressed ? touchOpacity : 1 },
      ]}
      testID={testID}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? testID}
      android_ripple={android_ripple}
      
    >
      {children}
    </Pressable>
  );
};

export default MyPressable;
