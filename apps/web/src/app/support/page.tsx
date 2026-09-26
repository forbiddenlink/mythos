import Link from "next/link";
import { Check } from "lucide-react";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import { SupportButton } from "@/components/support/SupportButton";
import { generateBaseMetadata } from "@/lib/metadata";
import { getPatronLink } from "@/lib/support-links";
import { getTraditionCount } from "@/lib/data/catalog";

export const metadata = generateBaseMetadata({
  title: "Support Mythos Atlas",
  description:
    "Help support the research, design and upkeep of Mythos Atlas with an optional contribution.",
  url: "/support",
});

const HELPS_WITH: Array<{ mark: MythosMarkId; title: string; body: string }> = [
  {
    mark: "codex",
    title: "Source research",
    body: "Checking the details behind each entry against primary texts and scholarship, and citing them.",
  },
  {
    mark: "compass",
    title: "Design and accessibility",
    body: "A calmer reading experience, keyboard and screen-reader support, and tools that work on every device.",
  },
  {
    mark: "temple",
    title: "Hosting and upkeep",
    body: "Keeping the atlas fast, free of ads and online, and fixing what breaks.",
  },
];

const OTHER_WAYS = [
  {
    title: "Share an entry",
    body: "Send a favourite myth or figure to someone who would enjoy it.",
    href: "/stories",
    link: "Find a story to share",
  },
  {
    title: "Suggest a correction",
    body: "Spotted an error or a misrepresented tradition? Tell us and it will be reviewed.",
    href: "/contact",
    link: "Suggest a correction",
  },
  {
    title: "Report a barrier",
    body: "If something is hard to use with your setup, it is a bug worth fixing.",
    href: "/accessibility",
    link: "Accessibility statement",
  },
] as const;

export default function SupportPage() {
  const patronLink = getPatronLink();

  return (
    <div className="min-h-screen">
      <TrackPageView
        event="support_page_viewed"
        properties={{ from: "support_page" }}
      />
      <PageHeader
        eyebrow="An independent atlas"
        mark="laurel"
        title="Support Mythos Atlas"
        lede="Help keep the atlas growing: free to read, free of ads, and carefully sourced."
      />

      <Container className="section-space">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-0 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="min-w-0 max-w-reading lg:col-start-1 lg:row-start-1">
            <p className="type-lede text-foreground">
              I&rsquo;m Elizabeth Stein, the developer behind Mythos Atlas. If
              you&rsquo;ve enjoyed following a story, exploring a family tree or
              finding a new connection between traditions, you can help support
              the work that goes into this site.
            </p>
            <p className="mt-5 type-reading text-muted-foreground">
              The atlas covers {getTraditionCount()} traditions and is built by
              one person. Contributions are optional and never unlock paid
              content; everything stays free for everyone.
            </p>
          </div>

          <aside
            aria-label="Ways to contribute"
            className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
          >
            <div className="overflow-hidden rounded-lg border border-gold/35 bg-card shadow-xl shadow-black/5">
              <div className="dark relative isolate bg-midnight px-6 py-6 text-parchment">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_90%_at_100%_0%,color-mix(in_oklch,var(--gold)_22%,transparent),transparent_70%)]"
                />
                <p className="type-eyebrow text-gold-light">Contribute</p>
                <p className="mt-2 font-serif text-2xl font-semibold leading-tight">
                  Keep the atlas open
                </p>
              </div>
              <div className="space-y-7 p-6">
                <section aria-labelledby="support-once">
                  <h2
                    id="support-once"
                    className="type-ui font-semibold text-foreground"
                  >
                    {patronLink ? "Once" : "One-time support"}
                  </h2>
                  <div className="mt-3 [&_a]:w-full">
                    <SupportButton placement="support_page" />
                  </div>
                  <p className="mt-3 type-meta text-muted-foreground">
                    One-time payment · $5 USD suggested · Choose any amount from
                    $1 USD
                  </p>
                </section>
                {patronLink ? (
                  <section
                    aria-labelledby="support-patron"
                    className="border-t border-border/70 pt-6"
                  >
                    <h2
                      id="support-patron"
                      className="type-ui font-semibold text-foreground"
                    >
                      As a patron
                    </h2>
                    <div className="mt-3 [&_a]:w-full">
                      <SupportButton
                        placement="support_page_patron"
                        href={patronLink}
                        label="Become a patron"
                        variant="outline"
                      />
                    </div>
                    <p className="mt-3 type-meta text-muted-foreground">
                      A recurring contribution through Stripe. Cancel any time
                      from the link in your Stripe receipt.
                    </p>
                  </section>
                ) : null}
                <ul className="space-y-2 border-t border-border/70 pt-6 type-ui text-muted-foreground">
                  {[
                    "Secure checkout hosted by Stripe",
                    patronLink
                      ? "Once or recurring, your choice"
                      : "A single payment, nothing recurring",
                    "No paid content, no ads",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-gold-text"
                        aria-hidden="true"
                      />
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="type-meta text-muted-foreground">
                  Support is optional
                  {patronLink ? "" : " and there’s no subscription"}, and
                  contributing doesn’t unlock paid content. You’ll choose your
                  amount and enter payment details on Stripe’s checkout page for
                  ImKindaGeeky, the account used for this project.
                </p>
              </div>
            </div>
          </aside>

          <div className="min-w-0 max-w-reading lg:col-start-1 lg:row-start-2">
            <section aria-labelledby="support-work" className="lg:mt-12">
              <h2 id="support-work" className="page-section-title">
                What your support helps with
              </h2>
              <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
                {HELPS_WITH.map((item) => (
                  <li key={item.title} className="flex gap-4 py-5">
                    <MythosMark
                      id={item.mark}
                      className="mt-1 size-6 shrink-0 text-gold-text"
                    />
                    <div>
                      <h3 className="type-h3 text-foreground">{item.title}</h3>
                      <p className="mt-1 type-reading text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </Container>

      <section
        aria-labelledby="support-other-ways"
        className="border-t border-border/60 bg-muted/35 section-space-sm"
      >
        <Container>
          <h2 id="support-other-ways" className="page-section-title">
            Other ways to help
          </h2>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {OTHER_WAYS.map((way) => (
              <li key={way.title}>
                <h3 className="type-h3 text-foreground">{way.title}</h3>
                <p className="mt-2 type-reading text-muted-foreground">
                  {way.body}
                </p>
                <Link
                  href={way.href}
                  className="mt-2 inline-flex min-h-11 items-center type-ui font-medium text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
                >
                  {way.link}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 type-reading text-muted-foreground">
            Thank you for spending time with the atlas.
          </p>
        </Container>
      </section>
    </div>
  );
}
