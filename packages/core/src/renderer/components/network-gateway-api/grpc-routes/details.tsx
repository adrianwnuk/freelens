/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { formatGRPCRouteMatch } from "@freelensapp/kube-object";
import { observer } from "mobx-react";
import { GatewayRouteDetails } from "../route-details";

import type { GRPCRoute } from "@freelensapp/kube-object";

import type { KubeObjectDetailsProps } from "../../kube-object-details";

export interface GRPCRouteDetailsProps extends KubeObjectDetailsProps<GRPCRoute> {}

export const GRPCRouteDetails = observer(({ object: route }: GRPCRouteDetailsProps) => (
  <div className="GRPCRouteDetails">
    <GatewayRouteDetails route={route} formatMatch={formatGRPCRouteMatch} />
  </div>
));
