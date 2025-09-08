import { useMemo } from "react";

import { addressesStore, AddressesStore } from "../presentation/stores/addresses-store";

export const useAddressesStore = (): AddressesStore => {
  return useMemo(() => addressesStore, []);
};
