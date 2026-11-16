/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { sidebarItemInjectionToken } from "@freelensapp/cluster-sidebar";
import { getInjectable } from "@ogre-tools/injectable";
import backendTlsPoliciesRouteInjectable from "../../../../common/front-end-routing/routes/cluster/network/backend-tls-policies/backend-tls-policies-route.injectable";
import navigateToBackendTlsPoliciesInjectable from "../../../../common/front-end-routing/routes/cluster/network/backend-tls-policies/navigate-to-backend-tls-policies.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import networkSidebarItemInjectable from "../../network/network-sidebar-item.injectable";

const backendTlsPoliciesSidebarItemInjectable = getInjectable({
  id: "sidebar-item-backend-tls-policies",

  instantiate: (di) => {
    const route = di.inject(backendTlsPoliciesRouteInjectable);

    return {
      parentId: networkSidebarItemInjectable.id,
      title: "Backend TLS Policies",
      onClick: di.inject(navigateToBackendTlsPoliciesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 37,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default backendTlsPoliciesSidebarItemInjectable;
