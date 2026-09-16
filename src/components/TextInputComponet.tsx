import React from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { TextComponent } from './TextComp';
import FontAwesome6 from '@react-native-vector-icons/fontawesome-free-solid';
import { heightPercentageToDP, widthPercentageToDP } from '../utils/responsive';
import { COLORS, RADIUS, SHADOWS } from '../utils/colors';
import MyPressable from './MyPressable';

const styles = StyleSheet.create({
  labelContainer: {
    paddingTop: heightPercentageToDP(2),
    marginHorizontal: widthPercentageToDP(2),
    marginBottom: heightPercentageToDP(0.8),
  },
  inputContainer: {
    minHeight: heightPercentageToDP(6.5),
    width: '100%',
    backgroundColor: COLORS.surface,
    marginVertical: heightPercentageToDP(0.8),
    borderRadius: RADIUS.lg,
    paddingHorizontal: widthPercentageToDP(4),
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  right: {
    minWidth: 32,
    minHeight: 32,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  keyboardContainer: {
    width: '100%',
    paddingHorizontal: widthPercentageToDP(4),
  },
  dottedInput: { borderStyle: 'dotted' },
  dashedInput: { borderStyle: 'dashed' },
});

export const BasicSkeleton: React.FC<{
  children: React.ReactNode;
  name: string;
  type?: 'dotted' | 'dashed';
}> = ({ children, name, type = 'dotted' }) => {
  return (
    <>
      <View style={styles.labelContainer}>
        <TextComponent value={name} variant="medium" />
      </View>
      <View
        style={[
          styles.inputContainer,
          type === 'dashed' ? styles.dashedInput : styles.dottedInput,
        ]}
      >
        {children}
      </View>
    </>
  );
};

type InputProps = {
  name: string;
  rightType?: 'icon' | 'text';
  buttonTestID?: string;
  testID?: string;
  rightValue?: string;
  onRightPress?: () => void;
};

export const CustomInput: React.FC<
  InputProps & React.ComponentProps<typeof TextInput>
> = ({
  name,
  rightType = 'text',
  buttonTestID,
  testID,
  rightValue,
  onRightPress,
  ...props
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <BasicSkeleton name={name}>
        <View style={styles.row}>
          <TextInput
            {...props}
            returnKeyType="done"
            testID={testID}
            placeholderTextColor={COLORS.textMuted}
            style={styles.textInput}
          />
          {rightValue && (
            <MyPressable
              testID={buttonTestID}
              onPress={onRightPress}
              style={styles.right}
            >
              {rightType === 'icon' ? (
                <FontAwesome6
                  name={rightValue as any}
                  size={heightPercentageToDP(2)}
                  color={COLORS.textMuted}
                />
              ) : (
                <TextComponent value={rightValue} />
              )}
            </MyPressable>
          )}
        </View>
      </BasicSkeleton>
    </KeyboardAvoidingView>
  );
};

export default CustomInput;
