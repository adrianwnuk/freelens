/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { formatGroupKind } from "@freelensapp/kube-object";
import { observer } from "mobx-react";
import { Badge } from "../../badge";
import { DrawerItem } from "../../drawer";
import { KubeObjectConditionsDrawer } from "../../kube-object-conditions";
import { LinkToGatewayObject } from "../link-to-gateway-object";

import type { GatewayClass } from "@freelensapp/kube-object";

import type { KubeObjectDetailsProps } from "../../kube-object-details";

export interface GatewayClassDetailsProps extends KubeObjectDetailsProps<GatewayClass> {}

export const GatewayClassDetails = observer(({ object: gatewayClass }: GatewayClassDetailsProps) => {
  const parametersRef = gatewayClass.getParametersRef();
  const supportedFeatures = gatewayClass.getSupportedFeatures();

  return (
    <div className="GatewayClassDetails">
      <DrawerItem name="Controller">{gatewayClass.getControllerName()}</DrawerItem>
      <DrawerItem name="Description" hidden={!gatewayClass.getDescription()}>
        {gatewayClass.getDescription()}
      </DrawerItem>
      {parametersRef && (
        <DrawerItem name="Parameters">
          <LinkToGatewayObject
            objectRef={parametersRef}
            object={gatewayClass}
            defaultGroup={parametersRef.group}
            defaultKind={parametersRef.kind}
            content={`${formatGroupKind(parametersRef)} ${parametersRef.name}`}
          />
        </DrawerItem>
      )}
      <KubeObjectConditionsDrawer object={gatewayClass} />
      <DrawerItem name="Supported Features" hidden={supportedFeatures.length === 0} labelsOnly>
        {supportedFeatures.map((feature) => (
          <Badge key={feature} label={feature} />
        ))}
      </DrawerItem>
    </div>
  );
});
