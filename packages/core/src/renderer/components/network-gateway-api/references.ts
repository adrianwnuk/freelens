/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { gatewayApiGroup } from "@freelensapp/kube-object";

import type { GatewayBackendObjectReference, GatewayParentReference } from "@freelensapp/kube-object";

function formatName({ name, namespace }: { name: string; namespace?: string }) {
  return namespace ? `${namespace}/${name}` : name;
}

/**
 * Describes the parent a route attaches to, for example `gw`, `infra/gw (https, port 443)`, or `Service web` for a
 * parent that is not a Gateway.
 */
export function formatParentReference(ref: GatewayParentReference): string {
  const group = ref.group ?? gatewayApiGroup;
  const kind = ref.kind || "Gateway";
  const isGateway = group === gatewayApiGroup && kind === "Gateway";
  const name = isGateway ? formatName(ref) : `${kind} ${formatName(ref)}`;
  const section = [ref.sectionName, ref.port !== undefined ? `port ${ref.port}` : undefined].filter(Boolean);

  return section.length ? `${name} (${section.join(", ")})` : name;
}

/**
 * Describes a backend of a route, for example `web:8080`, or `Backend ns/storage` for a backend that is not a Service.
 */
export function formatBackendReference(ref: GatewayBackendObjectReference): string {
  const isService = (ref.group ?? "") === "" && (ref.kind || "Service") === "Service";
  const name = isService ? formatName(ref) : `${ref.kind} ${formatName(ref)}`;

  return ref.port !== undefined ? `${name}:${ref.port}` : name;
}
