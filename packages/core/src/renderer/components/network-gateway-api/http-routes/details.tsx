/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { formatHTTPRouteMatch } from "@freelensapp/kube-object";
import { observer } from "mobx-react";
import { GatewayRouteDetails } from "../route-details";

import type { HTTPRoute } from "@freelensapp/kube-object";

import type { KubeObjectDetailsProps } from "../../kube-object-details";

export interface HTTPRouteDetailsProps extends KubeObjectDetailsProps<HTTPRoute> {}

export const HTTPRouteDetails = observer(({ object: route }: HTTPRouteDetailsProps) => (
  <div className="HTTPRouteDetails">
    <GatewayRouteDetails route={route} formatMatch={formatHTTPRouteMatch} />
  </div>
));
