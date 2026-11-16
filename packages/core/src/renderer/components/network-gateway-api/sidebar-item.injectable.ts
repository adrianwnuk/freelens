/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { sidebarItemInjectionToken } from "@freelensapp/cluster-sidebar";
import { getInjectable } from "@ogre-tools/injectable";
import { noop } from "es-toolkit";
import networkSidebarItemInjectable from "../network/network-sidebar-item.injectable";

/**
 * The group of the Gateway API resources under Network. It shows while any of them does, that is on a cluster that
 * serves the Gateway API CRDs.
 */
const gatewayApiSidebarItemInjectable = getInjectable({
  id: "sidebar-item-gateway-api",

  instantiate: () => ({
    parentId: networkSidebarItemInjectable.id,
    title: "Gateway API",
    onClick: noop,
    orderNumber: 32,
  }),

  injectionToken: sidebarItemInjectionToken,
});

export default gatewayApiSidebarItemInjectable;
