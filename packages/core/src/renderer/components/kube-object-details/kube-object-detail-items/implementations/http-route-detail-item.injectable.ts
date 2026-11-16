/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { HTTPRoute } from "@freelensapp/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { HTTPRouteDetails } from "../../../network-gateway-api/http-routes";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";

const httpRouteDetailItemInjectable = getInjectable({
  id: "http-route-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: HTTPRouteDetails,
      // An object of a CRD that the generic custom resource store loaded is no HTTPRoute, whatever its kind
      enabled: computed(() => kubeObject.value.get()?.object instanceof HTTPRoute),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default httpRouteDetailItemInjectable;
