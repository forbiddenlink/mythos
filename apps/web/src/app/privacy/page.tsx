import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { generateBaseMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateBaseMetadata({
  title: "Privacy Policy - Mythos Atlas",
  description:
    "Read how Mythos Atlas handles privacy, local browser data, analytics consent, cookies, and third-party services across the mythology encyclopedia.",
  url: "/privacy",
});

const TOC = [
  { id: "introduction", label: "Introduction" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-your-information", label: "How We Use Your Information" },
  { id: "cookies-and-tracking", label: "Cookies and Tracking" },
  { id: "data-storage", label: "Data Storage" },
  { id: "ai-features-oracle", label: "AI features (Oracle)" },
  { id: "your-rights", label: "Your Rights" },
  { id: "third-party-services", label: "Third-Party Services" },
  { id: "newsletter", label: "Weekly Myth Digest" },
  { id: "optional-support-payments", label: "Optional Support Payments" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "changes-to-this-policy", label: "Changes to This Policy" },
  { id: "contact-us", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      mark="codex"
      title="Privacy Policy"
      lede="What Mythos Atlas stores, what it sends to other services, and the choices you have."
      toc={TOC}
      meta="Last updated: September 23, 2026"
    >
      <section id="introduction">
        <h2>Introduction</h2>
        <p>
          Mythos Atlas (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
          committed to protecting your privacy. This Privacy Policy explains how
          we collect, use, and safeguard your information when you visit our
          website.
        </p>
      </section>

      <section id="information-we-collect">
        <h2>Information We Collect</h2>
        <h3>Information You Provide</h3>
        <ul>
          <li>
            Bookmarks and reading progress (stored locally in your browser)
          </li>
          <li>Quiz results and achievements (stored locally)</li>
          <li>Theme preferences (stored locally)</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <ul>
          <li>
            Usage data: Pages visited, time spent, interactions (anonymized)
          </li>
          <li>Technical data: Browser type, device type, operating system</li>
          <li>Performance data: Page load times, errors encountered</li>
        </ul>
      </section>

      <section id="how-we-use-your-information">
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain our service</li>
          <li>To improve user experience and site performance</li>
          <li>To analyze usage patterns and optimize content</li>
          <li>To detect and prevent technical issues</li>
        </ul>
      </section>

      <section id="cookies-and-tracking">
        <h2>Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your
          experience:
        </p>
        <ul>
          <li>
            <strong>Essential cookies:</strong> Required for the site to
            function (theme preferences, offline support)
          </li>
          <li>
            <strong>Analytics cookies:</strong> Help us understand how visitors
            interact with our site (anonymized)
          </li>
          <li>
            <strong>Performance cookies:</strong> Monitor site performance and
            errors
          </li>
        </ul>
        <p>
          You can control cookie preferences through our cookie consent banner,
          the Cookie Settings link in the footer, or your browser settings.
          Analytics and performance metrics are only sent after you explicitly
          accept non-essential cookies. If your browser sends a Global Privacy
          Control (GPC) signal, we treat it as an analytics opt-out and do not
          load Vercel Analytics or Speed Insights.
        </p>
      </section>

      <section id="data-storage">
        <h2>Data Storage</h2>
        <p>
          Most user data (bookmarks, progress, preferences) is stored locally in
          your browser using localStorage. This data never leaves your device
          unless you explicitly choose to export it.
        </p>
        <p>
          Analytics data is processed by third-party services (Vercel Analytics)
          only after you accept non-essential cookies (or never, when Global
          Privacy Control is on). Browser error monitoring via Sentry is
          likewise gated behind that consent. Server-side error logs for API
          routes may still be recorded without browser cookies for reliability.
        </p>
      </section>

      <section id="ai-features-oracle">
        <h2>AI features (Oracle)</h2>
        <p>
          When you use the Oracle chat, your prompts and relevant encyclopedia
          excerpts are sent to Anthropic (Claude) to generate answers. We also
          use your IP address for rate limiting. Do not paste sensitive personal
          data into the Oracle. Answers are AI-generated and may be wrong.
        </p>
      </section>

      <section id="your-rights">
        <h2>Your Rights</h2>
        <p>
          Mythos Atlas stores progress and preferences in your browser
          (localStorage). Depending on where you live, you may have rights under
          laws such as the GDPR (EEA/UK) or CCPA/CPRA (California), including
          the right to access, delete, or opt out of certain analytics.
        </p>
        <ul>
          <li>Access data stored locally in your browser</li>
          <li>Delete local data by clearing site storage</li>
          <li>Opt out of non-essential analytics via the cookie banner</li>
          <li>Request help exporting or clarifying what we process</li>
        </ul>
        <p>
          Data controller: Elizabeth Stein (Mythos Atlas). For privacy requests,
          prefer a private channel via the{" "}
          <Link href="/contact">contact page</Link> rather than posting personal
          details in a public GitHub issue.
        </p>
      </section>

      <section id="third-party-services">
        <h2>Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li>Vercel - Hosting and analytics</li>
          <li>Sentry - Error tracking and monitoring</li>
          <li>Anthropic - AI features (Oracle)</li>
          <li>Stripe - Optional support payments through a hosted checkout</li>
          <li>Resend - The optional weekly myth email digest</li>
        </ul>
      </section>

      <section id="newsletter">
        <h2>Weekly Myth Digest</h2>
        <p>
          If you sign up for the weekly digest and tick the consent box, the
          email address you enter is sent to Resend, our email provider, and
          stored there as a contact on the digest list. We use it only to send
          the digest. Every email includes an unsubscribe link, and you can ask
          for your address to be deleted through the{" "}
          <Link href="/contact">contact page</Link>. See{" "}
          <a href="https://resend.com/legal/privacy-policy">
            Resend’s privacy policy
          </a>{" "}
          for details about its processing. Sign-up requests are rate limited by
          network address, which is used only for that check.
        </p>
      </section>

      <section id="optional-support-payments">
        <h2>Optional Support Payments</h2>
        <p>
          If you choose to support Mythos Atlas, you leave this site for
          Stripe’s hosted checkout. Stripe processes the contact and payment
          information you enter there. The project owner can access transaction
          records in Stripe to manage payments and respond to questions; Mythos
          Atlas does not receive your full card number. See{" "}
          <a href="https://stripe.com/privacy">Stripe’s privacy policy</a> for
          details about its processing.
        </p>
      </section>

      <section id="childrens-privacy">
        <h2>Children&apos;s Privacy</h2>
        <p>
          Mythos Atlas is designed for general audiences. We do not knowingly
          collect personal information from children under 13.
        </p>
      </section>

      <section id="changes-to-this-policy">
        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last updated&quot; date.
        </p>
      </section>

      <section id="contact-us">
        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, want to report a data
          concern, or need a correction to our policy text, visit our{" "}
          <Link href="/contact">contact page</Link> for the current support and
          repository links.
        </p>
      </section>
    </InfoPage>
  );
}
