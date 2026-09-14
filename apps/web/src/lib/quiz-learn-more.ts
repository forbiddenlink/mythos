export interface QuizLearnMore {
  learnMoreHref: string;
  learnMoreLabel: string;
  sourceCite?: string;
}

export function quizLearnMore(
  entity: {
    slug: string;
    name: string;
    primarySources?: Array<{ source?: string; text?: string }>;
  },
  route = "deities",
): QuizLearnMore {
  const sourceCite = entity.primarySources
    ?.map((entry) => entry.source?.trim())
    .find((source) => Boolean(source));
  return {
    learnMoreHref: `/${route}/${entity.slug}`,
    learnMoreLabel: `Read about ${entity.name}`,
    ...(sourceCite ? { sourceCite } : {}),
  };
}
