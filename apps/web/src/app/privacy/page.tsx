import Link from "next/link";
import { generateBaseMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateBaseMetadata({
  title: "Privacy Policy - Mythos Atlas",
  description:
    "Read how Mythos Atlas handles privacy, local browser data, analytics consent, cookies, and third-party services across the mythology encyclopedia.",
  url: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-gold">
        Privacy Policy
      </h1>
      <p className="mt-2 text-muted-foreground">Last updated: July 23, 2026</p>

      <div className="prose prose-invert mt-8 max-w-none">
        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Introduction
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mythos Atlas (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
            committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, and safeguard your information when you visit
            our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Information We Collect
          </h2>
          <h3 className="mt-4 text-lg font-medium text-foreground">
            Information You Provide
          </h3>
          <ul className="mt-2 list-disc pl-6 text-muted-foreground">
            <li>
              Bookmarks and reading progress (stored locally in your browser)
            </li>
            <li>Quiz results and achievements (stored locally)</li>
            <li>Theme preferences (stored locally)</li>
          </ul>

          <h3 className="mt-4 text-lg font-medium text-foreground">
            Automatically Collected Information
          </h3>
          <ul className="mt-2 list-disc pl-6 text-muted-foreground">
            <li>
              Usage data: Pages visited, time spent, interactions (anonymized)
            </li>
            <li>Technical data: Browser type, device type, operating system</li>
            <li>Performance data: Page load times, errors encountered</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            How We Use Your Information
          </h2>
          <ul className="mt-4 list-disc pl-6 text-muted-foreground">
            <li>To provide and maintain our service</li>
            <li>To improve user experience and site performance</li>
            <li>To analyze usage patterns and optimize content</li>
            <li>To detect and prevent technical issues</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Cookies and Tracking
          </h2>
          <p className="mt-4 text-muted-foreground">
            We use cookies and similar tracking technologies to enhance your
            experience:
          </p>
          <ul className="mt-2 list-disc pl-6 text-muted-foreground">
            <li>
              <strong>Essential cookies:</strong> Required for the site to
              function (theme preferences, offline support)
            </li>
            <li>
              <strong>Analytics cookies:</strong> Help us understand how
              visitors interact with our site (anonymized)
            </li>
            <li>
              <strong>Performance cookies:</strong> Monitor site performance and
              errors
            </li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            You can control cookie preferences through our cookie consent
            banner, the Cookie Settings link in the footer, or your browser
            settings. Analytics and performance metrics are only sent after you
            explicitly accept non-essential cookies. If your browser sends a
            Global Privacy Control (GPC) signal, we treat it as an analytics
            opt-out and do not load Vercel Analytics or Speed Insights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Data Storage
          </h2>
          <p className="mt-4 text-muted-foreground">
            Most user data (bookmarks, progress, preferences) is stored locally
            in your browser using localStorage. This data never leaves your
            device unless you explicitly choose to export it.
          </p>
          <p className="mt-4 text-muted-foreground">
            Analytics data is processed by third-party services (Vercel
            Analytics) only after you accept non-essential cookies (or never,
            when Global Privacy Control is on). Browser error monitoring via
            Sentry is likewise gated behind that consent. Server-side error logs
            for API routes may still be recorded without browser cookies for
            reliability.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            AI features (Oracle)
          </h2>
          <p className="mt-4 text-muted-foreground">
            When you use the Oracle chat, your prompts and relevant encyclopedia
            excerpts are sent to Anthropic (Claude) to generate answers. We also
            use your IP address for rate limiting. Do not paste sensitive
            personal data into the Oracle. Answers are AI-generated and may be
            wrong.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Your Rights
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mythos Atlas stores progress and preferences in your browser
            (localStorage). Depending on where you live, you may have rights
            under laws such as the GDPR (EEA/UK) or CCPA/CPRA (California),
            including the right to access, delete, or opt out of certain
            analytics.
          </p>
          <ul className="mt-2 list-disc pl-6 text-muted-foreground">
            <li>Access data stored locally in your browser</li>
            <li>Delete local data by clearing site storage</li>
            <li>Opt out of non-essential analytics via the cookie banner</li>
            <li>Request help exporting or clarifying what we process</li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            Data controller: Elizabeth Stein (Mythos Atlas). For privacy
            requests, prefer a private channel via the{" "}
            <Link
              href="/contact"
              className="text-gold underline hover:text-gold/80"
            >
              contact page
            </Link>{" "}
            rather than posting personal details in a public GitHub issue.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Third-Party Services
          </h2>
          <p className="mt-4 text-muted-foreground">
            We use the following third-party services:
          </p>
          <ul className="mt-2 list-disc pl-6 text-muted-foreground">
            <li>Vercel - Hosting and analytics</li>
            <li>Sentry - Error tracking and monitoring</li>
            <li>Anthropic - AI features (Oracle)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Children&apos;s Privacy
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mythos Atlas is designed for general audiences. We do not knowingly
            collect personal information from children under 13.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Changes to This Policy
          </h2>
          <p className="mt-4 text-muted-foreground">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Contact Us
          </h2>
          <p className="mt-4 text-muted-foreground">
            If you have questions about this Privacy Policy, want to report a
            data concern, or need a correction to our policy text, visit our{" "}
            <Link
              href="/contact"
              className="text-gold underline hover:text-gold/80"
            >
              contact page
            </Link>{" "}
            for the current support and repository links.
          </p>
        </section>
      </div>
    </div>
  );
}
