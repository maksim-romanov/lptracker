import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <View>This is a modal</View>

      <Link href="/" dismissTo style={styles.link}>
        <View>Go to home screen</View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
