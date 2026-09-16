import { ActivityIndicator, StyleSheet, View } from 'react-native';

type Props = {
  isLoading: boolean;
};

export const Loader: React.FC<Props> = ({ isLoading }) => {
  return (
    isLoading && (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    )
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
