export interface QuizLearnMore {
  learnMoreHref: string;
  learnMoreLabel: string;
}

export function quizLearnMore(deity: {
  slug: string;
  name: string;
}): QuizLearnMore {
  return {
    learnMoreHref: `/deities/${deity.slug}`,
    learnMoreLabel: `Read about ${deity.name}`,
  };
}
