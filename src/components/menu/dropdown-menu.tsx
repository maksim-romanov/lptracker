import { Text } from "react-native";

import {
  DropdownMenuRoot,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuItemTitle,
} from "./design-system/dropdown-menu";

export function DropdownMenu() {
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <Text>Open Dropdown Menu</Text>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem key="fernando rojo">
          <DropdownMenuItemTitle>Fernando Rojo</DropdownMenuItemTitle>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
