import test from "node:test";
import assert from "node:assert/strict";

import {
  getCanonicalPathname,
  normalizePathname,
} from "../src/utils/url-routing.js";

test("primary action routes use the Cloudflare-compatible trailing slash form", () => {
  for (const route of ["/live", "/give", "/visit"]) {
    assert.equal(getCanonicalPathname(route), `${route}/`);
    assert.equal(getCanonicalPathname(`${route}/`), `${route}/`);
  }
});

test("other routes retain the existing slashless canonical form", () => {
  assert.equal(getCanonicalPathname("/about-us"), "/about-us");
  assert.equal(getCanonicalPathname("/about-us/"), "/about-us");
  assert.equal(getCanonicalPathname("/"), "/");
});

test("normalization safely collapses repeated trailing slashes", () => {
  assert.equal(normalizePathname("/visit///"), "/visit");
  assert.equal(getCanonicalPathname("/visit///"), "/visit/");
});
