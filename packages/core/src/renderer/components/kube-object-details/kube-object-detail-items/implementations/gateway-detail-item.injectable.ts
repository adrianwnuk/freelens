/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Gateway } from "@freelensapp/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { GatewayDetails } from "../../../network-gateway-api/gateways";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";

const gatewayDetailItemInjectable = getInjectable({
  id: "gateway-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: GatewayDetails,
      // An object of a CRD that the generic custom resource store loaded is no Gateway, whatever its kind
      enabled: computed(() => kubeObject.value.get()?.object instanceof Gateway),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default gatewayDetailItemInjectable;
