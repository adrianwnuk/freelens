/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { GRPCRoute } from "@freelensapp/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { GRPCRouteDetails } from "../../../network-gateway-api/grpc-routes";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";

const grpcRouteDetailItemInjectable = getInjectable({
  id: "grpc-route-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: GRPCRouteDetails,
      // An object of a CRD that the generic custom resource store loaded is no GRPCRoute, whatever its kind
      enabled: computed(() => kubeObject.value.get()?.object instanceof GRPCRoute),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default grpcRouteDetailItemInjectable;
