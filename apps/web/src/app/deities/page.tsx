import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import {
  getDeityListItems,
  getPantheonShortNames,
  getTraditionCount,
} from "@/lib/data/catalog";
import { getBlurHash } from "@/lib/image-blur";
import { DeitiesPageClient } from "./DeitiesPageClient";

export default function DeitiesPage() {
  return (
    <>
      <CollectionPageJsonLd
        name="Deities - Gods and Goddesses of World Mythology"
        description="Browse gods and goddesses from Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, and Aztec mythologies."
        url="/deities"
      />
      <DeitiesPageClient
        deities={getDeityListItems().map((deity) => ({
          ...deity,
          blurHash: getBlurHash(deity.imageUrl),
        }))}
        traditionCount={getTraditionCount()}
        traditionNames={getPantheonShortNames()}
      />
    </>
  );
}
