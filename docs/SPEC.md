# EnvParity specification

## User journey

1. A developer opens a realistic Next.js sample containing server and browser environment references.
2. They paste source text, a committed `.env.example`, and value-free key lists for development, preview, and production.
3. They run the coverage check. EnvParity shows missing scope keys, undocumented usage, stale contract keys, and public-name hazards.
4. They inspect a per-key coverage matrix and copy a deterministic `env-parity.json` contract.
5. They can send feedback or request the Team pilot without the pasted material leaving the browser.

## Functional requirements

- Validate all inputs with a shared Zod schema. Source is required and capped at 200,000 characters; each manifest is capped at 75,000.
- Extract static `process.env.KEY`, bracket access, `import.meta.env.KEY`, `Deno.env.get("KEY")`, and `Bun.env.KEY` references with source lines.
- Parse key-only lists and dotenv syntax while discarding everything after `=`.
- Report:
  - `ENV001` high: a used key is missing from production.
  - `ENV002` medium: a used key is missing from preview.
  - `ENV003` medium: a used key is missing from development.
  - `ENV004` medium: a used key is absent from the committed contract.
  - `ENV005` high: a `NEXT_PUBLIC_` key name contains a sensitive signal.
  - `ENV006` notice: a contract key is not statically referenced in the supplied source.
- Render used, contract, development, preview, and production coverage for each key.
- Generate stable JSON containing version, sorted required keys, public keys, per-scope keys, and no values.
- Provide sample, clear, copy-contract, feedback, and Team-pilot actions.

## Non-functional constraints

- Process all inputs in the browser. Do not send source, keys, or values in analytics, URLs, logs, or requests.
- Never render or include text after `=` from a manifest line.
- Responsive at 320px without page-level horizontal overflow; the matrix may scroll inside its container.
- Maintain visible focus and 44px minimum interactive targets.
- A clear report means only that implemented static coverage checks found no issue.

## Analytics and monetization

Emit event names only: `workbench_viewed`, `contract_analyzed`, `contract_copied`, `team_interest`, and `feedback_intent`. Without `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, events remain browser events.

The Team tier is a `[TARGET]` $15 per team/month hypothesis. `NEXT_PUBLIC_TEAM_URL` enables a future checkout; the default opens a prefilled pilot email.

## Threat considerations

- Users may paste dotenv files containing values despite the instruction. The parser discards values before analysis and no input is transmitted.
- Generated JSON must contain key names only.
- Bound input size to limit browser work.
- Apply restrictive response headers and deny framing, camera, microphone, and geolocation.

## Acceptance checks

- The supplied sample produces missing-scope, undocumented, stale-contract, and public-name findings.
- A complete four-scope contract returns no blocking findings.
- Every supported accessor reports the correct key and line.
- Values pasted after `=` never appear in the report or generated JSON.
- Invalid and empty source input gives a specific recovery action.
- Format, lint, typecheck, tests, build, audit, secret scan, runtime journey, and signature gate pass.

## Non-goals

- Connecting to Vercel, retrieving variables, storing secrets, or validating values.
- Proving that a deployment uses the intended value or permission model.
- Parsing computed keys, arbitrary wrapper functions, every framework, or minified bundles.
- Shipping repository integrations, accounts, billing, or hosted history in this release.
