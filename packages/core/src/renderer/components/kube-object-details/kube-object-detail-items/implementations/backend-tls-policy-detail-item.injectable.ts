/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BackendTLSPolicy } from "@freelensapp/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { BackendTLSPolicyDetails } from "../../../network-gateway-api/backend-tls-policies";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";

const backendTlsPolicyDetailItemInjectable = getInjectable({
  id: "backend-tls-policy-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: BackendTLSPolicyDetails,
      // An object of a CRD that the generic custom resource store loaded is no BackendTLSPolicy, whatever its kind
      enabled: computed(() => kubeObject.value.get()?.object instanceof BackendTLSPolicy),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default backendTlsPolicyDetailItemInjectable;
