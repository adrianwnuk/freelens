/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../../drawer";
import { LinkToGatewayObject } from "../link-to-gateway-object";
import { GatewayParentStatuses } from "../parent-statuses";

import type { BackendTLSPolicy } from "@freelensapp/kube-object";

import type { KubeObjectDetailsProps } from "../../kube-object-details";

export interface BackendTLSPolicyDetailsProps extends KubeObjectDetailsProps<BackendTLSPolicy> {}

export const BackendTLSPolicyDetails = observer(({ object: policy }: BackendTLSPolicyDetailsProps) => {
  const validation = policy.getValidation();
  const caCertificateRefs = validation?.caCertificateRefs ?? [];
  const subjectAltNames = validation?.subjectAltNames ?? [];

  return (
    <div className="BackendTLSPolicyDetails">
      <DrawerItem name="Targets">
        {policy.getTargetRefs().map((ref) => (
          <div key={`${ref.group}/${ref.kind}/${ref.name}/${ref.sectionName ?? ""}`}>
            {`${ref.kind} `}
            <LinkToGatewayObject objectRef={ref} object={policy} defaultGroup={ref.group} defaultKind={ref.kind} />
            {ref.sectionName && ` (${ref.sectionName})`}
          </div>
        ))}
      </DrawerItem>

      <DrawerTitle>Validation</DrawerTitle>
      <DrawerItem name="Hostname">{validation?.hostname}</DrawerItem>
      <DrawerItem name="CA Certificates" hidden={caCertificateRefs.length === 0}>
        {caCertificateRefs.map((ref) => (
          <div key={`${ref.group}/${ref.kind}/${ref.name}`}>
            {`${ref.kind} `}
            <LinkToGatewayObject objectRef={ref} object={policy} defaultGroup={ref.group} defaultKind={ref.kind} />
          </div>
        ))}
      </DrawerItem>
      <DrawerItem name="Well-Known CA Certificates" hidden={!validation?.wellKnownCACertificates}>
        {validation?.wellKnownCACertificates}
      </DrawerItem>
      <DrawerItem name="Subject Alt Names" hidden={subjectAltNames.length === 0}>
        {subjectAltNames.map(({ type, hostname, uri }) => (
          <div key={`${type}/${hostname ?? uri}`}>{`${type}: ${hostname ?? uri}`}</div>
        ))}
      </DrawerItem>

      <GatewayParentStatuses
        object={policy}
        title="Status"
        statuses={policy.getAncestorStatuses().map(({ ancestorRef, controllerName, conditions }) => ({
          ref: ancestorRef,
          controllerName,
          conditions,
        }))}
      />
    </div>
  );
});
