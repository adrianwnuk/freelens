/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { stopPropagation } from "@freelensapp/utilities";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import getMaybeDetailsUrlInjectable from "../kube-detail-params/get-maybe-details-url.injectable";
import { MaybeLink } from "../maybe-link";
import { WithTooltip } from "../with-tooltip";

import type { GatewayObjectReference, KubeObject } from "@freelensapp/kube-object";
import type { StrictReactNode } from "@freelensapp/utilities";

import type { ApiManager } from "../../../common/k8s-api/api-manager";
import type { GetMaybeDetailsUrl } from "../kube-detail-params/get-maybe-details-url.injectable";

export interface LinkToGatewayObjectProps {
  objectRef: GatewayObjectReference;
  /**
   * The object that holds the reference. A reference without a namespace points into its namespace.
   */
  object: KubeObject;
  /**
   * The group of the referenced object when the reference leaves it out. `""` is the core API group.
   */
  defaultGroup: string;
  /**
   * The kind of the referenced object when the reference leaves it out.
   */
  defaultKind: string;
  content?: StrictReactNode;
}

interface Dependencies {
  apiManager: ApiManager;
  getMaybeDetailsUrl: GetMaybeDetailsUrl;
}

/**
 * Links to the details of an object that a Gateway API reference names by group and kind.
 *
 * `ApiManager.lookupApiLink` needs an `apiVersion`, which these references do not carry, so the API is looked up by
 * group and kind among the registered ones. A reference to a kind no API is registered for renders as plain text.
 */
const NonInjectedLinkToGatewayObject = observer(
  ({
    objectRef,
    object,
    defaultGroup,
    defaultKind,
    content,
    apiManager,
    getMaybeDetailsUrl,
  }: LinkToGatewayObjectProps & Dependencies) => {
    const group = objectRef.group ?? defaultGroup;
    const kind = objectRef.kind || defaultKind;
    const api = apiManager.getApi((api) => api.kind === kind && api.apiGroup === group);
    const selfLink = api?.formatUrlForNotListing({
      name: objectRef.name,
      namespace: objectRef.namespace ?? object.getNs(),
    });

    return (
      <MaybeLink to={getMaybeDetailsUrl(selfLink)} onClick={stopPropagation}>
        <WithTooltip>{content ?? objectRef.name}</WithTooltip>
      </MaybeLink>
    );
  },
);

export const LinkToGatewayObject = withInjectables<Dependencies, LinkToGatewayObjectProps>(
  NonInjectedLinkToGatewayObject,
  {
    getProps: (di, props) => ({
      ...props,
      apiManager: di.inject(apiManagerInjectable),
      getMaybeDetailsUrl: di.inject(getMaybeDetailsUrlInjectable),
    }),
  },
);
