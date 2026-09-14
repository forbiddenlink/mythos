export interface QuizLearnMore {
  learnMoreHref: string;
  learnMoreLabel: string;
  sourceCite?: string;
}

export function quizLearnMore(deity: {
  slug: string;
  name: string;
  primarySources?: Array<{ source?: string; text?: string }>;
}): QuizLearnMore {
  const sourceCite = deity.primarySources
    ?.map((entry) => entry.source?.trim())
    .find((source) => Boolean(source));
  return {
    learnMoreHref: `/deities/${deity.slug}`,
    learnMoreLabel: `Read about ${deity.name}`,
    ...(sourceCite ? { sourceCite } : {}),
  };
}
