/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { formatGatewayHeaderMatch, GatewayRoute } from "./gateway-api";

import type {
  GatewayHeaderFilter,
  GatewayHeaderMatch,
  GatewayLocalObjectReference,
  GatewayRequestMirrorFilter,
  GatewayRouteRule,
} from "./gateway-api";

export interface GRPCMethodMatch {
  type?: "Exact" | "RegularExpression";
  service?: string;
  method?: string;
}

export interface GRPCRouteMatch {
  method?: GRPCMethodMatch;
  headers?: GatewayHeaderMatch[];
}

export interface GRPCRouteFilter {
  type: string;
  requestHeaderModifier?: GatewayHeaderFilter;
  responseHeaderModifier?: GatewayHeaderFilter;
  requestMirror?: GatewayRequestMirrorFilter;
  extensionRef?: GatewayLocalObjectReference;
}

export interface GRPCRouteRule extends GatewayRouteRule<GRPCRouteMatch, GRPCRouteFilter> {}

export class GRPCRoute extends GatewayRoute<GRPCRouteRule> {
  static readonly kind = "GRPCRoute";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/grpcroutes";
}

/**
 * Describes a match of a GRPCRoute rule in one line, for example `my.Service/Get header:x-env=prod`.
 *
 * A service or a method that the match leaves out matches any, shown as `*`.
 */
export function formatGRPCRouteMatch(match: GRPCRouteMatch): string {
  const { type, service, method } = match.method ?? {};
  const regularExpression = type === "RegularExpression" ? " (regex)" : "";
  const parts = [`${service ?? "*"}/${method ?? "*"}${regularExpression}`];

  for (const header of match.headers ?? []) {
    parts.push(formatGatewayHeaderMatch("header", header));
  }

  return parts.join(" ");
}
