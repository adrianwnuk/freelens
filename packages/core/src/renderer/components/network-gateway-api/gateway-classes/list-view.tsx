/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { KubeObjectAge } from "../../kube-object/age";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { WithTooltip } from "../../with-tooltip";
import styles from "../list-view.module.scss";
import gatewayClassStoreInjectable from "./store.injectable";

import type { GatewayClassStore } from "./store";

enum columnId {
  name = "name",
  controller = "controller",
  accepted = "accepted",
  age = "age",
}

interface Dependencies {
  store: GatewayClassStore;
}

const NonInjectedGatewayClasses = observer(({ store }: Dependencies) => (
  <SiblingsInTabLayout>
    <KubeObjectListLayout
      isConfigurable
      tableId="network_gateway_classes"
      className="GatewayClasses"
      store={store}
      sortingCallbacks={{
        [columnId.name]: (gatewayClass) => gatewayClass.getName(),
        [columnId.controller]: (gatewayClass) => gatewayClass.getControllerName(),
        [columnId.accepted]: (gatewayClass) => gatewayClass.getAcceptedCondition()?.status ?? "",
        [columnId.age]: (gatewayClass) => -gatewayClass.getCreationTimestamp(),
      }}
      searchFilters={[
        (gatewayClass) => gatewayClass.getSearchFields(),
        (gatewayClass) => gatewayClass.getControllerName(),
      ]}
      renderHeaderTitle="Gateway Classes"
      renderTableHeader={[
        { title: "Name", className: styles.name, sortBy: columnId.name, id: columnId.name },
        { title: "Controller", className: styles.wide, sortBy: columnId.controller, id: columnId.controller },
        { title: "Accepted", className: styles.status, sortBy: columnId.accepted, id: columnId.accepted },
        { title: "Age", className: styles.age, sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={(gatewayClass) => {
        const accepted = gatewayClass.getAcceptedCondition();

        return [
          <WithTooltip>{gatewayClass.getName()}</WithTooltip>,
          <WithTooltip>{gatewayClass.getControllerName()}</WithTooltip>,
          <WithTooltip tooltip={accepted?.message}>{accepted?.status}</WithTooltip>,
          <KubeObjectAge key="age" object={gatewayClass} />,
        ];
      }}
    />
  </SiblingsInTabLayout>
));

export const GatewayClasses = withInjectables<Dependencies>(NonInjectedGatewayClasses, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(gatewayClassStoreInjectable),
  }),
});
