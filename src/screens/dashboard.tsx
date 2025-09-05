import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Block } from "../components/block";
import { Text } from "../components/typography/text";

export const Dashboard = function () {
  return (
    <View style={styles.container}>
      <Text weight="bold" style={styles.title}>
        Dashboard
      </Text>

      <Block type="surface" padding="lg" margin="md">
        <Text weight="semiBold" size="small" type="secondary">
          Пример карточки с spacing системой
        </Text>
        <Text style={styles.description}>
          Этот блок использует theme.spacing.lg для padding и theme.spacing.md для margin. Теперь spacing находится
          внутри темы и может быть разным для light/dark режимов!
        </Text>
      </Block>

      <Block type="floating" padding="xl" margin="sm">
        <Text weight="semiBold" type="accent">
          Другая карточка
        </Text>
        <Text style={styles.description}>
          Здесь используется theme.spacing.xl для padding и theme.spacing.sm для margin. Spacing система теперь часть
          темы и доступна через theme объект!
        </Text>
      </Block>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xxl, // 24px как в Uniswap
  },

  title: {
    fontSize: 28,
    marginBottom: theme.spacing.lg, // 16px
    color: theme.colors.textPrimary,
  },

  description: {
    marginTop: theme.spacing.sm, // 8px
    lineHeight: 20,
  },
}));
