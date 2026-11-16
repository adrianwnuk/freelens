/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";

import type { NamespaceScopedMetadata } from "../api-types";
import type { GatewayLocalObjectReference, GatewayPolicyAncestorStatus } from "./gateway-api";

export interface BackendTLSPolicyTargetReference extends GatewayLocalObjectReference {
  sectionName?: string;
}

export interface BackendTLSPolicySubjectAltName {
  type: "Hostname" | "URI";
  hostname?: string;
  uri?: string;
}

export interface BackendTLSPolicyValidation {
  hostname: string;
  caCertificateRefs?: GatewayLocalObjectReference[];
  wellKnownCACertificates?: string;
  subjectAltNames?: BackendTLSPolicySubjectAltName[];
}

export interface BackendTLSPolicySpec {
  targetRefs: BackendTLSPolicyTargetReference[];
  validation: BackendTLSPolicyValidation;
  options?: Partial<Record<string, string>>;
}

export interface BackendTLSPolicyStatus {
  ancestors?: GatewayPolicyAncestorStatus[];
}

export class BackendTLSPolicy extends KubeObject<
  NamespaceScopedMetadata,
  BackendTLSPolicyStatus,
  BackendTLSPolicySpec
> {
  static readonly kind = "BackendTLSPolicy";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/backendtlspolicies";

  getTargetRefs(): BackendTLSPolicyTargetReference[] {
    return this.spec.targetRefs ?? [];
  }

  getHostname(): string | undefined {
    return this.spec.validation?.hostname;
  }

  getValidation(): BackendTLSPolicyValidation | undefined {
    return this.spec.validation;
  }

  /**
   * The status of the policy as reported for each ancestor, usually a Gateway, by the controller of that ancestor.
   */
  getAncestorStatuses(): GatewayPolicyAncestorStatus[] {
    return this.status?.ancestors ?? [];
  }
}
