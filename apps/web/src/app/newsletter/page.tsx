import Link from "next/link";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getJourneys, getStories } from "@/lib/data/catalog";
import { generateBaseMetadata } from "@/lib/metadata";
import { buildWeeklyDigest } from "@/lib/newsletter-digest";

export const metadata = generateBaseMetadata({
  title: "The weekly myth: a sample issue",
  description:
    "See what the Mythos Atlas weekly email contains: one myth, a passage with its source, and a question to think about.",
  url: "/newsletter",
});

// The sample is this week's issue; refresh hourly so it rolls over on Monday.
export const revalidate = 3600;

const linkClass =
  "text-gold-text underline decoration-gold/45 underline-offset-4 hover:decoration-current";

export default function NewsletterPage() {
  const digest = buildWeeklyDigest(getStories(), getJourneys(), new Date());

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="The weekly myth"
        title="A sample issue"
        lede="One email a week: a myth, a passage with its source, and a question to think about. Unsubscribe any time from any email."
      />
      <Container size="reading" className="section-space">
        {digest ? (
          <article aria-label={digest.parts.title} className="space-y-5">
            <p className="type-meta text-muted-foreground">
              This week&rsquo;s issue ({digest.weekKey})
            </p>
            <h2 className="page-section-title">{digest.parts.title}</h2>
            <p className="type-reading">{digest.parts.summary}</p>
            <blockquote className="border-l-2 border-gold/50 pl-4 type-reading">
              {digest.parts.excerpt}
              <footer className="mt-2 type-meta text-muted-foreground">
                Source: {digest.parts.citation}
              </footer>
            </blockquote>
            <p className="type-reading">
              <strong>To think about:</strong> {digest.parts.prompt}
            </p>
            <p className="type-ui">
              <Link href={digest.parts.storyPath} className={linkClass}>
                Read the full story and its sources
              </Link>
              {digest.parts.journey ? (
                <>
                  {" · "}
                  <Link href={digest.parts.journey.path} className={linkClass}>
                    Walk a journey: {digest.parts.journey.title}
                  </Link>
                </>
              ) : null}
            </p>
          </article>
        ) : (
          <p className="type-reading text-muted-foreground">
            A sample issue is not available right now.
          </p>
        )}
        <p className="mt-10 type-ui text-muted-foreground">
          The sign-up form is in the footer of every page. Your address is
          stored with our email provider, Resend; see the{" "}
          <Link href="/privacy#newsletter" className={linkClass}>
            privacy policy
          </Link>
          .
        </p>
      </Container>
    </div>
  );
}
