"use client";
import { useEffect, useState } from "react";
import { analyzeContract } from "@/lib/contract/analyze";
import { sampleInput } from "@/lib/contract/sample";
import type { ContractReport } from "@/lib/contract/types";
import { trackEvent } from "@/lib/analytics";
import {
  contractInputSchema,
  type ContractInput,
} from "@/lib/schemas/contract";

const manifestFields: Array<{
  key: keyof Omit<ContractInput, "source">;
  label: string;
}> = [
  { key: "contract", label: ".env.example" },
  { key: "development", label: "Development" },
  { key: "preview", label: "Preview" },
  { key: "production", label: "Production" },
];

export function Workbench() {
  const [input, setInput] = useState<ContractInput>(sampleInput);
  const [report, setReport] = useState<ContractReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  useEffect(() => {
    trackEvent("workbench_viewed");
  }, []);

  const update = (key: keyof ContractInput, value: string) =>
    setInput((current) => ({ ...current, [key]: value }));
  const runCheck = () => {
    const parsed = contractInputSchema.safeParse(input);
    if (!parsed.success) {
      setReport(null);
      setError(parsed.error.issues[0]?.message ?? "Check the supplied text.");
      return;
    }
    setReport(analyzeContract(parsed.data));
    setError(null);
    setCopyState("idle");
    trackEvent("contract_analyzed");
  };
  const copyContract = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report.generatedContract);
      setCopyState("copied");
      trackEvent("contract_copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <section id="desk" className="desk shell" aria-labelledby="desk-title">
      <div className="desk-heading">
        <div>
          <p className="label">Release input</p>
          <h2 id="desk-title">Environment coverage desk</h2>
        </div>
        <p className="local-mark">KEYS ONLY / LOCAL MEMORY</p>
      </div>
      <div className="input-grid">
        <div className="source-pane">
          <label htmlFor="source-code">
            Source code{" "}
            <span>{input.source.length.toLocaleString()} / 200,000</span>
          </label>
          <textarea
            id="source-code"
            value={input.source}
            onChange={(event) => update("source", event.target.value)}
            spellCheck={false}
          />
          <p>
            Supported: process.env, import.meta.env, Deno.env.get, and Bun.env
            static keys.
          </p>
        </div>
        <div className="manifest-grid">
          {manifestFields.map((field) => (
            <label key={field.key}>
              {field.label}
              <span>key names or dotenv lines</span>
              <textarea
                aria-label={field.label}
                value={input[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
                spellCheck={false}
              />
            </label>
          ))}
        </div>
      </div>
      <div className="desk-actions">
        <button className="button primary" type="button" onClick={runCheck}>
          Check environment coverage
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setInput(sampleInput);
            setReport(null);
            setError(null);
          }}
        >
          Restore sample
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setInput({
              source: "",
              contract: "",
              development: "",
              preview: "",
              production: "",
            });
            setReport(null);
            setError(null);
          }}
        >
          Clear
        </button>
        <p>
          Values after <code>=</code> are discarded before analysis.
        </p>
      </div>
      {error ? (
        <p className="input-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="report" aria-live="polite">
        {!report ? (
          <div className="empty">
            <span>00</span>
            <h3>No coverage run recorded</h3>
            <p>
              Use the sample to see missing scopes, contract drift, and a
              value-free JSON contract.
            </p>
          </div>
        ) : (
          <>
            <div className="scoreline">
              <div>
                <strong>{report.references.length}</strong>
                <span>used keys</span>
              </div>
              <div>
                <strong>
                  {
                    report.findings.filter(
                      (finding) => finding.severity !== "notice",
                    ).length
                  }
                </strong>
                <span>release findings</span>
              </div>
              <div>
                <strong>{report.discardedValueLines}</strong>
                <span>value lines discarded</span>
              </div>
            </div>
            {report.references.length === 0 ? (
              <div className="empty compact">
                <h3>No supported environment references found</h3>
                <p>
                  Paste unminified source containing a supported static
                  accessor.
                </p>
              </div>
            ) : null}
            {report.findings.length === 0 && report.references.length > 0 ? (
              <div className="clean">
                <h3>All used keys cover the supplied contract and scopes.</h3>
                <p>
                  Values, permissions, branch overrides, and deployed behavior
                  still require platform checks.
                </p>
              </div>
            ) : null}
            {report.coverage.length ? (
              <div className="matrix-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Used</th>
                      <th>Contract</th>
                      <th>Dev</th>
                      <th>Preview</th>
                      <th>Prod</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.coverage.map((row) => (
                      <tr key={row.key}>
                        <td>
                          <code>{row.key}</code>
                          {row.lines.length ? (
                            <small>line {row.lines.join(", ")}</small>
                          ) : null}
                        </td>
                        {[
                          row.used,
                          row.documented,
                          row.development,
                          row.preview,
                          row.production,
                        ].map((present, index) => (
                          <td
                            key={index}
                            className={present ? "present" : "absent"}
                          >
                            {present ? "YES" : "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {report.findings.length ? (
              <ol className="findings">
                {report.findings.map((finding, index) => (
                  <li key={`${finding.rule}-${finding.key}-${index}`}>
                    <div>
                      <span className={`severity ${finding.severity}`}>
                        {finding.severity}
                      </span>
                      <code>{finding.rule}</code>
                      {finding.line ? <span>line {finding.line}</span> : null}
                    </div>
                    <h3>{finding.title}</h3>
                    <p>{finding.detail}</p>
                    <p>
                      <strong>Repair:</strong> {finding.repair}
                    </p>
                  </li>
                ))}
              </ol>
            ) : null}
            <div className="contract-output">
              <div>
                <div>
                  <p className="label">Generated artifact</p>
                  <h3>env-parity.json</h3>
                </div>
                <button
                  className="button secondary"
                  type="button"
                  onClick={copyContract}
                >
                  Copy contract
                </button>
              </div>
              <pre>
                <code>{report.generatedContract}</code>
              </pre>
              <p
                className={copyState === "failed" ? "copy-error" : "copy-note"}
              >
                {copyState === "copied"
                  ? "Copied. Commit the key-only contract for review."
                  : copyState === "failed"
                    ? "Clipboard access failed. Select the JSON and copy it manually."
                    : "The artifact contains key names only."}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
