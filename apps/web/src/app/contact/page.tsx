import Link from "next/link";
import { ExternalLink, ScrollText, ShieldCheck } from "lucide-react";
import type * as React from "react";
import { Github } from "@/components/icons/brand";
import { Container } from "@/components/layout/container";
import { InfoColumns } from "@/components/layout/info-page";
import { PageHeader } from "@/components/layout/page-header";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata = generateBaseMetadata({
  title: "Contact Mythos Atlas",
  description:
    "Contact Mythos Atlas for corrections, source questions, licensing, privacy requests, and project feedback through the official repository links.",
  url: "/contact",
});

const repoUrl = "https://github.com/forbiddenlink/mythos";
const issuesUrl = `${repoUrl}/issues`;

const linkClass =
  "inline-flex min-h-11 items-center gap-2 type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current";

const CHANNELS: Array<{
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  body: React.ReactNode;
  action: React.ReactNode;
}> = [
  {
    icon: ScrollText,
    title: "Corrections and source questions",
    body: "Spotted a factual error, a broken source link, missing context or a mythology attribution issue? Open an issue with the page URL and the correction you want reviewed.",
    action: (
      <Link href={issuesUrl} className={linkClass}>
        Report a content or source issue
        <ExternalLink className="size-4" aria-hidden="true" />
      </Link>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Privacy and legal requests",
    body: (
      <>
        For privacy-policy questions, terms clarification, or requests about
        local data and analytics consent, use the same issue tracker and mark
        the request as privacy or legal. The policies are on the{" "}
        <Link
          href="/privacy"
          className="text-gold-text underline underline-offset-4"
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/terms"
          className="text-gold-text underline underline-offset-4"
        >
          Terms of Service
        </Link>{" "}
        pages.
      </>
    ),
    action: (
      <Link href={`${issuesUrl}/new`} className={linkClass}>
        Open a privacy request
        <ExternalLink className="size-4" aria-hidden="true" />
      </Link>
    ),
  },
  {
    icon: Github,
    title: "Project repository",
    body: "For general feedback, open-source questions and code discussions, start with the public repository.",
    action: (
      <Link href={repoUrl} className={linkClass}>
        Visit the Mythos Atlas repository
        <ExternalLink className="size-4" aria-hidden="true" />
      </Link>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Get in touch"
        mark="scroll"
        title="Contact Mythos Atlas"
        lede="Mythos Atlas is maintained by Elizabeth Stein. Report factual issues, ask about sources, raise privacy requests or discuss licensing through the project links below."
      />

      <Container className="pt-10 md:pt-14">
        <ul className="grid gap-px overflow-hidden rounded-lg border border-border/70 bg-border/70 md:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, title, body, action }) => (
            <li key={title} className="flex flex-col bg-background p-6">
              <Icon className="size-6 text-gold-text" aria-hidden={true} />
              <h2 className="mt-4 type-h3 text-foreground">{title}</h2>
              <p className="mt-2 flex-1 type-reading text-muted-foreground">
                {body}
              </p>
              <div className="mt-3">{action}</div>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="section-space">
        <InfoColumns>
          <section aria-labelledby="contact-include">
            <h2 id="contact-include">What to include</h2>
            <p>
              The fastest path is usually a repository issue with the page URL,
              the problem you found and the change you want reviewed. That makes
              it easier to verify mythology details against cited material and
              to track technical fixes in one visible place.
            </p>
            <ul>
              <li>
                <strong>Content:</strong> the exact statement that looks wrong
                and the tradition it belongs to.
              </li>
              <li>
                <strong>Sources:</strong> the citation or reference you want
                compared.
              </li>
              <li>
                <strong>Bugs:</strong> the route, device, browser and the action
                that triggered the problem.
              </li>
              <li>
                <strong>Licensing or collaboration:</strong> the intended use,
                so the request can be reviewed with the right context.
              </li>
            </ul>
            <p>
              For privacy or personal-data requests, do not paste sensitive
              details into a public GitHub issue. Open an issue titled
              &quot;Privacy request&quot; with a contact method only, and we
              will follow up privately.
            </p>
          </section>

          <section aria-labelledby="contact-response">
            <h2 id="contact-response">Response expectations</h2>
            <p>
              Mythos Atlas is a curated project, not a staffed support desk, so
              response times vary. Reports with page URLs, screenshots,
              citations or reproducible steps can be checked against the live
              route and the underlying source notes straight away.
            </p>
            <p>
              If your request is about a mythological interpretation, note
              whether you are challenging a factual claim, a translation choice
              or an editorial summary. Those distinctions keep review focused
              and make the resulting changes more accurate.
            </p>
          </section>
        </InfoColumns>
      </Container>
    </div>
  );
}
