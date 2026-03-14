import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Terms of Service - Mythos Atlas",
  description: "Terms of service for Mythos Atlas mythology encyclopedia.",
  url: "/terms",
});

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-gold">
        Terms of Service
      </h1>
      <p className="mt-2 text-muted-foreground">Last updated: March 14, 2026</p>

      <div className="prose prose-invert mt-8 max-w-none">
        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Acceptance of Terms
          </h2>
          <p className="mt-4 text-muted-foreground">
            By accessing and using Mythos Atlas, you accept and agree to be
            bound by the terms and conditions of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Use License
          </h2>
          <p className="mt-4 text-muted-foreground">
            Permission is granted to temporarily access the materials on Mythos
            Atlas for personal, non-commercial use. This is the grant of a
            license, not a transfer of title, and under this license you may
            not:
          </p>
          <ul className="mt-2 list-disc pl-6 text-muted-foreground">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software</li>
            <li>Remove any copyright or proprietary notations</li>
            <li>Transfer the materials to another person</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Content
          </h2>
          <p className="mt-4 text-muted-foreground">
            The mythology content on Mythos Atlas is compiled from public domain
            sources and scholarly research. While we strive for accuracy,
            mythology often has multiple versions and interpretations. We do not
            guarantee the accuracy, completeness, or usefulness of any
            information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            AI Features
          </h2>
          <p className="mt-4 text-muted-foreground">
            The Oracle feature uses AI to generate responses. These responses
            are for educational and entertainment purposes only. AI-generated
            content may contain inaccuracies and should not be relied upon as
            authoritative sources.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Disclaimer
          </h2>
          <p className="mt-4 text-muted-foreground">
            The materials on Mythos Atlas are provided on an &apos;as is&apos;
            basis. We make no warranties, expressed or implied, and hereby
            disclaim all other warranties including implied warranties of
            merchantability, fitness for a particular purpose, or
            non-infringement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Limitations
          </h2>
          <p className="mt-4 text-muted-foreground">
            In no event shall Mythos Atlas or its contributors be liable for any
            damages arising out of the use or inability to use the materials,
            even if we have been notified of the possibility of such damage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Modifications
          </h2>
          <p className="mt-4 text-muted-foreground">
            We may revise these terms of service at any time without notice. By
            using this website you are agreeing to be bound by the current
            version of these terms of service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Open Source
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mythos Atlas is open source software released under the MIT License.
            The source code is available on GitHub.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Contact
          </h2>
          <p className="mt-4 text-muted-foreground">
            Questions about these Terms of Service should be directed to us
            through our GitHub repository.
          </p>
        </section>
      </div>
    </div>
  );
}
