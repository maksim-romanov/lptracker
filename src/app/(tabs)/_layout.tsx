import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationEventMap,
  NativeBottomTabNavigationOptions,
} from "@bottom-tabs/react-navigation";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import { withUnistyles } from "react-native-unistyles";

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof BottomTabNavigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(BottomTabNavigator);

const StyledTabs = withUnistyles(Tabs, (theme) => ({
  tabBarInactiveTintColor: theme.colors.outline,
  disablePageAnimations: true,
  tabBarStyle: {
    backgroundColor: theme.colors.background,
  },
}));

export default function TabLayout() {
  return (
    <StyledTabs>
      <Tabs.Screen
        name="index"
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
