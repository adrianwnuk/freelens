/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { GatewayClass } from "@freelensapp/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { GatewayClassDetails } from "../../../network-gateway-api/gateway-classes";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";

const gatewayClassDetailItemInjectable = getInjectable({
  id: "gateway-class-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: GatewayClassDetails,
      // An object of a CRD that the generic custom resource store loaded is no GatewayClass, whatever its kind
      enabled: computed(() => kubeObject.value.get()?.object instanceof GatewayClass),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default gatewayClassDetailItemInjectable;
