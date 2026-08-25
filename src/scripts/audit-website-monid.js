import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { site } from "../../site.config.js";

const DEFAULT_OUTPUT_DIR = path.resolve("reports/website-audit");
const DEFAULT_URL = site.links.siteUrl;

export const AUDIT_PROVIDERS = {
  performance: {
    label: "Mobile performance and Core Web Vitals",
    provider: "api.strale.io",
    endpoint: "/x402/page-speed-test",
    price: 0.059401,
    query(url, strategy) {
      return { url, strategy };
    },
  },
  site: {
    label: "SEO, accessibility, metadata, links, and images",
    provider: "api.kadec0.xyz",
    endpoint: "/v1/website-audit",
    price: 0.088,
    query(url) {
      return { url };
    },
  },
};

export function parseArguments(argv) {
  const options = {
    confirmSpend: false,
    mode: "full",
    outputDir: DEFAULT_OUTPUT_DIR,
    strategy: "mobile",
    url: DEFAULT_URL,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--confirm-spend") {
      options.confirmSpend = true;
      continue;
    }

    if (["--mode", "--output-dir", "--strategy", "--url"].includes(argument)) {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} requires a value.`);
      index += 1;

      if (argument === "--mode") options.mode = value;
      if (argument === "--output-dir") options.outputDir = path.resolve(value);
      if (argument === "--strategy") options.strategy = value;
      if (argument === "--url") options.url = value;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  if (!["full", "performance", "site"].includes(options.mode)) {
    throw new Error("--mode must be full, performance, or site.");
  }

  if (!["mobile", "desktop"].includes(options.strategy)) {
    throw new Error("--strategy must be mobile or desktop.");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(options.url);
  } catch {
    throw new Error("--url must be a valid http or https URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("--url must use http or https.");
  }

  options.url = parsedUrl.toString();
  return options;
}

function selectedAudits(mode) {
  if (mode === "full") return ["performance", "site"];
  return [mode];
}

export function calculateMaximumCost(mode) {
  return selectedAudits(mode).reduce(
    (total, auditName) => total + AUDIT_PROVIDERS[auditName].price,
    0,
  );
}

function timestampForFile(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function runMonidAudit(name, options, runDirectory) {
  const audit = AUDIT_PROVIDERS[name];
  const outputFile = path.join(runDirectory, `${name}-output.json`);
  const args = [
    "run",
    "--provider",
    audit.provider,
    "--endpoint",
    audit.endpoint,
    "--query",
    JSON.stringify(audit.query(options.url, options.strategy)),
    "--wait",
    "120",
    "--output",
    outputFile,
    "--json",
  ];

  try {
    const stdout = execFileSync("monid", args, {
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
      maxBuffer: 30 * 1024 * 1024,
    });
    const run = JSON.parse(stdout);
    const output = fs.existsSync(outputFile)
      ? JSON.parse(fs.readFileSync(outputFile, "utf8"))
      : run.output;

    return {
      name,
      label: audit.label,
      endpoint: `${audit.provider}${audit.endpoint}`,
      status: run.status || "COMPLETED",
      runId: run.runId || null,
      cost: run.cost || null,
      output,
    };
  } catch (error) {
    const stdout = String(error.stdout || "").trim();
    const stderr = String(error.stderr || "").trim();
    let message = stderr || stdout || error.message;

    try {
      const parsed = JSON.parse(stdout);
      message = parsed.error?.message || parsed.message || message;
    } catch {
      // Preserve the CLI error text when it is not JSON.
    }

    return {
      name,
      label: audit.label,
      endpoint: `${audit.provider}${audit.endpoint}`,
      status: "PROVIDER_ERROR",
      runId: null,
      cost: null,
      output: null,
      error: message,
    };
  }
}

function normalizedKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findValue(input, candidateKeys) {
  const targets = new Set(candidateKeys.map(normalizedKey));
  const queue = [input];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;

    for (const [key, value] of Object.entries(current)) {
      if (targets.has(normalizedKey(key)) && value !== null && typeof value !== "object") {
        return value;
      }

      if (value && typeof value === "object") queue.push(value);
    }
  }

  return null;
}

function collectIssueLikeItems(input) {
  const issueKeys = new Set(
    ["issues", "opportunities", "recommendations", "warnings", "diagnostics"].map(normalizedKey),
  );
  const items = [];
  const queue = [input];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;

    for (const [key, value] of Object.entries(current)) {
      if (issueKeys.has(normalizedKey(key)) && Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string") items.push(item);
          if (item && typeof item === "object") {
            const title =
              item.title || item.name || item.message || item.description || item.explanation;
            if (title) items.push(String(title));
          }
        }
      } else if (value && typeof value === "object") {
        queue.push(value);
      }
    }
  }

  return [...new Set(items)].slice(0, 20);
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "Not reported";
  if (typeof value === "number" && value > 0 && value <= 1) {
    return `${Math.round(value * 100)}`;
  }
  return String(value);
}

export function summarizeAuditResult(result) {
  if (!result.output) {
    return {
      score: null,
      metrics: {},
      issues: [],
    };
  }

  return {
    score: findValue(result.output, [
      "performanceScore",
      "auditScore",
      "overallScore",
      "score",
    ]),
    metrics: {
      LCP: findValue(result.output, ["largestContentfulPaint", "lcp"]),
      INP: findValue(result.output, ["interactionToNextPaint", "inp"]),
      CLS: findValue(result.output, ["cumulativeLayoutShift", "cls"]),
      FCP: findValue(result.output, ["firstContentfulPaint", "fcp"]),
      TBT: findValue(result.output, ["totalBlockingTime", "tbt"]),
      "Speed Index": findValue(result.output, ["speedIndex"]),
    },
    issues: collectIssueLikeItems(result.output),
  };
}

export function buildMarkdownReport({ options, results, generatedAt = new Date() }) {
  const completed = results.filter((result) => result.status === "COMPLETED");
  const failures = results.filter((result) => result.status !== "COMPLETED");
  const actualCost = results.reduce(
    (total, result) => total + Number(result.cost?.value || 0),
    0,
  );
  const lines = [
    "# The Life Place Website Audit",
    "",
    `- URL: ${options.url}`,
    `- Generated: ${generatedAt.toISOString()}`,
    `- Mode: ${options.mode}`,
    `- Strategy: ${options.strategy}`,
    `- Completed providers: ${completed.length}/${results.length}`,
    `- Actual Monid cost: $${actualCost.toFixed(6)}`,
    "",
    "## Executive Summary",
    "",
  ];

  if (completed.length === 0) {
    lines.push(
      "No provider completed successfully. No technical score is assigned because doing so would create false confidence.",
      "",
    );
  } else if (failures.length > 0) {
    lines.push(
      "The audit is partial. Review completed provider findings, but do not treat this as a complete accessibility or performance assessment.",
      "",
    );
  } else {
    lines.push(
      "All selected Monid providers completed. Raw outputs are stored beside this report for verification.",
      "",
    );
  }

  for (const result of results) {
    const summary = summarizeAuditResult(result);
    lines.push(`## ${result.label}`, "", `- Status: ${result.status}`);
    lines.push(`- Endpoint: ${result.endpoint}`);
    if (result.runId) lines.push(`- Run ID: ${result.runId}`);
    if (result.cost) {
      lines.push(`- Cost: ${result.cost.value} ${result.cost.currency}`);
    }

    if (result.error) {
      lines.push("", `Provider error: ${result.error}`, "");
      continue;
    }

    lines.push(`- Reported score: ${displayValue(summary.score)}`, "");

    const metrics = Object.entries(summary.metrics).filter(([, value]) => value !== null);
    if (metrics.length > 0) {
      lines.push("### Metrics", "", "| Metric | Value |", "|---|---|");
      for (const [name, value] of metrics) {
        lines.push(`| ${name} | ${displayValue(value)} |`);
      }
      lines.push("");
    }

    lines.push("### Findings", "");
    if (summary.issues.length === 0) {
      lines.push("No structured issue list was returned. Inspect the raw provider output.", "");
    } else {
      for (const issue of summary.issues) lines.push(`- ${issue}`);
      lines.push("");
    }
  }

  lines.push(
    "## Required Manual Verification",
    "",
    "Monid results must be verified against the implementation before fixes are made:",
    "",
    "- Keyboard navigation and visible focus states",
    "- Form labels, validation, and error announcements",
    "- Mobile overflow and 44 by 44 pixel touch targets",
    "- Text and interactive-control contrast",
    "- Heading hierarchy and landmark structure",
    "- Image descriptions and decorative-image handling",
    "- Reduced-motion behavior",
    "",
  );

  return `${lines.join("\n")}\n`;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const maximumCost = calculateMaximumCost(options.mode);

  if (!options.confirmSpend) {
    throw new Error(
      `This audit can spend up to $${maximumCost.toFixed(6)}. Re-run with --confirm-spend to continue.`,
    );
  }

  const runDirectory = path.join(options.outputDir, timestampForFile());
  fs.mkdirSync(runDirectory, { recursive: true });

  console.log(`Auditing ${options.url}`);
  console.log(`Maximum listed Monid cost: $${maximumCost.toFixed(6)}`);

  const results = [];
  for (const name of selectedAudits(options.mode)) {
    console.log(`Running ${AUDIT_PROVIDERS[name].label}...`);
    results.push(runMonidAudit(name, options, runDirectory));
  }

  const report = buildMarkdownReport({ options, results });
  const reportPath = path.join(runDirectory, "report.md");
  const metadataPath = path.join(runDirectory, "runs.json");
  fs.writeFileSync(reportPath, report);
  writeJson(metadataPath, results);

  console.log(`Report: ${path.relative(process.cwd(), reportPath)}`);

  if (results.some((result) => result.status !== "COMPLETED")) {
    process.exitCode = 1;
  }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  main().catch((error) => {
    console.error(`Website audit failed: ${error.message}`);
    process.exitCode = 1;
  });
}
