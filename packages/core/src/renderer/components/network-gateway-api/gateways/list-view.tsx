/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { KubeObjectAge } from "../../kube-object/age";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { NamespaceSelectBadge } from "../../namespaces/namespace-select-badge";
import { WithTooltip } from "../../with-tooltip";
import styles from "../list-view.module.scss";
import gatewayStoreInjectable from "./store.injectable";

import type { GatewayStore } from "./store";

enum columnId {
  name = "name",
  namespace = "namespace",
  gatewayClass = "class",
  addresses = "addresses",
  listeners = "listeners",
  programmed = "programmed",
  age = "age",
}

interface Dependencies {
  store: GatewayStore;
}

const NonInjectedGateways = observer(({ store }: Dependencies) => (
  <SiblingsInTabLayout>
    <KubeObjectListLayout
      isConfigurable
      tableId="network_gateways"
      className="Gateways"
      store={store}
      sortingCallbacks={{
        [columnId.name]: (gateway) => gateway.getName(),
        [columnId.namespace]: (gateway) => gateway.getNs(),
        [columnId.gatewayClass]: (gateway) => gateway.getGatewayClassName(),
        [columnId.listeners]: (gateway) => gateway.getListeners().length,
        [columnId.programmed]: (gateway) => gateway.getProgrammedCondition()?.status ?? "",
        [columnId.age]: (gateway) => -gateway.getCreationTimestamp(),
      }}
      searchFilters={[
        (gateway) => gateway.getSearchFields(),
        (gateway) => gateway.getGatewayClassName(),
        (gateway) => gateway.getAddresses(),
        (gateway) => gateway.getListeners().flatMap(({ hostname }) => (hostname ? [hostname] : [])),
      ]}
      renderHeaderTitle="Gateways"
      renderTableHeader={[
        { title: "Name", className: styles.name, sortBy: columnId.name, id: columnId.name },
        { title: "Namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "Class", sortBy: columnId.gatewayClass, id: columnId.gatewayClass },
        { title: "Addresses", className: styles.wide, id: columnId.addresses },
        { title: "Listeners", className: styles.count, sortBy: columnId.listeners, id: columnId.listeners },
        { title: "Programmed", className: styles.status, sortBy: columnId.programmed, id: columnId.programmed },
        { title: "Age", className: styles.age, sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={(gateway) => {
        const programmed = gateway.getProgrammedCondition();

        return [
          <WithTooltip>{gateway.getName()}</WithTooltip>,
          <NamespaceSelectBadge key="namespace" namespace={gateway.getNs()} />,
          <WithTooltip>{gateway.getGatewayClassName()}</WithTooltip>,
          <WithTooltip>{gateway.getAddresses().join(", ")}</WithTooltip>,
          gateway.getListeners().length,
          <WithTooltip tooltip={programmed?.message}>{programmed?.status}</WithTooltip>,
          <KubeObjectAge key="age" object={gateway} />,
        ];
      }}
    />
  </SiblingsInTabLayout>
));

export const Gateways = withInjectables<Dependencies>(NonInjectedGateways, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(gatewayStoreInjectable),
  }),
});
