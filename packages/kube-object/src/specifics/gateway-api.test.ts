/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { describe, expect, it } from "vitest";
import { Gateway } from "./gateway";
import { formatGroupKind } from "./gateway-api";
import { GatewayClass } from "./gateway-class";
import { formatGRPCRouteMatch } from "./grpc-route";
import { formatHTTPRouteMatch, HTTPRoute } from "./http-route";

import type { GatewaySpec, GatewayStatus } from "./gateway";

const gateway = (spec: Partial<GatewaySpec> = {}, status?: GatewayStatus) =>
  new Gateway({
    apiVersion: "gateway.networking.k8s.io/v1",
    kind: "Gateway",
    metadata: {
      name: "gw",
      namespace: "infra",
      resourceVersion: "1",
      uid: "gw",
      selfLink: "/apis/gateway.networking.k8s.io/v1/namespaces/infra/gateways/gw",
    },
    spec: { gatewayClassName: "example", listeners: [], ...spec },
    status,
  });

describe("Gateway", () => {
  describe("getAddresses()", () => {
    it("lists the addresses its controller reports", () => {
      const subject = gateway(
        { addresses: [{ value: "10.0.0.1" }] },
        {
          addresses: [
            { type: "IPAddress", value: "203.0.113.7" },
            { type: "Hostname", value: "lb.example.com" },
          ],
        },
      );

      expect(subject.getAddresses()).toEqual(["203.0.113.7", "lb.example.com"]);
    });

    it("falls back to the requested addresses before the controller reports any", () => {
      expect(gateway({ addresses: [{ value: "10.0.0.1" }, {}] }).getAddresses()).toEqual(["10.0.0.1"]);
    });

    it("is empty when there are no addresses", () => {
      expect(gateway().getAddresses()).toEqual([]);
    });
  });

  it("finds the status of a listener by its name", () => {
    const subject = gateway(
      { listeners: [{ name: "http", port: 80, protocol: "HTTP" }] },
      { listeners: [{ name: "http", attachedRoutes: 2, conditions: [] }] },
    );

    expect(subject.getListenerStatus("http")?.attachedRoutes).toBe(2);
    expect(subject.getListenerStatus("https")).toBeUndefined();
  });

  it("reads the Programmed condition", () => {
    const programmed = { type: "Programmed", status: "True", reason: "Programmed" };

    expect(
      gateway({}, { conditions: [{ type: "Accepted", status: "True" }, programmed] }).getProgrammedCondition(),
    ).toBe(programmed);
    expect(gateway().getProgrammedCondition()).toBeUndefined();
  });
});

describe("GatewayClass", () => {
  it("has no supported features and no Accepted condition before its controller sees it", () => {
    const subject = new GatewayClass({
      apiVersion: "gateway.networking.k8s.io/v1",
      kind: "GatewayClass",
      metadata: {
        name: "example",
        resourceVersion: "1",
        uid: "example",
        selfLink: "/apis/gateway.networking.k8s.io/v1/gatewayclasses/example",
      },
      spec: { controllerName: "example.com/gateway-controller" },
    });

    expect(subject.getSupportedFeatures()).toEqual([]);
    expect(subject.getAcceptedCondition()).toBeUndefined();
  });
});

describe("HTTPRoute", () => {
  it("defaults its parents, hostnames, rules and parent statuses to empty", () => {
    const subject = new HTTPRoute({
      apiVersion: "gateway.networking.k8s.io/v1",
      kind: "HTTPRoute",
      metadata: {
        name: "web",
        namespace: "default",
        resourceVersion: "1",
        uid: "web",
        selfLink: "/apis/gateway.networking.k8s.io/v1/namespaces/default/httproutes/web",
      },
      spec: {},
    });

    expect(subject.getParentRefs()).toEqual([]);
    expect(subject.getHostnames()).toEqual([]);
    expect(subject.getRules()).toEqual([]);
    expect(subject.getParentStatuses()).toEqual([]);
  });
});

describe("formatHTTPRouteMatch()", () => {
  it("shows the path prefix / that the API defaults an empty match to", () => {
    expect(formatHTTPRouteMatch({})).toBe("PathPrefix /");
  });

  it("shows the method, the path, and the header and query parameter matches", () => {
    expect(
      formatHTTPRouteMatch({
        method: "GET",
        path: { type: "Exact", value: "/api" },
        headers: [{ name: "x-env", value: "prod" }],
        queryParams: [{ type: "RegularExpression", name: "id", value: "[0-9]+" }],
      }),
    ).toBe("GET Exact /api header:x-env=prod query:id~[0-9]+");
  });
});

describe("formatGRPCRouteMatch()", () => {
  it("shows a service and a method that the match leaves out as any", () => {
    expect(formatGRPCRouteMatch({})).toBe("*/*");
    expect(formatGRPCRouteMatch({ method: { service: "echo.Echo" } })).toBe("echo.Echo/*");
  });

  it("marks a regular expression and shows the header matches", () => {
    expect(
      formatGRPCRouteMatch({
        method: { type: "RegularExpression", service: "echo\\..*", method: "Get" },
        headers: [{ name: "x-env", value: "prod" }],
      }),
    ).toBe("echo\\..*/Get (regex) header:x-env=prod");
  });
});

describe("formatGroupKind()", () => {
  it("qualifies a kind with its group, but not for the core group", () => {
    expect(formatGroupKind({ group: "gateway.networking.k8s.io", kind: "HTTPRoute" })).toBe(
      "HTTPRoute.gateway.networking.k8s.io",
    );
    expect(formatGroupKind({ group: "", kind: "Service" })).toBe("Service");
  });
});
