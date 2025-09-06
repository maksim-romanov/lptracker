import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationEventMap,
  NativeBottomTabNavigationOptions,
} from "@bottom-tabs/react-navigation";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { withUnistyles } from "react-native-unistyles";
import tinycolor from "tinycolor2";

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof BottomTabNavigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(BottomTabNavigator);

const StyledTabs = withUnistyles(Tabs, (theme) => ({
  disablePageAnimations: true,
  translucent: true,
  sidebarAdaptable: true,
  tabBarInactiveTintColor: theme.colors.outline,
  rippleColor: theme.colors.primary,
  tabBarStyle: {
    backgroundColor: tinycolor(theme.colors.background).setAlpha(0.4).toRgbString(),
  },
  tabLabelStyle: {
    fontFamily: theme.typography.variants.headline2.fontFamily,
  },
}));

export default function TabLayout() {
  return (
    <StyledTabs>
      <Tabs.Screen
        name="positions"
        options={{
          title: "Positions",
          tabBarIcon: () => ({ sfSymbol: "chart.bar.fill" }),
        }}
      />

      <Tabs.Screen
        name="wallets"
        options={{
          title: "Wallets",
          tabBarIcon: () => ({ sfSymbol: "wallet.bifold.fill" }),
        }}
      />
    </StyledTabs>
  );
}
