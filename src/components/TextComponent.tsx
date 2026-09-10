import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
} from 'react-native';

export type TextComponentProps = RNTextProps & {
  style?: StyleProp<TextStyle>;
};

export const TextComponent: React.FC<TextComponentProps> = ({
  style,
  testID,
  ...props
}) => (
  <RNText
    testID={testID}
    accessible={true}
    accessibilityLabel={testID}
    {...props}
    style={[style]}
  />
);

TextComponent.displayName = 'TextComponent';
