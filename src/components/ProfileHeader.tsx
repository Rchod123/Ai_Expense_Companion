import FontAwesomeFreeSolid from '@react-native-vector-icons/fontawesome-free-solid';
import { StyleSheet, View } from 'react-native';
import { heightPercentageToDP } from '../utils/responsive';
import { TextComponent } from './TextComp';
import { COLORS } from '../utils/colors';
import MyPressable from './MyPressable';
import { STRINGS } from '../constants/strings';

type Props = { onProfilePress: () => void; onNotificationPress: () => void };

export const ProfileHeader = ({
  onProfilePress,
  onNotificationPress,
}: Props) => {
  return (
    <View style={styles.container}>
      <MyPressable
        testID="Dashboard_Profile_Button"
        onPress={onProfilePress}
        style={styles.profileButton}
      >
        <FontAwesomeFreeSolid
          name="circle-user"
          size={heightPercentageToDP(4)}
          color={COLORS.brandStrong}
        />
      </MyPressable>
      <TextComponent
        value={STRINGS.dashboard.title}
        variant="bold"
        size="MMedium"
      />
      <MyPressable
        testID="Dashboard_Notifications_Button"
        onPress={onNotificationPress}
        style={styles.profileButton}
      >
        <FontAwesomeFreeSolid
          name="bell"
          size={heightPercentageToDP(3)}
          color={COLORS.brandStrong}
        />
      </MyPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileButton: { padding: 2 },
});
