/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { formatGroupKind } from "@freelensapp/kube-object";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { KubeObjectAge } from "../../kube-object/age";
import { KubeObjectListLayout } from "../../kube-object-list-layout";
import { SiblingsInTabLayout } from "../../layout/siblings-in-tab-layout";
import { NamespaceSelectBadge } from "../../namespaces/namespace-select-badge";
import { WithTooltip } from "../../with-tooltip";
import styles from "../list-view.module.scss";
import referenceGrantStoreInjectable from "./store.injectable";

import type { ReferenceGrant } from "@freelensapp/kube-object";

import type { ReferenceGrantStore } from "./store";

enum columnId {
  name = "name",
  namespace = "namespace",
  from = "from",
  to = "to",
  age = "age",
}

interface Dependencies {
  store: ReferenceGrantStore;
}

const formatFrom = (grant: ReferenceGrant) =>
  grant.getFrom().map((from) => `${formatGroupKind(from)} in ${from.namespace}`);

const formatTo = (grant: ReferenceGrant) =>
  grant.getTo().map((to) => (to.name ? `${formatGroupKind(to)} ${to.name}` : formatGroupKind(to)));

const NonInjectedReferenceGrants = observer(({ store }: Dependencies) => (
  <SiblingsInTabLayout>
    <KubeObjectListLayout
      isConfigurable
      tableId="network_reference_grants"
      className="ReferenceGrants"
      store={store}
      sortingCallbacks={{
        [columnId.name]: (grant) => grant.getName(),
        [columnId.namespace]: (grant) => grant.getNs(),
        [columnId.age]: (grant) => -grant.getCreationTimestamp(),
      }}
      searchFilters={[(grant) => grant.getSearchFields(), formatFrom, formatTo]}
      renderHeaderTitle="Reference Grants"
      renderTableHeader={[
        { title: "Name", className: styles.name, sortBy: columnId.name, id: columnId.name },
        { title: "Namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "From", className: styles.wide, id: columnId.from },
        { title: "To", className: styles.wide, id: columnId.to },
        { title: "Age", className: styles.age, sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={(grant) => [
        <WithTooltip>{grant.getName()}</WithTooltip>,
        <NamespaceSelectBadge key="namespace" namespace={grant.getNs()} />,
        <WithTooltip>{formatFrom(grant).join(", ")}</WithTooltip>,
        <WithTooltip>{formatTo(grant).join(", ")}</WithTooltip>,
        <KubeObjectAge key="age" object={grant} />,
      ]}
    />
  </SiblingsInTabLayout>
));

export const ReferenceGrants = withInjectables<Dependencies>(NonInjectedReferenceGrants, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(referenceGrantStoreInjectable),
  }),
});
