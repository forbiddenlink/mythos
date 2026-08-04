import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getGuide,
  listGuides,
  studyMetadata,
  StudyGuidePage,
} from "../_guides";

type Props = { params: Promise<{ slug: string }> };

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
