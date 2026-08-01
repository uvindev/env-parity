import { describe, expect, it } from "vitest";
import {
  analyzeContract,
  extractEnvironmentReferences,
  parseKeyManifest,
} from "@/lib/contract/analyze";
import { sampleInput } from "@/lib/contract/sample";

describe("environment reference extraction", () => {
  it("extracts every supported static accessor with source lines", () => {
    const references = extractEnvironmentReferences(`process.env.DATABASE_URL;
process.env["STRIPE_SECRET"];
import.meta.env.VITE_API_URL;
Deno.env.get('DENO_REGION');
Bun.env.BUN_PORT;`);
    expect(
      references.map((reference) => [reference.key, reference.lines[0]]),
    ).toEqual([
      ["BUN_PORT", 5],
      ["DATABASE_URL", 1],
      ["DENO_REGION", 4],
      ["STRIPE_SECRET", 2],
      ["VITE_API_URL", 3],
    ]);
  });

  it("deduplicates repeated keys while preserving every line", () => {
    const references = extractEnvironmentReferences(
      "process.env.PORT;\nprocess.env.PORT;",
    );
    expect(references).toEqual([{ key: "PORT", lines: [1, 2] }]);
  });

  it("ignores computed accessors", () => {
    expect(extractEnvironmentReferences("process.env[key];")).toEqual([]);
  });
});

describe("key manifest parsing", () => {
  it("keeps key names and discards dotenv values", () => {
    const parsed = parseKeyManifest(
      "# ignored\nexport DATABASE_URL=postgres://secret\nPORT=3000\nREGION",
    );
    expect([...parsed.keys.keys()]).toEqual(["DATABASE_URL", "PORT", "REGION"]);
    expect(parsed.discardedValueLines).toBe(2);
  });

  it("ignores malformed lines", () => {
    expect([
      ...parseKeyManifest("not a key=value\n=broken\nGOOD_KEY").keys.keys(),
    ]).toEqual(["GOOD_KEY"]);
  });
});

describe("environment coverage", () => {
  it("reports the supplied sample without retaining values", () => {
    const report = analyzeContract(sampleInput);
    expect(report.findings.map((finding) => finding.rule)).toEqual([
      "ENV001",
      "ENV001",
      "ENV005",
      "ENV002",
      "ENV004",
      "ENV004",
      "ENV006",
    ]);
    expect(report.generatedContract).not.toContain("postgres://");
    expect(report.discardedValueLines).toBe(3);
  });

  it("returns no findings for a complete contract", () => {
    const input = {
      source: "process.env.DATABASE_URL;",
      contract: "DATABASE_URL",
      development: "DATABASE_URL",
      preview: "DATABASE_URL",
      production: "DATABASE_URL",
    };
    expect(analyzeContract(input).findings).toEqual([]);
  });

  it("reports a development-only gap", () => {
    const input = {
      source: "process.env.PORT;",
      contract: "PORT",
      development: "",
      preview: "PORT",
      production: "PORT",
    };
    expect(
      analyzeContract(input).findings.map((finding) => finding.rule),
    ).toEqual(["ENV003"]);
  });

  it("flags public names with privileged signals", () => {
    const input = {
      source: "process.env.NEXT_PUBLIC_SERVICE_ROLE;",
      contract: "NEXT_PUBLIC_SERVICE_ROLE",
      development: "NEXT_PUBLIC_SERVICE_ROLE",
      preview: "NEXT_PUBLIC_SERVICE_ROLE",
      production: "NEXT_PUBLIC_SERVICE_ROLE",
    };
    expect(
      analyzeContract(input).findings.map((finding) => finding.rule),
    ).toEqual(["ENV005"]);
  });

  it("does not flag an ordinary public URL", () => {
    const input = {
      source: "process.env.NEXT_PUBLIC_APP_URL;",
      contract: "NEXT_PUBLIC_APP_URL",
      development: "NEXT_PUBLIC_APP_URL",
      preview: "NEXT_PUBLIC_APP_URL",
      production: "NEXT_PUBLIC_APP_URL",
    };
    expect(analyzeContract(input).findings).toEqual([]);
  });

  it("generates deterministic sorted key-only JSON", () => {
    const input = {
      source: "process.env.Z_KEY; process.env.A_KEY;",
      contract: "Z_KEY\nA_KEY",
      development: "Z_KEY\nA_KEY",
      preview: "Z_KEY\nA_KEY",
      production: "Z_KEY\nA_KEY",
    };
    const contract = JSON.parse(analyzeContract(input).generatedContract);
    expect(contract.required).toEqual(["A_KEY", "Z_KEY"]);
    expect(contract.scopes.production).toEqual(["A_KEY", "Z_KEY"]);
  });
});
