import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export const Header = () => <View style={styles.header} />;

const styles = StyleSheet.create((theme, rt) => ({
  header: {
    height: rt.insets.top,
  },
}));
