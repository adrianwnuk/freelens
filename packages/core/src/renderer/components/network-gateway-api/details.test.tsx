/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  BackendTLSPolicy,
  Gateway,
  GatewayClass,
  GRPCRoute,
  HTTPRoute,
  ReferenceGrant,
} from "@freelensapp/kube-object";
import { beforeEach, describe, expect, it, vi } from "vitest";
import directoryForKubeConfigsInjectable from "../../../common/app-paths/directory-for-kube-configs/directory-for-kube-configs.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import { Cluster } from "../../../common/cluster/cluster";
import hostedClusterInjectable from "../../cluster-frame-context/hosted-cluster.injectable";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import storesAndApisCanBeCreatedInjectable from "../../stores-apis-can-be-created.injectable";
import { renderFor } from "../test-utils/renderFor";
import { BackendTLSPolicyDetails } from "./backend-tls-policies";
import { GatewayClassDetails } from "./gateway-classes";
import { GatewayDetails } from "./gateways";
import { GRPCRouteDetails } from "./grpc-routes";
import { HTTPRouteDetails } from "./http-routes";
import { ReferenceGrantDetails } from "./reference-grants";

import type { KubeJsonApiDataFor } from "@freelensapp/kube-object";
import type { StrictReactNode } from "@freelensapp/utilities";

import type { RenderResult } from "@testing-library/react";

import type { DiRender } from "../test-utils/renderFor";

vi.mock("@freelensapp/routing", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@freelensapp/routing")>()),
  Link: ({ to, children }: { to: string; children: StrictReactNode }) => <a href={to}>{children}</a>,
}));

const clusterMetadata = (name: string, resource: string) => ({
  name,
  resourceVersion: "1",
  uid: `${resource}-${name}`,
  selfLink: `/apis/gateway.networking.k8s.io/v1/${resource}/${name}`,
});

const namespacedMetadata = (name: string, namespace: string, resource: string) => ({
  name,
  namespace,
  resourceVersion: "1",
  uid: `${resource}-${name}`,
  selfLink: `/apis/gateway.networking.k8s.io/v1/namespaces/${namespace}/${resource}/${name}`,
});

/**
 * The objects that the links around a text lead to the details of. A text in a tooltip shows up twice.
 */
function linkTargets(result: RenderResult, text: string) {
  const targets = result
    .getAllByText(text)
    .map((element) => element.closest("a")?.getAttribute("href"))
    .map((href) => (href ? new URLSearchParams(href).get("kube-details") : undefined));

  return [...new Set(targets)];
}

describe("Gateway API details", () => {
  let render: DiRender;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");
    di.override(directoryForKubeConfigsInjectable, () => "/some-kube-configs");
    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    di.override(
      hostedClusterInjectable,
      () =>
        new Cluster({
          contextName: "some-context-name",
          id: "some-cluster-id",
          kubeConfigPath: "/some-path-to-a-kubeconfig",
        }),
    );

    render = renderFor(di);
  });

  describe("GatewayClassDetails", () => {
    const gatewayClass = new GatewayClass({
      apiVersion: "gateway.networking.k8s.io/v1",
      kind: "GatewayClass",
      metadata: clusterMetadata("example", "gatewayclasses"),
      spec: {
        controllerName: "example.com/gateway-controller",
        description: "The example gateways",
        parametersRef: { group: "", kind: "ConfigMap", name: "gateway-config", namespace: "infra" },
      },
      status: {
        conditions: [
          {
            type: "Accepted",
            status: "True",
            reason: "Accepted",
            message: "Handled by the example controller",
            lastTransitionTime: "2026-01-01T00:00:00Z",
          },
        ],
        supportedFeatures: [{ name: "Gateway" }, { name: "HTTPRoute" }],
      },
    });

    it("renders", () => {
      const result = render(<GatewayClassDetails object={gatewayClass} />);

      expect(result.baseElement).toMatchSnapshot();
    });

    it("links to its parameters", () => {
      const result = render(<GatewayClassDetails object={gatewayClass} />);

      expect(linkTargets(result, "ConfigMap gateway-config")).toEqual([
        "/api/v1/namespaces/infra/configmaps/gateway-config",
      ]);
    });
  });

  describe("GatewayDetails", () => {
    const gatewayData: KubeJsonApiDataFor<Gateway> = {
      apiVersion: "gateway.networking.k8s.io/v1",
      kind: "Gateway",
      metadata: namespacedMetadata("public", "infra", "gateways"),
      spec: {
        gatewayClassName: "example",
        listeners: [
          { name: "http", protocol: "HTTP", port: 80 },
          {
            name: "https",
            protocol: "HTTPS",
            port: 443,
            hostname: "*.example.com",
            tls: { certificateRefs: [{ name: "wildcard-cert" }] },
            allowedRoutes: { namespaces: { from: "All" }, kinds: [{ kind: "HTTPRoute" }] },
          },
        ],
      },
      status: {
        addresses: [{ type: "IPAddress", value: "203.0.113.7" }],
        conditions: [{ type: "Programmed", status: "True", reason: "Programmed" }],
        listeners: [
          { name: "http", attachedRoutes: 1, conditions: [{ type: "Accepted", status: "True" }] },
          { name: "https", attachedRoutes: 3, conditions: [{ type: "ResolvedRefs", status: "False" }] },
        ],
      },
    };
    const gateway = new Gateway(gatewayData);

    it("renders", () => {
      const result = render(<GatewayDetails object={gateway} />);

      expect(result.baseElement).toMatchSnapshot();
    });

    it("links to its class and to the certificate of a listener", () => {
      const result = render(<GatewayDetails object={gateway} />);

      expect(linkTargets(result, "example")).toEqual(["/apis/gateway.networking.k8s.io/v1/gatewayclasses/example"]);
      expect(linkTargets(result, "wildcard-cert")).toEqual(["/api/v1/namespaces/infra/secrets/wildcard-cert"]);
    });

    it("renders before its controller reports a status", () => {
      const result = render(<GatewayDetails object={new Gateway({ ...gatewayData, status: undefined })} />);

      expect(result.getByText("Listeners")).toBeInTheDocument();
      expect(result.queryByText("Addresses")).not.toBeInTheDocument();
    });
  });

  describe("HTTPRouteDetails", () => {
    const routeData: KubeJsonApiDataFor<HTTPRoute> = {
      apiVersion: "gateway.networking.k8s.io/v1",
      kind: "HTTPRoute",
      metadata: namespacedMetadata("shop", "default", "httproutes"),
      spec: {
        parentRefs: [{ name: "public", namespace: "infra", sectionName: "https" }],
        hostnames: ["shop.example.com"],
        rules: [
          {
            matches: [{ path: { type: "PathPrefix", value: "/api" }, method: "GET" }],
            filters: [{ type: "RequestHeaderModifier", requestHeaderModifier: { set: [{ name: "x-a", value: "b" }] } }],
            backendRefs: [
              { name: "api", port: 8080, weight: 90 },
              { name: "api-canary", port: 8080, weight: 10 },
            ],
          },
          { name: "everything-else", backendRefs: [{ name: "web", port: 80 }] },
        ],
      },
      status: {
        parents: [
          {
            parentRef: { name: "public", namespace: "infra", sectionName: "https" },
            controllerName: "example.com/gateway-controller",
            conditions: [
              { type: "Accepted", status: "True", reason: "Accepted" },
              { type: "ResolvedRefs", status: "True", reason: "ResolvedRefs" },
            ],
          },
        ],
      },
    };
    const route = new HTTPRoute(routeData);

    it("renders", () => {
      const result = render(<HTTPRouteDetails object={route} />);

      expect(result.baseElement).toMatchSnapshot();
    });

    it("links to its parent Gateway and to its backend Services", () => {
      const result = render(<HTTPRouteDetails object={route} />);

      // Among the parents, and in the status the Gateway reports for the route
      expect(linkTargets(result, "infra/public (https)")).toEqual([
        "/apis/gateway.networking.k8s.io/v1/namespaces/infra/gateways/public",
      ]);
      expect(linkTargets(result, "api:8080")).toEqual(["/api/v1/namespaces/default/services/api"]);
      expect(result.getByText("GET PathPrefix /api")).toBeInTheDocument();
      expect(result.getByText("Any request")).toBeInTheDocument();
      expect(result.getByText("Filters: RequestHeaderModifier")).toBeInTheDocument();
    });

    it("renders a route with an empty spec", () => {
      const result = render(<HTTPRouteDetails object={new HTTPRoute({ ...routeData, spec: {}, status: undefined })} />);

      expect(result.queryByText("Rules")).not.toBeInTheDocument();
      expect(result.queryByText("Status")).not.toBeInTheDocument();
    });
  });

  describe("GRPCRouteDetails", () => {
    it("renders", () => {
      const route = new GRPCRoute({
        apiVersion: "gateway.networking.k8s.io/v1",
        kind: "GRPCRoute",
        metadata: namespacedMetadata("echo", "default", "grpcroutes"),
        spec: {
          parentRefs: [{ name: "public", namespace: "infra" }],
          rules: [
            {
              matches: [{ method: { service: "echo.Echo", method: "Ping" } }],
              backendRefs: [{ name: "echo", port: 9000 }],
            },
          ],
        },
      });

      const result = render(<GRPCRouteDetails object={route} />);

      expect(result.getByText("echo.Echo/Ping")).toBeInTheDocument();
      expect(linkTargets(result, "echo:9000")).toEqual(["/api/v1/namespaces/default/services/echo"]);
      expect(result.baseElement).toMatchSnapshot();
    });
  });

  describe("ReferenceGrantDetails", () => {
    it("renders", () => {
      const grant = new ReferenceGrant({
        apiVersion: "gateway.networking.k8s.io/v1",
        kind: "ReferenceGrant",
        metadata: namespacedMetadata("allow-shop", "backends", "referencegrants"),
        spec: {
          from: [{ group: "gateway.networking.k8s.io", kind: "HTTPRoute", namespace: "default" }],
          to: [
            { group: "", kind: "Service" },
            { group: "", kind: "Secret", name: "shop-cert" },
          ],
        },
      });

      const result = render(<ReferenceGrantDetails object={grant} />);

      expect(result.getByText("(all)", { exact: false })).toBeInTheDocument();
      expect(linkTargets(result, "shop-cert")).toEqual(["/api/v1/namespaces/backends/secrets/shop-cert"]);
      expect(result.baseElement).toMatchSnapshot();
    });
  });

  describe("BackendTLSPolicyDetails", () => {
    it("renders", () => {
      const policy = new BackendTLSPolicy({
        apiVersion: "gateway.networking.k8s.io/v1",
        kind: "BackendTLSPolicy",
        metadata: namespacedMetadata("api-tls", "default", "backendtlspolicies"),
        spec: {
          targetRefs: [{ group: "", kind: "Service", name: "api", sectionName: "https" }],
          validation: {
            hostname: "api.internal",
            caCertificateRefs: [{ group: "", kind: "ConfigMap", name: "internal-ca" }],
            subjectAltNames: [{ type: "Hostname", hostname: "api.internal" }],
          },
        },
        status: {
          ancestors: [
            {
              ancestorRef: { name: "public", namespace: "infra" },
              controllerName: "example.com/gateway-controller",
              conditions: [{ type: "Accepted", status: "True", reason: "Accepted" }],
            },
          ],
        },
      });

      const result = render(<BackendTLSPolicyDetails object={policy} />);

      expect(linkTargets(result, "api")).toEqual(["/api/v1/namespaces/default/services/api"]);
      expect(linkTargets(result, "internal-ca")).toEqual(["/api/v1/namespaces/default/configmaps/internal-ca"]);
      expect(linkTargets(result, "infra/public")).toEqual([
        "/apis/gateway.networking.k8s.io/v1/namespaces/infra/gateways/public",
      ]);
      expect(result.baseElement).toMatchSnapshot();
    });
  });
});
