import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getGuide,
  listGuides,
  studyMetadata,
  StudyGuidePage,
} from "../_guides";

type Props = { params: Promise<{ slug: string }> };

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

export function generateStaticParams() {
  return listGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return studyMetadata(slug);
}

export default async function StudySlugPage({ params }: Props) {
  const { slug } = await params;
  if (!getGuide(slug)) notFound();
  return <StudyGuidePage slug={slug} />;
}
