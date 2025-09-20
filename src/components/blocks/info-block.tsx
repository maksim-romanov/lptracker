import { Box, Stack } from "@grapp/stacks";
import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground } from "react-native";
import { Shadow } from "react-native-shadow-2";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { Text } from "components/typography/text";

const bgBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAuQAAADACAYAAABMBnZsAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAATWSURBVHgB7d2xbQQgFAXBj2P6cP81XGOmAALrAjaZkci2gBcgWDOzBwAASPwMAACQMcgBACBkkAMAQMggBwCA0HWQfz6f3/knrVar1Wq1Wq1W+327xisrAACQcWUFAABCBjkAAIQMcgAACBnkAAAQMsgBACBkkAMAQMggBwCAkEEOAAAhgxwAAELXQe6rU61Wq9VqtVqt9k27ztkDAAAkXFkBAICQQQ4AACGDHAAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgNB1kPvqVKvVarVarVarfdOuc/YAAAAJV1YAACBkkAMAQMggBwCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIGeQAABAyyAEAIHQd5L461Wq1Wq1Wq9Vq37TrnD0AAEDClRUAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgJBBDgAAIYMcAABCBjkAAIQMcgAACF0Hua9OtVqtVqvVarXaN+06Zw8AAJBwZQUAAEIGOQAAhAxyAAAIGeQAABAyyAEAIGSQAwBAyCAHAICQQQ4AACGDHAAAQtdB7qtTrVar1Wq1Wq32TbvO2QMAACRcWQEAgJBBDgAAIYMcAABCBjkAAIQMcgAACBnkAAAQMsgBACBkkAMAQMggBwCA0HWQ++pUq9VqtVqtVqt9065z9gAAAAlXVgAAIGSQAwBAyCAHAICQQQ4AACGDHAAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgdB3kvjrVarVarVar1WrftOucPQAAQMKVFQAACBnkAAAQMsgBACBkkAMAQMggBwCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIXQe5r061Wq1Wq9Vqtdo37TpnDwAAkHBlBQAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgJBBDgAAIYMcAABC10Huq1OtVqvVarVarfZNu87ZAwAAJFxZAQCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIGeQAABAyyAEAIGSQAwBAyCAHAIDQdZD76lSr1Wq1Wq1Wq33TrnP2AAAACVdWAAAgZJADAEDIIAcAgJBBDgAAIYMcAABCBjkAAIQMcgAACBnkAAAQMsgBACB0HeS+OtVqtVqtVqvVat+065w9AABAwpUVAAAIGeQAABAyyAEAIGSQAwBAyCAHAICQQQ4AACGDHAAAQgY5AACEDHIAAAhdB7mvTrVarVar1Wq12jftOmcPAACQcGUFAABCBjkAAIQMcgAACBnkAAAQMsgBACBkkAMAQMggBwCAkEEOAAAhgxwAAELXQe6rU61Wq9VqtVqt9k27ztkDAAAkXFkBAICQQQ4AACGDHAAAQgY5AACEDHIAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgNB1kPvqVKvVarVarVarfdOuc/YAAAAJV1YAACBkkAMAQMggBwCAkEEOAAAhgxwAAEIGOQAAhAxyAAAIGeQAABAyyAEAIHQd5L461Wq1Wq1Wq9Vq37TrnD0AAEDClRUAAAgZ5AAAEDLIAQAgZJADAEDIIAcAgJBBDgAAIYMcAABCBjkAAIQMcgAACF0Hua9OtVqtVqvVarXaN+06Zw8AAJBwZQUAAEIGOQAAhAxyAAAIGeQAABAyyAEAIGSQAwBAyCAHAICQQQ4AACGDHAAAQn8TgNstrEdwkQAAAABJRU5ErkJggg==";

const UniShadow = withUnistyles(Shadow, (theme) => ({
  startColor: tinycolor(theme.colors.surfaceContainerHighest).setAlpha(0.35).toRgbString(),
  distance: 20,
  stretch: true,
}));

const UniLinearGradient = withUnistyles(LinearGradient, (theme) => ({
  colors: [theme.colors.surfaceContainerHighest, "transparent"] as const,
  locations: [0, 1] as const,
  end: { x: 0, y: 1 },
  start: { x: 1, y: 0 },
}));

type TProps = {
  title: string;
};

export const InfoBlock = function ({ title, children }: React.PropsWithChildren<TProps>) {
  return (
    <UniShadow>
      <ImageBackground source={{ uri: bgBase64 }} style={styles.wrapper}>
        <UniLinearGradient>
          <Box rowGap={2} style={styles.container}>
            <Text type="headline6">{title}</Text>

            <Text type="body2" color="onSurfaceVariant">
              {children}
            </Text>
          </Box>
        </UniLinearGradient>
      </ImageBackground>
    </UniShadow>
  );
};

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceContainer,
  },

  container: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: theme.colors.outline,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
}));
