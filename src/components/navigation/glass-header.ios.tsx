import { GlassView } from "expo-glass-effect";
import { StyleSheet } from "react-native-unistyles";

export const Header = () => <GlassView style={styles.header} />;

const styles = StyleSheet.create((theme, rt) => ({
  header: {
    height: rt.insets.top,
  },
}));
