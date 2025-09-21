import React from "react";

import { Address } from "viem";

import { AddWalletForm } from "components/form/add-wallet";
import { clipboardStore } from "presentation/stores/clipboard-store";
import { walletsStore } from "presentation/stores/wallets-store";

export default function NewWallet() {
  const [clipboardAddress, setClipboardAddress] = React.useState<Address | undefined>(undefined);

  React.useEffect(() => {
    const checkClipboard = async () => {
      const address = await clipboardStore.getClipboardAddress();
      if (address && walletsStore.isExistingWallet(address)) return;
      setClipboardAddress(address || undefined);
    };

    checkClipboard();
  }, []);

  return <AddWalletForm address={clipboardAddress} isEditing={false} />;
}
