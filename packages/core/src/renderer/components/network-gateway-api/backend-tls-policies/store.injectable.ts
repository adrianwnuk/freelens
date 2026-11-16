/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  backendTlsPolicyApiInjectable,
  storesAndApisCanBeCreatedInjectionToken,
} from "@freelensapp/kube-api-specifics";
import { loggerInjectionToken } from "@freelensapp/logger";
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreInjectionToken } from "../../../../common/k8s-api/api-manager/kube-object-store-token";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../cluster-frame-context/for-namespaced-resources.injectable";
import { BackendTLSPolicyStore } from "./store";

const backendTlsPolicyStoreInjectable = getInjectable({
  id: "backend-tls-policy-store",

  instantiate: (di) => {
    if (!di.inject(storesAndApisCanBeCreatedInjectionToken)) {
      throw new Error("backendTlsPolicyStore is only available in certain environments");
    }

    return new BackendTLSPolicyStore(
      {
        context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
        logger: di.inject(loggerInjectionToken),
      },
      di.inject(backendTlsPolicyApiInjectable),
    );
  },

  injectionToken: kubeObjectStoreInjectionToken,
});

export default backendTlsPolicyStoreInjectable;
