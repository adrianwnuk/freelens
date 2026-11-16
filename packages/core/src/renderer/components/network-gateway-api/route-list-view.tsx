/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observer } from "mobx-react";
import { KubeObjectAge } from "../kube-object/age";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { SiblingsInTabLayout } from "../layout/siblings-in-tab-layout";
import { NamespaceSelectBadge } from "../namespaces/namespace-select-badge";
import { WithTooltip } from "../with-tooltip";
import styles from "./list-view.module.scss";
import { formatParentReference } from "./references";

import type { GatewayRoute } from "@freelensapp/kube-object";

import type { KubeItemListStore } from "../kube-object-list-layout";

enum columnId {
  name = "name",
  namespace = "namespace",
  hostnames = "hostnames",
  parents = "parents",
  age = "age",
}

export interface GatewayRouteListViewProps<Route extends GatewayRoute<unknown>> {
  store: KubeItemListStore<Route>;
  tableId: string;
  className: string;
  title: string;
}

/**
 * The list of the routes of one kind, which all show their hostnames and the parents they attach to.
 */
function NonObservedGatewayRouteListView<Route extends GatewayRoute<unknown>>({
  store,
  tableId,
  className,
  title,
}: GatewayRouteListViewProps<Route>) {
  return (
    <SiblingsInTabLayout>
      <KubeObjectListLayout
        isConfigurable
        tableId={tableId}
        className={className}
        store={store}
        sortingCallbacks={{
          [columnId.name]: (route) => route.getName(),
          [columnId.namespace]: (route) => route.getNs(),
          [columnId.hostnames]: (route) => route.getHostnames().join(", "),
          [columnId.parents]: (route) => route.getParentRefs().map(formatParentReference).join(", "),
          [columnId.age]: (route) => -route.getCreationTimestamp(),
        }}
        searchFilters={[
          (route) => route.getSearchFields(),
          (route) => route.getHostnames(),
          (route) => route.getParentRefs().map(formatParentReference),
        ]}
        renderHeaderTitle={title}
        renderTableHeader={[
          { title: "Name", className: styles.name, sortBy: columnId.name, id: columnId.name },
          { title: "Namespace", sortBy: columnId.namespace, id: columnId.namespace },
          { title: "Hostnames", className: styles.wide, sortBy: columnId.hostnames, id: columnId.hostnames },
          { title: "Parents", className: styles.wide, sortBy: columnId.parents, id: columnId.parents },
          { title: "Age", className: styles.age, sortBy: columnId.age, id: columnId.age },
        ]}
        renderTableContents={(route) => [
          <WithTooltip>{route.getName()}</WithTooltip>,
          <NamespaceSelectBadge key="namespace" namespace={route.getNs()} />,
          <WithTooltip>{route.getHostnames().join(", ")}</WithTooltip>,
          <WithTooltip>{route.getParentRefs().map(formatParentReference).join(", ")}</WithTooltip>,
          <KubeObjectAge key="age" object={route} />,
        ]}
      />
    </SiblingsInTabLayout>
  );
}

export const GatewayRouteListView = observer(NonObservedGatewayRouteListView) as typeof NonObservedGatewayRouteListView;
