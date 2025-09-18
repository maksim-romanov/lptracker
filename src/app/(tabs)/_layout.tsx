import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { withUnistyles } from "react-native-unistyles";

const StyledNativeTabs = withUnistyles(NativeTabs, (theme) => ({
  iconColor: theme.colors.primary,
}));

export default function TabLayout() {
  return (
    <StyledNativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Positions</Label>
        <Icon sf="chart.bar.fill" drawable="stat_sys_download" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="wallets">
        <Label>Wallets</Label>
        <Icon sf="wallet.bifold.fill" drawable="sym_contact_card" />
      </NativeTabs.Trigger>
    </StyledNativeTabs>
  );
}
