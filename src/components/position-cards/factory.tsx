import React from "react";

import { positionCardRegistry } from "./registry";
import type { PositionData } from "./types";
import { UnknownProtocolCard } from "./unknown-protocol-card";

interface PositionCardFactoryProps {
  data: PositionData;
}

export const PositionCardFactory: React.FC<PositionCardFactoryProps> = ({ data }) => {
  const CardComponent = positionCardRegistry.get(data.protocol);

  if (CardComponent) return <CardComponent data={data} />;
  return <UnknownProtocolCard data={data} />;
};
