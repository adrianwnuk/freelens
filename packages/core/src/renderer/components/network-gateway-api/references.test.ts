/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { describe, expect, it } from "vitest";
import { formatBackendReference, formatParentReference } from "./references";

describe("formatParentReference()", () => {
  it("shows a Gateway by its name, which is the default parent", () => {
    expect(formatParentReference({ name: "gw" })).toBe("gw");
    expect(formatParentReference({ group: "gateway.networking.k8s.io", kind: "Gateway", name: "gw" })).toBe("gw");
  });

  it("adds the namespace, the listener and the port when they are set", () => {
    expect(formatParentReference({ name: "gw", namespace: "infra", sectionName: "https", port: 443 })).toBe(
      "infra/gw (https, port 443)",
    );
    expect(formatParentReference({ name: "gw", port: 0 })).toBe("gw (port 0)");
  });

  it("names the kind of a parent that is not a Gateway", () => {
    expect(formatParentReference({ group: "", kind: "Service", name: "web" })).toBe("Service web");
  });
});

describe("formatBackendReference()", () => {
  it("shows a Service, which is the default backend, by its name and port", () => {
    expect(formatBackendReference({ name: "web", port: 8080 })).toBe("web:8080");
    expect(formatBackendReference({ group: "", kind: "Service", name: "web", namespace: "shop" })).toBe("shop/web");
  });

  it("names the kind of a backend that is not a Service", () => {
    expect(formatBackendReference({ group: "example.com", kind: "Bucket", name: "assets" })).toBe("Bucket assets");
  });
});
