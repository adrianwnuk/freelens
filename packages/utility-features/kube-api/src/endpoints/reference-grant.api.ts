/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ReferenceGrant } from "@freelensapp/kube-object";
import { KubeApi } from "../kube-api";

import type { DerivedKubeApiOptions, KubeApiDependencies } from "../kube-api";

export class ReferenceGrantApi extends KubeApi<ReferenceGrant> {
  constructor(deps: KubeApiDependencies, opts?: DerivedKubeApiOptions) {
    super(deps, {
      ...(opts ?? {}),
      objectConstructor: ReferenceGrant,
      // The Gateway API is installed as CRDs, so a cluster may serve an older version than the one in apiBase
      checkPreferredVersion: true,
    });
  }
}
