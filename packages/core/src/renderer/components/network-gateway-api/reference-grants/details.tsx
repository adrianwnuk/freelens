/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { formatGroupKind } from "@freelensapp/kube-object";
import { observer } from "mobx-react";
import { DrawerItem } from "../../drawer";
import { LinkToNamespace } from "../../kube-object-link";
import { LinkToGatewayObject } from "../link-to-gateway-object";

import type { ReferenceGrant } from "@freelensapp/kube-object";

import type { KubeObjectDetailsProps } from "../../kube-object-details";

export interface ReferenceGrantDetailsProps extends KubeObjectDetailsProps<ReferenceGrant> {}

export const ReferenceGrantDetails = observer(({ object: grant }: ReferenceGrantDetailsProps) => (
  <div className="ReferenceGrantDetails">
    <DrawerItem name="From">
      {grant.getFrom().map((from) => (
        <div key={`${formatGroupKind(from)}/${from.namespace}`}>
          {`${formatGroupKind(from)} in `}
          <LinkToNamespace namespace={from.namespace} />
        </div>
      ))}
    </DrawerItem>
    <DrawerItem name="To">
      {grant.getTo().map((to) => (
        <div key={`${formatGroupKind(to)}/${to.name ?? ""}`}>
          {formatGroupKind(to)}
          {to.name ? (
            <>
              {" "}
              <LinkToGatewayObject
                objectRef={{ group: to.group, kind: to.kind, name: to.name }}
                object={grant}
                defaultGroup={to.group}
                defaultKind={to.kind}
              />
            </>
          ) : (
            " (all)"
          )}
        </div>
      ))}
    </DrawerItem>
  </div>
));
