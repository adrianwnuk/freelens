/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";

import type { NamespaceScopedMetadata } from "../api-types";
import type { Condition } from "../types/condition";
import type { GatewayLocalObjectReference, GatewayObjectReference, GatewayRouteNamespaces } from "./gateway-api";

export interface GatewaySpecAddress {
  type?: string;
  value?: string;
}

export interface GatewayRouteGroupKind {
  group?: string;
  kind: string;
}

export interface GatewayAllowedRoutes {
  namespaces?: GatewayRouteNamespaces;
  kinds?: GatewayRouteGroupKind[];
}

export interface GatewayListenerTLSConfig {
  mode?: "Terminate" | "Passthrough";
  certificateRefs?: GatewayObjectReference[];
  options?: Partial<Record<string, string>>;
}

export interface GatewayListener {
  name: string;
  hostname?: string;
  port: number;
  protocol: string;
  tls?: GatewayListenerTLSConfig;
  allowedRoutes?: GatewayAllowedRoutes;
}

export interface GatewayInfrastructure {
  labels?: Partial<Record<string, string>>;
  annotations?: Partial<Record<string, string>>;
  parametersRef?: GatewayLocalObjectReference;
}

export interface GatewaySpec {
  gatewayClassName: string;
  listeners: GatewayListener[];
  addresses?: GatewaySpecAddress[];
  infrastructure?: GatewayInfrastructure;
}

export interface GatewayStatusAddress {
  type?: string;
  value: string;
}

export interface GatewayListenerStatus {
  name: string;
  supportedKinds?: GatewayRouteGroupKind[];
  attachedRoutes: number;
  conditions?: Condition[];
}

export interface GatewayStatus {
  addresses?: GatewayStatusAddress[];
  conditions?: Condition[];
  listeners?: GatewayListenerStatus[];
}

export class Gateway extends KubeObject<NamespaceScopedMetadata, GatewayStatus, GatewaySpec> {
  static readonly kind = "Gateway";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/gateways";

  getGatewayClassName(): string {
    return this.spec.gatewayClassName;
  }

  getListeners(): GatewayListener[] {
    return this.spec.listeners ?? [];
  }

  getListenerStatus(name: string): GatewayListenerStatus | undefined {
    return this.status?.listeners?.find((listener) => listener.name === name);
  }

  /**
   * The addresses the Gateway is reachable at, as reported by its controller, or else as requested in its spec.
   */
  getAddresses(): string[] {
    const addresses = this.status?.addresses?.length ? this.status.addresses : (this.spec.addresses ?? []);

    return addresses.map(({ value }) => value).filter((value): value is string => Boolean(value));
  }

  /**
   * The `Programmed` condition, set once the controller has configured the data plane for the Gateway.
   */
  getProgrammedCondition(): Condition | undefined {
    return this.status?.conditions?.find(({ type }) => type === "Programmed");
  }
}
