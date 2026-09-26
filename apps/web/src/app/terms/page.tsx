import Link from "next/link";
import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/info-page";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Terms of Service - Mythos Atlas",
  description:
    "Review the Mythos Atlas terms of service covering acceptable use, mythology content, AI features, open-source licensing, and platform disclaimers.",
  url: "/terms",
});

const TOC = [
  { id: "acceptance-of-terms", label: "Acceptance of Terms" },
  { id: "use-license", label: "Use License" },
  { id: "content", label: "Content" },
  { id: "ai-features", label: "AI Features" },
  { id: "disclaimer", label: "Disclaimer" },
  { id: "limitations", label: "Limitations" },
  { id: "modifications", label: "Modifications" },
  { id: "governing-law", label: "Governing Law" },
  { id: "open-source", label: "Open Source" },
  { id: "contact", label: "Contact" },
];

export default function TermsOfServicePage() {
  return (
    <InfoPage
      eyebrow="Policies"
      mark="scales"
      title="Terms of Service"
      lede="The terms for reading, sharing and building on Mythos Atlas."
      toc={TOC}
      meta="Last updated: March 14, 2026"
    >
      <section id="acceptance-of-terms">
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using Mythos Atlas, you accept and agree to be bound
          by the terms and conditions of this agreement.
        </p>
      </section>

      <section id="use-license">
        <h2>Use License</h2>
        <p>
          Permission is granted to temporarily access the materials on Mythos
          Atlas for personal, non-commercial use. This is the grant of a
          license, not a transfer of title, and under this license you may not:
        </p>
        <ul>
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose</li>
          <li>Attempt to decompile or reverse engineer any software</li>
          <li>Remove any copyright or proprietary notations</li>
          <li>Transfer the materials to another person</li>
        </ul>
      </section>

      <section id="content">
        <h2>Content</h2>
        <p>
          The mythology content on Mythos Atlas is compiled from public domain
          sources and scholarly research. While we strive for accuracy,
          mythology often has multiple versions and interpretations. We do not
          guarantee the accuracy, completeness, or usefulness of any
          information.
        </p>
      </section>

      <section id="ai-features">
        <h2>AI Features</h2>
        <p>
          The Oracle feature uses AI to generate responses. These responses are
          for educational and entertainment purposes only. AI-generated content
          may contain inaccuracies and should not be relied upon as
          authoritative sources.
        </p>
      </section>

      <section id="disclaimer">
        <h2>Disclaimer</h2>
        <p>
          The materials on Mythos Atlas are provided on an &apos;as is&apos;
          basis. We make no warranties, expressed or implied, and hereby
          disclaim all other warranties including implied warranties of
          merchantability, fitness for a particular purpose, or
          non-infringement.
        </p>
      </section>

      <section id="limitations">
        <h2>Limitations</h2>
        <p>
          In no event shall Mythos Atlas or its contributors be liable for any
          damages arising out of the use or inability to use the materials, even
          if we have been notified of the possibility of such damage.
        </p>
      </section>

      <section id="modifications">
        <h2>Modifications</h2>
        <p>
          We may revise these terms as the project evolves. Material changes
          will be noted on the <Link href="/changelog">changelog</Link> and by
          updating the &quot;Last updated&quot; date on this page. Continued use
          of the site after changes constitutes acceptance of the revised terms.
        </p>
      </section>

      <section id="governing-law">
        <h2>Governing Law</h2>
        <p>
          These terms are governed by the laws of the United States, excluding
          conflict-of-law rules. If a dispute arises, the parties will first
          attempt to resolve it informally via the{" "}
          <Link href="/contact">contact page</Link>. Nothing in these terms
          limits rights you may have under mandatory consumer protection laws in
          your jurisdiction.
        </p>
      </section>

      <section id="open-source">
        <h2>Open Source</h2>
        <p>
          Mythos Atlas is open source software released under the MIT License.
          The source code is available on GitHub.
        </p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          Questions about these Terms of Service, licensing, or permitted use
          can be sent through the links listed on our{" "}
          <Link href="/contact">contact page</Link>.
        </p>
      </section>
    </InfoPage>
  );
}
