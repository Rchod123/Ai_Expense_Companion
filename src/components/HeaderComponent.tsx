import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome-free-solid';
import { TextComponent } from './TextComp';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../utils/colors';
import { heightPercentageToDP, widthPercentageToDP } from '../utils/responsive';
import { BackButton } from './BackButton';
import { GenralContainer } from '../types/testIds';

const styles = StyleSheet.create({
  radius: {
    height: heightPercentageToDP(7.5),
    borderTopLeftRadius: heightPercentageToDP(3),
    borderTopRightRadius: heightPercentageToDP(3),
  },
  container: {
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    alignItems: 'center',

    zIndex: 1,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: widthPercentageToDP(2),
  },
  iconPlaceholder: { width: 42, height: 42 },
});

const Icon = ({
  name,
  size,
}: {
  name: 'chevron-left' | 'ellipsis';
  size: number;
}) => (
  <FontAwesome6 name={name} color={'white'} size={heightPercentageToDP(size)} />
);

type ScreenHeaderProps = {
  value: string;
  onPress?: () => void;
  iconName?: 'ellipsis';
  required?: boolean;
  showBackButton?: boolean;
};

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  value,
  iconName,
  onPress,
  required = false,
  showBackButton = true,
}) => {
  const navigation = useNavigation();
  const onBackClick = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: COLORS.backgroundColor }]}
    >
      <View style={styles.row}>
        {showBackButton ? (
          <BackButton
            testID={GenralContainer('Header_Back')}
            onPress={onBackClick}
          />
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
        <View style={styles.titleWrap}>
          <TextComponent
            value={value}
            color={COLORS.surface}
            size="MMedium"
            variant="bold"
          />
        </View>
        {iconName || onPress ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onPress}
            style={styles.iconButton}
          >
            {iconName && <Icon name={iconName} size={3} />}
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
      {required && (
        <View style={[styles.radius, { backgroundColor: COLORS.surface }]} />
      )}
    </SafeAreaView>
  );
};

export default ScreenHeader;
