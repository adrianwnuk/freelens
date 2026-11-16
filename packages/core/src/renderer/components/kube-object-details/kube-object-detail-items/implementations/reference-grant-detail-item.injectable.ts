/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ReferenceGrant } from "@freelensapp/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { ReferenceGrantDetails } from "../../../network-gateway-api/reference-grants";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";

const referenceGrantDetailItemInjectable = getInjectable({
  id: "reference-grant-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: ReferenceGrantDetails,
      // An object of a CRD that the generic custom resource store loaded is no ReferenceGrant, whatever its kind
      enabled: computed(() => kubeObject.value.get()?.object instanceof ReferenceGrant),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default referenceGrantDetailItemInjectable;
