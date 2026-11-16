/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { GatewayRouteListView } from "../route-list-view";
import httpRouteStoreInjectable from "./store.injectable";

import type { HTTPRouteStore } from "./store";

interface Dependencies {
  store: HTTPRouteStore;
}

const NonInjectedHTTPRoutes = ({ store }: Dependencies) => (
  <GatewayRouteListView store={store} tableId="network_http_routes" className="HTTPRoutes" title="HTTP Routes" />
);

export const HTTPRoutes = withInjectables<Dependencies>(NonInjectedHTTPRoutes, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(httpRouteStoreInjectable),
  }),
});
