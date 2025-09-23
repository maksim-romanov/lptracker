import numbro from "numbro";
import { withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";
import { arbitrum } from "viem/chains";

import { ChainId } from "domain/entities/blockchain";

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

export const WarningTag = withUnistyles(Tag, (theme) => ({
  colors: {
    surface: theme.colors.warningContainer,
    onSurface: theme.colors.onWarningContainer,
    outline: theme.colors.warningContainerVariant,
    shadow: theme.colors.warningContainer,
  },
}));

export const ChainTag = function ({ chainId }: { chainId: ChainId }) {
  if (chainId === arbitrum.id) {
    return <AdaptiveTag color="#28A0F0">ARB</AdaptiveTag>;
  }

  return null;
};

export const InRangeTag = function ({ inRange }: { inRange: boolean }) {
  if (inRange) return <SuccessTag glow>In Range</SuccessTag>;
  return <WarningTag glow>Out of Range</WarningTag>;
};

export const ProtocolTag = function ({ protocol }: { protocol: string }) {
  if (protocol === "uniswap-v3") return <SecondaryTag glow>V3</SecondaryTag>;
  if (protocol === "uniswap-v4") return <PrimaryTag glow>V4</PrimaryTag>;
  return <WarningTag glow>??</WarningTag>;
};

export const FeeBpsTag = function ({ feeBps }: { feeBps: number }) {
  return (
    <SecondaryTag>
      {numbro(feeBps / 1_000_000).format({
        output: "percent",
        mantissa: 2,
        trimMantissa: true,
        spaceSeparated: false,
      })}
    </SecondaryTag>
  );
};
