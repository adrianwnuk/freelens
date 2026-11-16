/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { gatewayApiGroup } from "@freelensapp/kube-object";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { LinkToGatewayObject } from "./link-to-gateway-object";
import { GatewayParentStatuses } from "./parent-statuses";
import { formatBackendReference, formatParentReference } from "./references";

import type { GatewayRoute, GatewayRouteRule } from "@freelensapp/kube-object";

export interface GatewayRouteDetailsProps<Match, Filter extends { type: string }> {
  route: GatewayRoute<GatewayRouteRule<Match, Filter>>;
  formatMatch: (match: Match) => string;
}

/**
 * The details an HTTPRoute and a GRPCRoute share: their parents, hostnames, rules and status per parent.
 */
function NonObservedGatewayRouteDetails<Match, Filter extends { type: string }>({
  route,
  formatMatch,
}: GatewayRouteDetailsProps<Match, Filter>) {
  const hostnames = route.getHostnames();
  const parentRefs = route.getParentRefs();
  const rules = route.getRules();

  return (
    <>
      <DrawerItem name="Hostnames" hidden={hostnames.length === 0}>
        {hostnames.map((hostname) => (
          <div key={hostname}>{hostname}</div>
        ))}
      </DrawerItem>
      <DrawerItem name="Parents" hidden={parentRefs.length === 0}>
        {parentRefs.map((ref) => (
          <div key={formatParentReference(ref)}>
            <LinkToGatewayObject
              objectRef={ref}
              object={route}
              defaultGroup={gatewayApiGroup}
              defaultKind="Gateway"
              content={formatParentReference(ref)}
            />
          </div>
        ))}
      </DrawerItem>

      {rules.length > 0 && <DrawerTitle>Rules</DrawerTitle>}
      {rules.map((rule, index) => (
        <DrawerItem key={rule.name ?? index} name={rule.name ?? `Rule ${index + 1}`}>
          {rule.matches?.length ? (
            rule.matches.map((match, matchIndex) => <div key={matchIndex}>{formatMatch(match)}</div>)
          ) : (
            <div>Any request</div>
          )}
          {rule.filters && rule.filters.length > 0 && (
            <div>Filters: {rule.filters.map((filter) => filter.type).join(", ")}</div>
          )}
          {rule.backendRefs?.map((ref) => (
            <div key={formatBackendReference(ref)}>
              {"⇢ "}
              <LinkToGatewayObject
                objectRef={ref}
                object={route}
                defaultGroup=""
                defaultKind="Service"
                content={formatBackendReference(ref)}
              />
              {ref.weight !== undefined && ` (weight ${ref.weight})`}
            </div>
          ))}
        </DrawerItem>
      ))}

      <GatewayParentStatuses
        object={route}
        title="Status"
        statuses={route.getParentStatuses().map(({ parentRef, controllerName, conditions }) => ({
          ref: parentRef,
          controllerName,
          conditions,
        }))}
      />
    </>
  );
}

export const GatewayRouteDetails = observer(NonObservedGatewayRouteDetails) as typeof NonObservedGatewayRouteDetails;
