import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Animated,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppImages } from '../../../assets';
import { Values } from '../../../types/constants';
import { heightPercentageToDP } from '../../../utils/responsive';
import {
  ButtonsIDs,
  ImageIDs,
  mainContainer,
  ScrollConatiner,
  TextConatiner,
} from '../../../types/testIds';
import { TextComponent } from '../../../components/TextComponent';
import { PrimaryButton } from '../../../components/PrimaryButtonComponent';

interface Props {
  onNextClick: () => void;
  animationController: React.RefObject<Animated.Value>;
}

const SplashMeetView: React.FC<Props> = ({
  onNextClick,
  animationController,
}) => {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const splashTranslateY = animationController.current.interpolate({
    inputRange: [0, 0.2, 0.8],
    outputRange: [0, -window.height, -window.height],
  });

  return (
    <Animated.View
      testID={mainContainer(Values.Screens.SplashMeetView)}
      accessibilityLabel={mainContainer(Values.Screens.SplashMeetView)}
      style={[styles.screen, { transform: [{ translateY: splashTranslateY }] }]}
    >
      <ScrollView
        testID={ScrollConatiner(Values.Screens.SplashMeetView)}
        accessibilityLabel={ScrollConatiner(Values.Screens.SplashMeetView)}
        style={styles.scrollView}
        alwaysBounceVertical={false}
      >
        <View>
          <Image
            testID={ImageIDs(Values.Screens.SplashMeetView)}
            accessibilityLabel={ImageIDs(Values.Screens.SplashMeetView)}
            style={[styles.image, { width: window.width }]}
            source={AppImages.meet_image}
          />
        </View>
        <TextComponent
          testID={TextConatiner(
            Values.Screens.SplashMeetView + Values.Genral.title,
          )}
          style={styles.title}
        >
          {Values.Splash.meet}
        </TextComponent>
        <TextComponent
          testID={TextConatiner(
            Values.Screens.SplashMeetView + Values.Genral.description,
          )}
          style={styles.subtitle}
        >
          {Values.Splash.meetDescription}
        </TextComponent>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 8 + insets.bottom }]}>
        <View style={styles.buttonContainer}>
          <PrimaryButton
            testID={ButtonsIDs(Values.Screens.SplashMeetView)}
            onPress={onNextClick}
            value={Values.Genral.begin}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flexGrow: 0, paddingTop: heightPercentageToDP(10) },
  image: { height: undefined, aspectRatio: 1 },
  title: {
    color: 'black',
    fontSize: 25,
    textAlign: 'center',
    fontFamily: 'WorkSans-Bold',
    paddingVertical: 8,
  },
  subtitle: {
    color: 'black',
    textAlign: 'center',
    fontFamily: 'WorkSans-Regular',
    paddingHorizontal: 24,
  },
  footer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 8,
  },
  buttonContainer: {
    borderRadius: 38,
    overflow: 'hidden',
    alignSelf: 'center',
  },
});

export default SplashMeetView;
