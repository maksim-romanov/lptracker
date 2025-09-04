import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useStyles } from "../styles";

export const StyledExample = () => {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Пример Unistyles v3</Text>
      <Text style={styles.subtitle}>Цветовая схема Uniswap</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Акцентная кнопка</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardText}>Карточка с фоном</Text>
      </View>
    </View>
  );
};

const stylesheet = (theme: any) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  button: {
    backgroundColor: theme.colors.primary, // Updated to use primary Uniswap pink
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
  card: {
    backgroundColor: theme.colors.backgroundModule,
    padding: 16,
    borderRadius: 16, // More rounded like Uniswap
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
});
