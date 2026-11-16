/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { gatewayApiGroup } from "@freelensapp/kube-object";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { ConditionBadges } from "../kube-object-conditions";
import { LinkToGatewayObject } from "./link-to-gateway-object";
import { formatParentReference } from "./references";

import type { Condition, GatewayParentReference, KubeObject } from "@freelensapp/kube-object";

export interface GatewayParentStatus {
  ref: GatewayParentReference;
  controllerName: string;
  conditions?: Condition[];
}

export interface GatewayParentStatusesProps {
  object: KubeObject;
  title: string;
  statuses: GatewayParentStatus[];
}

/**
 * The status of a route or a policy, which the controller of each parent (or ancestor) reports separately.
 */
export const GatewayParentStatuses = observer(({ object, title, statuses }: GatewayParentStatusesProps) => {
  if (statuses.length === 0) {
    return null;
  }

  return (
    <>
      <DrawerTitle>{title}</DrawerTitle>
      {statuses.map(({ ref, controllerName, conditions }, index) => (
        <DrawerItem
          key={`${formatParentReference(ref)}-${controllerName}`}
          name={
            <LinkToGatewayObject
              objectRef={ref}
              object={object}
              defaultGroup={gatewayApiGroup}
              defaultKind="Gateway"
              content={formatParentReference(ref)}
            />
          }
        >
          <div className="text-textTertiary">{controllerName}</div>
          {conditions && (
            <div>
              <ConditionBadges conditions={conditions} idPrefix={`${object.getId()}-parent-${index}`} />
            </div>
          )}
        </DrawerItem>
      ))}
    </>
  );
});
