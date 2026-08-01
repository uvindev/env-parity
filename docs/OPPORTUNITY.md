# EnvParity opportunity brief

## Selection

EnvParity targets Next.js and Vercel teams checking environment-variable coverage before a preview or production deployment. Vercel separates development, preview, production, and branch-specific variables. Branch-specific preview variables override the general preview scope, and variable changes apply only to new deployments. The recurring job is structural: confirm that every source dependency is documented and present in every required scope before release.

Sources:

- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel deployment environments](https://vercel.com/docs/deployments/environments)
- [Vercel environment CLI](https://vercel.com/docs/cli/env)
- [Vercel secret rotation](https://vercel.com/docs/environment-variables/rotating-secrets)

EnvParity reads pasted source and key manifests locally, extracts supported environment references, and produces a five-column coverage matrix plus a value-free contract. It does not manage, retrieve, validate, or display secret values.

## Alternatives considered

| Candidate                         | Existing evidence                                                                                                           | First-release gap                                                                  | Decision                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------- |
| Vercel environment coverage       | Vercel documents separate scopes and branch overrides; Infisical lists paid secret-management plans                         | Source usage versus value-free key coverage across every scope                     | Selected                          |
| GitHub Actions security preflight | GitHub documents immutable action pins and least-privilege permissions; StepSecurity lists $16/contributing-developer/month | Crowded by GitHub CodeQL, StepSecurity, and open-source workflow scanners          | Rejected for competitive density  |
| Vercel cron release checker       | Vercel documents UTC-only schedules, no failed-run retry, duplicate delivery, locks, and idempotency                        | Schedule and handler checks have a weaker paid boundary beside monitoring products | Rejected for weaker paid boundary |

Commercial references accessed 2026-08-01: [Infisical pricing](https://infisical.com/pricing), [StepSecurity pricing](https://www.stepsecurity.io/pricing).

## Commercial boundary

The free release audits one source sample and four key manifests. The Team hypothesis is `[TARGET]` $15 per team/month for repository-wide CI enforcement, branch-specific scope policies, reviewed exceptions, and contract history. Demand, customers, completed payments, and revenue are unverified. Until a checkout URL exists, Team interest opens a pilot email.

## Risks

- Static extraction misses computed property names and unsupported framework accessors.
- Key coverage does not verify values, permissions, rotation, or successful deployment.
- Existing dotenv validators cover parts of the workflow.
- Willingness to pay for the proposed Team controls is `[UNVERIFIED]`.
