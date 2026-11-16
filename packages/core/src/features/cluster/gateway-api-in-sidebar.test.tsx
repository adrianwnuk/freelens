/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { sidebarItemsInjectable } from "@freelensapp/cluster-sidebar";
import { beforeEach, describe, expect, it } from "vitest";
import directoryForLensLocalStorageInjectable from "../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

import type { SidebarItemDeclaration } from "@freelensapp/cluster-sidebar";

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

const gatewayApiGroup = "gateway.networking.k8s.io";

describe("cluster - the Gateway API in the sidebar", () => {
  let builder: ApplicationBuilder;

  beforeEach(async () => {
    builder = getApplicationBuilder();
    builder.setEnvironmentToClusterFrame();
    builder.beforeWindowStart(({ windowDi }) => {
      windowDi.override(directoryForLensLocalStorageInjectable, () => "/some-directory-for-lens-local-storage");
    });

    await builder.render();
  });

  const findItem = (items: SidebarItemDeclaration[], id: string): SidebarItemDeclaration | undefined =>
    items.find((item) => item.id === id);
  const getNetwork = () => {
    const items = builder.applicationWindow.only.di.inject(sidebarItemsInjectable).get();

    return findItem(items, "sidebar-item-network");
  };
  const getGatewayApi = () => findItem(getNetwork()?.children ?? [], "sidebar-item-gateway-api");
  const idsOf = (items: SidebarItemDeclaration[] = []) => items.map((item) => item.id);

  it("groups the Gateway API resources in a group of their own under Network, after the ingresses", () => {
    const networkChildren = idsOf(getNetwork()?.children);

    expect(networkChildren.indexOf("sidebar-item-gateway-api")).toBe(
      networkChildren.indexOf("sidebar-item-ingress-classes") + 1,
    );
    expect(networkChildren).not.toContain("sidebar-item-gateways");
    expect(idsOf(getGatewayApi()?.children)).toEqual([
      "sidebar-item-gateway-classes",
      "sidebar-item-gateways",
      "sidebar-item-http-routes",
      "sidebar-item-grpc-routes",
      "sidebar-item-reference-grants",
      "sidebar-item-backend-tls-policies",
    ]);
  });

  it("hides the group on a cluster that does not serve the Gateway API", () => {
    expect(getGatewayApi()?.isVisible.get()).toBe(false);
  });

  describe("when the cluster serves some of the resources", () => {
    beforeEach(() => {
      builder.allowKubeResource({ group: gatewayApiGroup, apiName: "gateways" });
      builder.allowKubeResource({ group: gatewayApiGroup, apiName: "httproutes" });
    });

    it("shows the group with the resources the cluster serves", () => {
      const gatewayApi = getGatewayApi();

      expect(gatewayApi?.isVisible.get()).toBe(true);
      expect(idsOf(gatewayApi?.children.filter((child) => child.isVisible.get()))).toEqual([
        "sidebar-item-gateways",
        "sidebar-item-http-routes",
      ]);
    });
  });
});
