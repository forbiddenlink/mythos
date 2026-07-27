import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { DeitiesPageClient } from "./DeitiesPageClient";

export default function DeitiesPage() {
  return (
    <>
      <CollectionPageJsonLd
        name="Deities - Gods and Goddesses of World Mythology"
        description="Browse gods and goddesses from Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, and Aztec mythologies."
        url="/deities"
      />
      <DeitiesPageClient />
    </>
  );
}
