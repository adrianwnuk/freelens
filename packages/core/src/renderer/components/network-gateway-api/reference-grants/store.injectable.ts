/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { referenceGrantApiInjectable, storesAndApisCanBeCreatedInjectionToken } from "@freelensapp/kube-api-specifics";
import { loggerInjectionToken } from "@freelensapp/logger";
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreInjectionToken } from "../../../../common/k8s-api/api-manager/kube-object-store-token";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../cluster-frame-context/for-namespaced-resources.injectable";
import { ReferenceGrantStore } from "./store";

const referenceGrantStoreInjectable = getInjectable({
  id: "reference-grant-store",

  instantiate: (di) => {
    if (!di.inject(storesAndApisCanBeCreatedInjectionToken)) {
      throw new Error("referenceGrantStore is only available in certain environments");
    }

    return new ReferenceGrantStore(
      {
        context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
        logger: di.inject(loggerInjectionToken),
      },
      di.inject(referenceGrantApiInjectable),
    );
  },

  injectionToken: kubeObjectStoreInjectionToken,
});

export default referenceGrantStoreInjectable;
