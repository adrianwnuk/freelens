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
import backendTlsPolicyStoreInjectable from "./store.injectable";

import type { BackendTLSPolicy } from "@freelensapp/kube-object";

import type { BackendTLSPolicyStore } from "./store";

enum columnId {
  name = "name",
  namespace = "namespace",
  targets = "targets",
  hostname = "hostname",
  age = "age",
}

interface Dependencies {
  store: BackendTLSPolicyStore;
}

const formatTargets = (policy: BackendTLSPolicy) =>
  policy.getTargetRefs().map(({ kind, name, sectionName }) => `${kind} ${name}${sectionName ? `:${sectionName}` : ""}`);

const NonInjectedBackendTLSPolicies = observer(({ store }: Dependencies) => (
  <SiblingsInTabLayout>
    <KubeObjectListLayout
      isConfigurable
      tableId="network_backend_tls_policies"
      className="BackendTLSPolicies"
      store={store}
      sortingCallbacks={{
        [columnId.name]: (policy) => policy.getName(),
        [columnId.namespace]: (policy) => policy.getNs(),
        [columnId.targets]: (policy) => formatTargets(policy).join(", "),
        [columnId.hostname]: (policy) => policy.getHostname() ?? "",
        [columnId.age]: (policy) => -policy.getCreationTimestamp(),
      }}
      searchFilters={[(policy) => policy.getSearchFields(), formatTargets, (policy) => policy.getHostname()]}
      renderHeaderTitle="Backend TLS Policies"
      renderTableHeader={[
        { title: "Name", className: styles.name, sortBy: columnId.name, id: columnId.name },
        { title: "Namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "Targets", className: styles.wide, sortBy: columnId.targets, id: columnId.targets },
        { title: "Hostname", className: styles.wide, sortBy: columnId.hostname, id: columnId.hostname },
        { title: "Age", className: styles.age, sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={(policy) => [
        <WithTooltip>{policy.getName()}</WithTooltip>,
        <NamespaceSelectBadge key="namespace" namespace={policy.getNs()} />,
        <WithTooltip>{formatTargets(policy).join(", ")}</WithTooltip>,
        <WithTooltip>{policy.getHostname()}</WithTooltip>,
        <KubeObjectAge key="age" object={policy} />,
      ]}
    />
  </SiblingsInTabLayout>
));

export const BackendTLSPolicies = withInjectables<Dependencies>(NonInjectedBackendTLSPolicies, {
  getProps: (di, props) => ({
    ...props,
    store: di.inject(backendTlsPolicyStoreInjectable),
  }),
});
