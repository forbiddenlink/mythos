import Link from "next/link";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { SupportButton } from "@/components/support/SupportButton";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata = generateBaseMetadata({
  title: "Support Mythos Atlas",
  description:
    "Help support the research, design and upkeep of Mythos Atlas with an optional one-time contribution.",
  url: "/support",
});

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-mythic">
      <TrackPageView
        event="support_page_viewed"
        properties={{ from: "support_page" }}
      />
      <div className="page-shell">
        <Breadcrumbs />
        <div className="mt-8 max-w-3xl">
          <p className="page-eyebrow text-gold-text">An independent atlas</p>
          <h1 className="page-title mt-3 text-foreground">
            Support Mythos Atlas
          </h1>
          <p className="mt-6 font-body text-2xl leading-relaxed text-foreground">
            Help keep the atlas growing.
          </p>
          <p className="mt-4 font-body text-xl leading-relaxed text-muted-foreground">
            I’m Elizabeth Stein, the developer behind Mythos Atlas. If you’ve
            enjoyed following a story, exploring a family tree or finding a new
            connection, you can help support the work that goes into this site.
          </p>
          <section
            aria-labelledby="support-work"
            className="mt-8 border-y border-border py-6"
          >
            <h2 id="support-work" className="page-section-title">
              What your support helps with
            </h2>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li>
                Researching sources and checking the details behind each entry.
              </li>
              <li>
                Improving the design, accessibility and reading experience.
              </li>
              <li>Covering hosting and the ongoing upkeep of the atlas.</li>
            </ul>
          </section>
          <div className="mt-8">
            <SupportButton placement="support_page" />
            <p className="mt-3 text-sm text-muted-foreground">
              One-time payment · $5 USD suggested · Choose any amount from $1
              USD
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Support is optional. There’s no subscription, and contributing
              doesn’t unlock paid content. You’ll choose your amount and enter
              payment details on Stripe’s checkout page for ImKindaGeeky, the
              account used for this project.
            </p>
          </div>
          <p className="mt-8 font-body text-lg leading-relaxed text-muted-foreground">
            You can also help by sharing a favorite entry or{" "}
            <Link
              href="/contact"
              className="text-gold-text underline underline-offset-4"
            >
              suggesting a correction
            </Link>
            . Thank you for spending time with the atlas.
          </p>
        </div>
      </div>
    </div>
  );
}
