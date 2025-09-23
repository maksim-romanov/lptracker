import type { ComponentType } from "react";

import type { PositionData } from "./types";

interface PositionCardProps {
  data: PositionData;
}

type PositionCardComponent = ComponentType<PositionCardProps>;

class PositionCardRegistry {
  private cards = new Map<string, PositionCardComponent>();

  register<T extends PositionData>(protocol: T["protocol"], component: ComponentType<{ data: T }>) {
    this.cards.set(protocol, component as PositionCardComponent);
  }

  get(protocol: string): PositionCardComponent | undefined {
    return this.cards.get(protocol);
  }

  getSupportedProtocols(): string[] {
    return Array.from(this.cards.keys());
  }
}

export const positionCardRegistry = new PositionCardRegistry();
