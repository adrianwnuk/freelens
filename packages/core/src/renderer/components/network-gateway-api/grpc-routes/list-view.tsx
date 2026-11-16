/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { GatewayRouteListView } from "../route-list-view";
import grpcRouteStoreInjectable from "./store.injectable";

import type { GRPCRouteStore } from "./store";

interface Dependencies {
  store: GRPCRouteStore;
}

const NonInjectedGRPCRoutes = ({ store }: Dependencies) => (
  <GatewayRouteListView store={store} tableId="network_grpc_routes" className="GRPCRoutes" title="GRPC Routes" />
);

export const GRPCRoutes = withInjectables<Dependencies>(NonInjectedGRPCRoutes, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(grpcRouteStoreInjectable),
  }),
});
