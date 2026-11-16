/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";

import type { LabelSelector, NamespaceScopedMetadata } from "../api-types";
import type { Condition } from "../types/condition";

/**
 * The API group of the Kubernetes Gateway API.
 */
export const gatewayApiGroup = "gateway.networking.k8s.io";

/**
 * A reference to an object of a given group and kind. An empty group is the core API group.
 *
 * A reference of the Gateway API names its target by group and kind, not by `apiVersion`.
 */
export interface GatewayObjectReference {
  group?: string;
  kind?: string;
  name: string;
  namespace?: string;
}

/**
 * A reference to an object in the namespace of the referring object.
 */
export interface GatewayLocalObjectReference {
  group: string;
  kind: string;
  name: string;
}

/**
 * A reference from a route or a policy to the object it attaches to, by default a Gateway.
 */
export interface GatewayParentReference extends GatewayObjectReference {
  sectionName?: string;
  port?: number;
}

/**
 * A reference to a backend of a route, by default a Service of the core API group.
 */
export interface GatewayBackendObjectReference extends GatewayObjectReference {
  port?: number;
}

/**
 * A backend of a route rule, with its share of the traffic and the filters applied to the requests sent to it.
 */
export interface GatewayBackendRef<Filter = unknown> extends GatewayBackendObjectReference {
  weight?: number;
  filters?: Filter[];
}

export interface GatewayRouteParentStatus {
  parentRef: GatewayParentReference;
  controllerName: string;
  conditions?: Condition[];
}

/**
 * The status of a policy as reported for one of its ancestors, the objects that apply it, such as a Gateway.
 */
export interface GatewayPolicyAncestorStatus {
  ancestorRef: GatewayParentReference;
  controllerName: string;
  conditions?: Condition[];
}

export interface GatewayRouteStatus {
  parents?: GatewayRouteParentStatus[];
}

export interface GatewayHeaderMatch {
  type?: "Exact" | "RegularExpression";
  name: string;
  value: string;
}

/**
 * Formats the group and kind of a reference, for example `HTTPRoute.gateway.networking.k8s.io`, or `Service` for the
 * core API group.
 */
export function formatGroupKind({ group, kind }: { group?: string; kind: string }): string {
  return group ? `${kind}.${group}` : kind;
}

/**
 * Describes a header or query parameter match, for example `header:x-env=prod`, or `header:x-env~pr.*` for a
 * regular expression.
 */
export function formatGatewayHeaderMatch(prefix: "header" | "query", match: GatewayHeaderMatch): string {
  return `${prefix}:${match.name}${match.type === "RegularExpression" ? "~" : "="}${match.value}`;
}

export interface GatewayHeader {
  name: string;
  value: string;
}

export interface GatewayHeaderFilter {
  set?: GatewayHeader[];
  add?: GatewayHeader[];
  remove?: string[];
}

export interface GatewayRequestMirrorFilter {
  backendRef: GatewayBackendObjectReference;
  percent?: number;
  fraction?: {
    numerator: number;
    denominator?: number;
  };
}

export interface GatewayRouteNamespaces {
  from?: "All" | "Selector" | "Same" | "None";
  selector?: LabelSelector;
}

export interface GatewayRouteRule<Match, Filter> {
  name?: string;
  matches?: Match[];
  filters?: Filter[];
  backendRefs?: GatewayBackendRef<Filter>[];
}

export interface GatewayRouteSpec<Rule> {
  parentRefs?: GatewayParentReference[];
  hostnames?: string[];
  rules?: Rule[];
}

/**
 * What the routes of the Gateway API share: the parents they attach to, the hostnames they match and their rules.
 */
export abstract class GatewayRoute<Rule> extends KubeObject<
  NamespaceScopedMetadata,
  GatewayRouteStatus,
  GatewayRouteSpec<Rule>
> {
  getParentRefs(): GatewayParentReference[] {
    return this.spec.parentRefs ?? [];
  }

  getHostnames(): string[] {
    return this.spec.hostnames ?? [];
  }

  getRules(): Rule[] {
    return this.spec.rules ?? [];
  }

  /**
   * The status of the route as reported for each parent, by the controller of that parent.
   */
  getParentStatuses(): GatewayRouteParentStatus[] {
    return this.status?.parents ?? [];
  }
}
