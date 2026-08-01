import { Workbench } from "@/app/_components/workbench";
import { IntentLink } from "@/components/intent-link";

const email = "hello@iamuvin.com";
const configuredTeamUrl = process.env.NEXT_PUBLIC_TEAM_URL;
const teamUrl =
  configuredTeamUrl ||
  `mailto:${email}?subject=${encodeURIComponent("EnvParity Team pilot")}`;

export default function HomePage() {
  return (
    <main>
      <header className="site-header shell">
        <a className="wordmark" href="#top" aria-label="EnvParity home">
          <span>EP</span>EnvParity
        </a>
        <nav aria-label="Primary navigation">
          <a href="#desk">Coverage desk</a>
          <a href="#team">Team</a>
          <a href="#limits">Limits</a>
        </nav>
      </header>
      <section id="top" className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="label">Vercel environment release check</p>
          <h1 id="hero-title">
            The code expects a key. Which deployment has it?
          </h1>
          <p className="lede">
            Map static environment references against your committed contract,
            development, preview, and production scopes. EnvParity compares
            names in this tab and drops every pasted value.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#desk">
              Check the sample
            </a>
            <a className="text-link" href="#limits">
              Read the boundary
            </a>
          </div>
        </div>
        <aside className="scope-ledger" aria-label="Coverage dimensions">
          <p>RELEASE LEDGER / 0.1</p>
          <div>
            <span>01</span>
            <strong>Source usage</strong>
          </div>
          <div>
            <span>02</span>
            <strong>Committed contract</strong>
          </div>
          <div>
            <span>03–05</span>
            <strong>Development · Preview · Production</strong>
          </div>
          <small>Variable values are outside the report.</small>
        </aside>
      </section>
      <Workbench />
      <section className="evidence shell" aria-labelledby="evidence-title">
        <div>
          <p className="label">Why scope matters</p>
          <h2 id="evidence-title">
            Vercel variables belong to deployments, not the project in general.
          </h2>
        </div>
        <div>
          <p>
            Development, preview, production, and branch-specific preview scopes
            can carry different keys. A change applies to a new deployment; old
            deployments keep their previous environment.
          </p>
          <p>
            EnvParity checks structural coverage before that deployment. Use
            Vercel CLI and dashboard controls to verify values, sensitivity, and
            branch overrides.
          </p>
          <a
            href="https://vercel.com/docs/environment-variables"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read Vercel environment-variable behavior
          </a>
        </div>
      </section>
      <section id="team" className="team shell" aria-labelledby="team-title">
        <div>
          <p className="label">Commercial hypothesis</p>
          <h2 id="team-title">
            One project is free. Team policy belongs in every pull request.
          </h2>
          <p>
            The proposed Team tier adds repository-wide extraction,
            branch-specific scope rules, reviewed exceptions, and contract
            history. Price and demand remain unverified.
          </p>
        </div>
        <aside className="price">
          <span>TEAM / TARGET</span>
          <strong>$15</strong>
          <small>per team / month</small>
          <IntentLink
            className="button primary"
            event="team_interest"
            href={teamUrl}
          >
            {configuredTeamUrl
              ? "Open Team checkout"
              : "Request the Team pilot"}
          </IntentLink>
        </aside>
      </section>
      <section
        id="limits"
        className="limits shell"
        aria-labelledby="limits-title"
      >
        <p className="label">Coverage boundary</p>
        <h2 id="limits-title">
          Matching names cannot prove a working deployment.
        </h2>
        <div>
          <p>
            <strong>Static accessors only.</strong> Computed names and wrapper
            functions require repository integration or manual review.
          </p>
          <p>
            <strong>No value validation.</strong> A present key can still
            contain the wrong secret, URL, or permission.
          </p>
          <p>
            <strong>Branch overrides remain external.</strong> Compare the exact
            preview branch with Vercel before promotion.
          </p>
        </div>
      </section>
      <footer className="site-footer shell">
        <div>
          <span>EnvParity 0.1</span>
          <span>Key-only local analysis</span>
        </div>
        <IntentLink
          event="feedback_intent"
          href={`mailto:${email}?subject=${encodeURIComponent("EnvParity feedback")}`}
        >
          Send product feedback
        </IntentLink>
        <span>
          Built by{" "}
          <a
            href="https://iamuvin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Uvin Vindula
          </a>
        </span>
      </footer>
    </main>
  );
}
