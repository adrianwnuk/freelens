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

export interface HTTPPathMatch {
  type?: "Exact" | "PathPrefix" | "RegularExpression";
  value?: string;
}

export interface HTTPRouteMatch {
  path?: HTTPPathMatch;
  headers?: GatewayHeaderMatch[];
  queryParams?: GatewayHeaderMatch[];
  method?: string;
}

export interface HTTPPathModifier {
  type: "ReplaceFullPath" | "ReplacePrefixMatch";
  replaceFullPath?: string;
  replacePrefixMatch?: string;
}

export interface HTTPRequestRedirectFilter {
  scheme?: "http" | "https";
  hostname?: string;
  path?: HTTPPathModifier;
  port?: number;
  statusCode?: number;
}

export interface HTTPURLRewriteFilter {
  hostname?: string;
  path?: HTTPPathModifier;
}

export interface HTTPCORSFilter {
  allowOrigins?: string[];
  allowCredentials?: boolean;
  allowMethods?: string[];
  allowHeaders?: string[];
  exposeHeaders?: string[];
  maxAge?: number;
}

export interface HTTPRouteFilter {
  type: string;
  requestHeaderModifier?: GatewayHeaderFilter;
  responseHeaderModifier?: GatewayHeaderFilter;
  requestMirror?: GatewayRequestMirrorFilter;
  requestRedirect?: HTTPRequestRedirectFilter;
  urlRewrite?: HTTPURLRewriteFilter;
  cors?: HTTPCORSFilter;
  extensionRef?: GatewayLocalObjectReference;
}

export interface HTTPRouteTimeouts {
  request?: string;
  backendRequest?: string;
}

export interface HTTPRouteRetry {
  codes?: number[];
  attempts?: number;
  backoff?: string;
}

export interface HTTPRouteRule extends GatewayRouteRule<HTTPRouteMatch, HTTPRouteFilter> {
  timeouts?: HTTPRouteTimeouts;
  retry?: HTTPRouteRetry;
}

export class HTTPRoute extends GatewayRoute<HTTPRouteRule> {
  static readonly kind = "HTTPRoute";

  static readonly namespaced = true;

  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/httproutes";
}

/**
 * Describes a match of an HTTPRoute rule in one line, for example `GET PathPrefix /api header:x-env=prod`.
 *
 * A match that names no path matches every path, as the API defaults it to the prefix `/`.
 */
export function formatHTTPRouteMatch(match: HTTPRouteMatch): string {
  const path = match.path ?? {};
  const parts = [`${path.type ?? "PathPrefix"} ${path.value ?? "/"}`];

  if (match.method) {
    parts.unshift(match.method);
  }

  for (const header of match.headers ?? []) {
    parts.push(formatGatewayHeaderMatch("header", header));
  }

  for (const param of match.queryParams ?? []) {
    parts.push(formatGatewayHeaderMatch("query", param));
  }

  return parts.join(" ");
}
