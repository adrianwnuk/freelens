/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { gatewayApiGroup } from "@freelensapp/kube-object";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../../drawer";
import { ConditionBadges, KubeObjectConditionsDrawer } from "../../kube-object-conditions";
import { Table, TableCell, TableHead, TableRow } from "../../table";
import { LinkToGatewayObject } from "../link-to-gateway-object";

import type { Gateway, GatewayListener } from "@freelensapp/kube-object";

import type { KubeObjectDetailsProps } from "../../kube-object-details";

export interface GatewayDetailsProps extends KubeObjectDetailsProps<Gateway> {}

function formatAllowedRoutes({ allowedRoutes }: GatewayListener) {
  const from = allowedRoutes?.namespaces?.from ?? "Same";
  const kinds = allowedRoutes?.kinds?.map(({ kind }) => kind).join(", ");

  return kinds ? `${kinds} from ${from}` : `from ${from}`;
}

export const GatewayDetails = observer(({ object: gateway }: GatewayDetailsProps) => {
  const addresses = gateway.getAddresses();
  const listeners = gateway.getListeners();

  return (
    <div className="GatewayDetails">
      <DrawerItem name="Class">
        <LinkToGatewayObject
          objectRef={{ group: gatewayApiGroup, kind: "GatewayClass", name: gateway.getGatewayClassName() }}
          object={gateway}
          defaultGroup={gatewayApiGroup}
          defaultKind="GatewayClass"
        />
      </DrawerItem>
      <DrawerItem name="Addresses" hidden={addresses.length === 0}>
        {addresses.map((address) => (
          <div key={address}>{address}</div>
        ))}
      </DrawerItem>
      <KubeObjectConditionsDrawer object={gateway} />

      {listeners.length > 0 && (
        <>
          <DrawerTitle>Listeners</DrawerTitle>
          <Table selectable={false} virtual={false} scrollable={false} className="grow shrink-0 basis-0">
            <TableHead>
              <TableCell>Name</TableCell>
              <TableCell>Protocol</TableCell>
              <TableCell>Port</TableCell>
              <TableCell>Hostname</TableCell>
              <TableCell>TLS</TableCell>
              <TableCell>Allowed Routes</TableCell>
              <TableCell>Attached</TableCell>
              <TableCell>Conditions</TableCell>
            </TableHead>
            {listeners.map((listener) => {
              const status = gateway.getListenerStatus(listener.name);

              return (
                <TableRow key={listener.name}>
                  <TableCell>{listener.name}</TableCell>
                  <TableCell>{listener.protocol}</TableCell>
                  <TableCell>{listener.port}</TableCell>
                  <TableCell>{listener.hostname ?? "*"}</TableCell>
                  <TableCell>
                    {listener.tls && (
                      <>
                        <div>{listener.tls.mode ?? "Terminate"}</div>
                        {listener.tls.certificateRefs?.map((ref) => (
                          <div key={`${ref.namespace ?? ""}/${ref.name}`}>
                            <LinkToGatewayObject
                              objectRef={ref}
                              object={gateway}
                              defaultGroup=""
                              defaultKind="Secret"
                            />
                          </div>
                        ))}
                      </>
                    )}
                  </TableCell>
                  <TableCell>{formatAllowedRoutes(listener)}</TableCell>
                  <TableCell>{status?.attachedRoutes}</TableCell>
                  <TableCell>
                    {status?.conditions && (
                      <ConditionBadges
                        conditions={status.conditions}
                        idPrefix={`${gateway.getId()}-listener-${listener.name}`}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </>
      )}
    </div>
  );
});
