import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMarkdownReport,
  calculateMaximumCost,
  parseArguments,
  summarizeAuditResult,
} from "../src/scripts/audit-website-monid.js";

test("requires valid, explicit audit options", () => {
  assert.deepEqual(parseArguments(["--mode", "performance", "--strategy", "desktop"]), {
    confirmSpend: false,
    mode: "performance",
    outputDir: new URL("../reports/website-audit", import.meta.url).pathname.replace(
      "/tests/../",
      "/",
    ),
    strategy: "desktop",
    url: "https://thelifeplace.org/",
  });

  assert.throws(() => parseArguments(["--mode", "unknown"]), /full, performance, or site/);
  assert.throws(() => parseArguments(["--url", "javascript:alert(1)"]), /http or https/);
});

test("calculates the maximum listed Monid cost", () => {
  assert.equal(calculateMaximumCost("performance"), 0.059401);
  assert.equal(calculateMaximumCost("site"), 0.088);
  assert.equal(calculateMaximumCost("full"), 0.147401);
});

test("extracts common scores, web vitals, and issue formats", () => {
  const summary = summarizeAuditResult({
    output: {
      performanceScore: 0.91,
      metrics: {
        largestContentfulPaint: "2.1 s",
        cumulativeLayoutShift: 0.04,
      },
      opportunities: [
        { title: "Serve images in next-generation formats" },
        "Reduce unused JavaScript",
      ],
    },
  });

  assert.equal(summary.score, 0.91);
  assert.equal(summary.metrics.LCP, "2.1 s");
  assert.equal(summary.metrics.CLS, 0.04);
  assert.deepEqual(summary.issues, [
    "Serve images in next-generation formats",
    "Reduce unused JavaScript",
  ]);
});

test("marks provider failures without inventing a health score", () => {
  const report = buildMarkdownReport({
    options: {
      mode: "full",
      strategy: "mobile",
      url: "https://thelifeplace.org/",
    },
    generatedAt: new Date("2026-07-28T08:00:00.000Z"),
    results: [
      {
        label: "Mobile performance",
        endpoint: "provider/endpoint",
        status: "PROVIDER_ERROR",
        error: "HTTP 502",
        output: null,
      },
    ],
  });

  assert.match(report, /No provider completed successfully/);
  assert.match(report, /Provider error: HTTP 502/);
  assert.doesNotMatch(report, /Audit Health Score: \d/);
});
