/**
 * @project  EnvParity — iamuvin.com
 * @author   Uvin Vindula (IAMUVIN)
 * @website  https://iamuvin.com
 * @company  ASI Research Labs — asiresearch.io
 * @built    2026
 * @license  Proprietary — all rights reserved
 */

import type { ContractInput } from "@/lib/schemas/contract";
import type {
  ContractReport,
  CoverageRow,
  EnvironmentReference,
  Finding,
} from "@/lib/contract/types";

const accessors = [
  /\bprocess\.env\.([A-Za-z_][A-Za-z0-9_]*)\b/g,
  /\bprocess\.env\s*\[\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\]/g,
  /\bimport\.meta\.env\.([A-Za-z_][A-Za-z0-9_]*)\b/g,
  /\bDeno\.env\.get\(\s*["']([A-Za-z_][A-Za-z0-9_]*)["']\s*\)/g,
  /\bBun\.env\.([A-Za-z_][A-Za-z0-9_]*)\b/g,
];

const sensitivePublicSignal =
  /(SECRET|TOKEN|PASSWORD|PRIVATE|SERVICE_ROLE|DATABASE_URL|CONNECTION_STRING|ADMIN)/i;
const severityRank = { high: 0, medium: 1, notice: 2 } as const;

interface ParsedManifest {
  keys: Map<string, number>;
  discardedValueLines: number;
}

export function extractEnvironmentReferences(
  source: string,
): EnvironmentReference[] {
  const references = new Map<string, Set<number>>();
  source.split(/\r?\n/).forEach((line, index) => {
    for (const accessor of accessors) {
      accessor.lastIndex = 0;
      for (const match of line.matchAll(accessor)) {
        const key = match[1];
        const lines = references.get(key) ?? new Set<number>();
        lines.add(index + 1);
        references.set(key, lines);
      }
    }
  });

  return [...references.entries()]
    .map(([key, lines]) => ({
      key,
      lines: [...lines].sort((left, right) => left - right),
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

export function parseKeyManifest(text: string): ParsedManifest {
  const keys = new Map<string, number>();
  let discardedValueLines = 0;

  text.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*(=|$)/,
    );
    if (!match) return;
    keys.set(match[1], keys.get(match[1]) ?? index + 1);
    if (match[2] === "=") discardedValueLines += 1;
  });

  return { keys, discardedValueLines };
}

function buildGeneratedContract(rows: CoverageRow[]): string {
  const used = rows.filter((row) => row.used);
  return JSON.stringify(
    {
      version: 1,
      required: used.map((row) => row.key),
      public: used.filter((row) => row.public).map((row) => row.key),
      scopes: {
        development: rows
          .filter((row) => row.development)
          .map((row) => row.key),
        preview: rows.filter((row) => row.preview).map((row) => row.key),
        production: rows.filter((row) => row.production).map((row) => row.key),
      },
    },
    null,
    2,
  );
}

export function analyzeContract(input: ContractInput): ContractReport {
  const references = extractEnvironmentReferences(input.source);
  const referenceMap = new Map(
    references.map((reference) => [reference.key, reference]),
  );
  const contract = parseKeyManifest(input.contract);
  const development = parseKeyManifest(input.development);
  const preview = parseKeyManifest(input.preview);
  const production = parseKeyManifest(input.production);
  const allKeys = new Set([
    ...referenceMap.keys(),
    ...contract.keys.keys(),
    ...development.keys.keys(),
    ...preview.keys.keys(),
    ...production.keys.keys(),
  ]);

  const coverage: CoverageRow[] = [...allKeys]
    .sort((left, right) => left.localeCompare(right))
    .map((key) => ({
      key,
      lines: referenceMap.get(key)?.lines ?? [],
      used: referenceMap.has(key),
      documented: contract.keys.has(key),
      development: development.keys.has(key),
      preview: preview.keys.has(key),
      production: production.keys.has(key),
      public: key.startsWith("NEXT_PUBLIC_"),
    }));

  const findings: Finding[] = [];
  for (const row of coverage) {
    const sourceLine = row.lines[0] ?? null;
    if (row.used && !row.production) {
      findings.push({
        rule: "ENV001",
        severity: "high",
        key: row.key,
        line: sourceLine,
        title: "Used key is absent from production",
        detail: `${row.key} is referenced in source but missing from the production key list.`,
        repair:
          "Add the key to the Vercel production scope and create a new deployment.",
      });
    }
    if (row.used && !row.preview) {
      findings.push({
        rule: "ENV002",
        severity: "medium",
        key: row.key,
        line: sourceLine,
        title: "Used key is absent from preview",
        detail: `${row.key} is referenced in source but missing from the preview key list.`,
        repair:
          "Add the key to preview or document why preview must not exercise this path.",
      });
    }
    if (row.used && !row.development) {
      findings.push({
        rule: "ENV003",
        severity: "medium",
        key: row.key,
        line: sourceLine,
        title: "Used key is absent from development",
        detail: `${row.key} is referenced in source but missing from the development key list.`,
        repair:
          "Add a development value through Vercel or document the local fallback.",
      });
    }
    if (row.used && !row.documented) {
      findings.push({
        rule: "ENV004",
        severity: "medium",
        key: row.key,
        line: sourceLine,
        title: "Used key is missing from the contract",
        detail: `${row.key} is referenced in source but absent from the committed key contract.`,
        repair:
          "Add the key name to .env.example or the team contract without adding a value.",
      });
    }
    if (row.used && row.public && sensitivePublicSignal.test(row.key)) {
      findings.push({
        rule: "ENV005",
        severity: "high",
        key: row.key,
        line: sourceLine,
        title: "Public key name carries a sensitive signal",
        detail: `${row.key} is browser-exposed by convention and its name suggests privileged material.`,
        repair:
          "Move privileged access behind a server-only variable, or verify that the value is intentionally public.",
      });
    }
    if (!row.used && row.documented) {
      findings.push({
        rule: "ENV006",
        severity: "notice",
        key: row.key,
        line: contract.keys.get(row.key) ?? null,
        title: "Contract key has no static source reference",
        detail: `${row.key} is documented but not referenced by a supported accessor in this source sample.`,
        repair:
          "Confirm another service or dynamic accessor needs it before removing the contract entry.",
      });
    }
  }

  findings.sort(
    (left, right) =>
      severityRank[left.severity] - severityRank[right.severity] ||
      (left.line ?? Number.MAX_SAFE_INTEGER) -
        (right.line ?? Number.MAX_SAFE_INTEGER) ||
      left.rule.localeCompare(right.rule),
  );

  return {
    references,
    coverage,
    findings,
    generatedContract: buildGeneratedContract(coverage),
    discardedValueLines:
      contract.discardedValueLines +
      development.discardedValueLines +
      preview.discardedValueLines +
      production.discardedValueLines,
  };
}
