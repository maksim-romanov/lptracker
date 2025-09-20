import { withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { Tag, TProps } from "./tag";

export const AdaptiveTag = function ({
  children,
  color,
  rounded,
  style,
}: React.PropsWithChildren<Omit<TProps, "colors"> & { color: string }>) {
  const colors = {
    surface: tinycolor(color).setAlpha(0.2).toRgbString(),
    onSurface: color,
    outline: tinycolor(color).setAlpha(0.1).toRgbString(),
    shadow: tinycolor(color).setAlpha(0.2).toRgbString(),
  };

  return (
    <Tag colors={colors} rounded={rounded} style={style}>
      {children}
    </Tag>
  );
};

export const SuccessTag = withUnistyles(Tag, (theme) => ({
  colors: {
    surface: theme.colors.successContainer,
    onSurface: theme.colors.onSuccessContainer,
    outline: theme.colors.successContainerVariant,
    shadow: theme.colors.successContainer,
  },
}));

export const PrimaryTag = withUnistyles(Tag, (theme) => ({
  colors: {
    surface: theme.colors.primaryContainer,
    onSurface: theme.colors.onPrimaryContainer,
    outline: theme.colors.primaryContainerVariant,
    shadow: theme.colors.primaryContainer,
  },
}));

export const SecondaryTag = withUnistyles(Tag, (theme) => ({
  colors: {
    surface: theme.colors.secondaryContainer,
    onSurface: theme.colors.onSecondaryContainer,
    outline: theme.colors.secondaryContainerVariant,
    shadow: theme.colors.secondaryContainer,
  },
}));

export const TertiaryTag = withUnistyles(Tag, (theme) => ({
  colors: {
    surface: theme.colors.tertiaryContainer,
    onSurface: theme.colors.onTertiaryContainer,
    outline: theme.colors.tertiaryContainerVariant,
    shadow: theme.colors.tertiaryContainer,
  },
}));
