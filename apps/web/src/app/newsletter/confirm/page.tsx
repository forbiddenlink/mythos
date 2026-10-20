import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { NewsletterConfirm } from "@/components/newsletter/NewsletterConfirm";

export const metadata: Metadata = {
  title: "Confirm your subscription",
  robots: { index: false, follow: false },
};

export default async function NewsletterConfirmPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ token?: string | string[] }> }>) {
  const { token } = await searchParams;
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="The weekly myth"
        title="Confirm your subscription"
        lede="One click and the weekly myth starts arriving. If you did not ask for it, close this page and nothing happens."
      />
      <Container size="reading" className="section-space">
        <NewsletterConfirm token={typeof token === "string" ? token : ""} />
      </Container>
    </div>
  );
}
