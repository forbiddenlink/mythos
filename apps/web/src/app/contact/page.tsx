import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBaseMetadata } from "@/lib/metadata";
import { ExternalLink, Github, ShieldCheck, ScrollText } from "lucide-react";

export const metadata = generateBaseMetadata({
  title: "Contact Mythos Atlas",
  description:
    "Contact Mythos Atlas for corrections, source questions, licensing, privacy requests, and project feedback through the official repository links.",
  url: "/contact",
});

const repoUrl = "https://github.com/forbiddenlink/mythos";
const issuesUrl = `${repoUrl}/issues`;

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-mythic">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <Breadcrumbs />

        <div className="mt-8 max-w-3xl">
          <h1 className="font-serif text-5xl font-semibold tracking-tight text-foreground">
            Contact Mythos Atlas
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Mythos Atlas is maintained by Elizabeth Stein. If you need to report
            a factual issue, ask about sources, raise a privacy request, or
            discuss licensing and project feedback, use the official project
            links below.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            The fastest path is usually a repository issue with the page URL,
            the problem you found, and the change you want reviewed. That makes
            it easier to verify mythology details against cited material and to
            track technical fixes in one visible place.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Mythos Atlas is an editorial and technical project at the same time,
            so the most useful requests tend to be specific. If you are
            reporting a factual issue, include the exact statement that looks
            wrong and the source tradition it belongs to. If you are reporting a
            product issue, include the route, browser, and the user action that
            triggered the bug.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Requests tied to source accuracy, licensing, accessibility, privacy
            concerns, and broken functionality are the highest-signal reports
            because they directly affect trust in the encyclopedia. Clear
            reports make it much easier to compare cited material, reproduce UI
            issues, and decide whether a fix belongs in content, design, or the
            data layer.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Github className="h-5 w-5 text-gold" />
                Project Repository
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                For general project feedback, open-source questions, and code
                discussions, start with the public repository.
              </p>
              <Link
                href={repoUrl}
                className="inline-flex items-center gap-2 text-gold underline hover:text-gold/80"
              >
                Visit the Mythos Atlas repository
                <ExternalLink className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <ScrollText className="h-5 w-5 text-gold" />
                Corrections and Source Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you spot a factual error, a broken source link, missing
                context, or a mythology attribution issue, open an issue with
                the page URL and the correction you want reviewed.
              </p>
              <Link
                href={issuesUrl}
                className="inline-flex items-center gap-2 text-gold underline hover:text-gold/80"
              >
                Report a content or source issue
                <ExternalLink className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <ShieldCheck className="h-5 w-5 text-gold" />
                Privacy and Legal Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                For privacy-policy questions, terms clarification, or requests
                related to local data handling and analytics consent, use the
                same issue tracker and clearly mark the request as privacy or
                legal.
              </p>
              <p>
                The current policies are documented on the{" "}
                <Link
                  href="/privacy"
                  className="text-gold underline hover:text-gold/80"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms"
                  className="text-gold underline hover:text-gold/80"
                >
                  Terms of Service
                </Link>{" "}
                pages.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Github className="h-5 w-5 text-gold" />
                What To Include
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Include the page URL, the issue you found, and the requested
                change.
              </p>
              <p>
                For source questions, include the citation or reference you want
                compared.
              </p>
              <p>
                For technical bugs, include device, browser, and any console or
                UI errors.
              </p>
              <p>
                For licensing or collaboration questions, include the intended
                use case so the request can be reviewed with the right context.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="mt-10 rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Response Expectations
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Mythos Atlas is a curated project, not a staffed support desk, so
            response times vary. Reports that include page URLs, screenshots,
            citations, or reproducible steps are easier to review than general
            complaints because they can be checked against the live route and
            the underlying source notes immediately.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            If your request touches privacy, legal use, or attribution, point to
            the relevant policy section and explain the desired outcome. If your
            request is about a mythological interpretation, note whether you are
            challenging a factual claim, a translation choice, or an editorial
            summary. Those distinctions keep review focused and make the
            resulting changes more accurate.
          </p>
        </section>
      </div>
    </div>
  );
}
