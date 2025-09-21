import { useLocalSearchParams } from "expo-router";
import { Address } from "viem";

import { AddWalletForm } from "components/form/add-wallet";

export default function EditWallet() {
  const { id } = useLocalSearchParams();

  return <AddWalletForm address={id as Address} />;
}
