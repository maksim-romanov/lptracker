import React from "react";

import * as Clipboard from "expo-clipboard";
import { ActivityIndicator } from "react-native";
import { Address, isAddress } from "viem";

import { AddWalletForm } from "components/form/add-wallet";

export default function NewWallet() {
  const [loading, setLoading] = React.useState(true);
  const [clipboardText, setClipboardText] = React.useState<Address | undefined>(undefined);

  React.useEffect(() => {
    Clipboard.getStringAsync().then((text) => {
      setLoading(false);
      if (isAddress(text)) setClipboardText(text as Address);
    });
  }, []);

  if (loading) return <ActivityIndicator />;
  return <AddWalletForm address={clipboardText} isEditing={false} />;
}
