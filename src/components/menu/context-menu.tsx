import React, { ReactElement } from "react";

import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemTitle,
  ContextMenuItemIcon,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuPreview,
} from "./design-system/context-menu";

interface MenuAction {
  key: string;
  label: string;
  onSelect: () => void;
  iosIconName?: string;
  androidIconName?: string;
  disabled?: boolean;
  destructive?: boolean;
}

interface MenuSection {
  label?: string;
  actions: MenuAction[];
}

interface Props {
  children: ReactElement;
  sections: MenuSection[];
  preview?: () => ReactElement;
  onOpenChange?: (open: boolean) => void;
}

export function ContextMenuButton({ children, sections, preview, onOpenChange }: Props) {
  return (
    <ContextMenuRoot onOpenChange={onOpenChange}>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        {preview && <ContextMenuPreview>{preview}</ContextMenuPreview>}

        {sections.map((section, sectionIndex) => (
          <React.Fragment key={sectionIndex}>
            {section.label && <ContextMenuLabel>{section.label}</ContextMenuLabel>}

            {section.actions.map((action) => (
              <ContextMenuItem
                key={action.key}
                onSelect={action.disabled ? undefined : action.onSelect}
                disabled={action.disabled}
                destructive={action.destructive}
              >
                <ContextMenuItemTitle>{action.label}</ContextMenuItemTitle>

                {(action.iosIconName || action.androidIconName) && (
                  <ContextMenuItemIcon iosIconName={action.iosIconName} androidIconName={action.androidIconName} />
                )}
              </ContextMenuItem>
            ))}

            {sectionIndex < sections.length - 1 && <ContextMenuSeparator />}
          </React.Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenuRoot>
  );
}
