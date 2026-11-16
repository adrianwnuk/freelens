/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";

import type { ClusterScopedMetadata } from "../api-types";
import type { Condition } from "../types/condition";
import type { GatewayObjectReference } from "./gateway-api";

export interface GatewayClassParametersReference extends GatewayObjectReference {
  group: string;
  kind: string;
}

export interface GatewayClassSpec {
  controllerName: string;
  description?: string;
  parametersRef?: GatewayClassParametersReference;
}

export interface GatewayClassStatus {
  conditions?: Condition[];
  supportedFeatures?: { name: string }[];
}

export class GatewayClass extends KubeObject<ClusterScopedMetadata, GatewayClassStatus, GatewayClassSpec> {
  static readonly kind = "GatewayClass";

  static readonly namespaced = false;

  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/gatewayclasses";

  getControllerName(): string {
    return this.spec.controllerName;
  }

  getDescription(): string | undefined {
    return this.spec.description;
  }

  getParametersRef(): GatewayClassParametersReference | undefined {
    return this.spec.parametersRef;
  }

  getSupportedFeatures(): string[] {
    return this.status?.supportedFeatures?.map(({ name }) => name) ?? [];
  }

  /**
   * The `Accepted` condition, set by the controller the class names once it has seen the class.
   */
  getAcceptedCondition(): Condition | undefined {
    return this.status?.conditions?.find(({ type }) => type === "Accepted");
  }
}
