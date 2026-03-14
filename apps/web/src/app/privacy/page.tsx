import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Privacy Policy - Mythos Atlas",
  description: "Privacy policy for Mythos Atlas mythology encyclopedia.",
  url: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-gold">
        Privacy Policy
      </h1>
      <p className="mt-2 text-muted-foreground">Last updated: March 14, 2026</p>

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
            You can control cookie preferences through our cookie consent banner
            or your browser settings.
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
            Analytics, Sentry) in accordance with their respective privacy
            policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Your Rights
          </h2>
          <p className="mt-4 text-muted-foreground">You have the right to:</p>
          <ul className="mt-2 list-disc pl-6 text-muted-foreground">
            <li>Access your personal data</li>
            <li>Delete your data (clear browser localStorage)</li>
            <li>Opt out of analytics tracking</li>
            <li>Export your data</li>
          </ul>
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
            If you have questions about this Privacy Policy, please contact us
            through our GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
