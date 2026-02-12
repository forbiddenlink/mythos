import type { Deity } from '@/types/Entity';

export type QuestionType = 'parent' | 'child' | 'sibling' | 'spouse' | 'domain';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RelationshipQuestion {
  id: string;
  deityId: string;
  deityName: string;
  deityImageUrl?: string;
  questionType: QuestionType;
  questionText: string;
  correctAnswer: string;
  correctDeityId: string;
  options: string[];
  difficulty: Difficulty;
}

export interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  confidenceLevel?: string;
  description?: string;
}

// XP rewards by difficulty
export const XP_REWARDS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
};

// Time limits by difficulty (in seconds)
export const TIME_LIMITS: Record<Difficulty, number> = {
  easy: 30,
  medium: 20,
  hard: 15,
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count);
}

function generateQuestionText(
  questionType: QuestionType,
  deityName: string,
  relationshipType?: string
): string {
  switch (questionType) {
    case 'parent':
      return `Who is a parent of ${deityName}?`;
    case 'child':
      return `Who is a child of ${deityName}?`;
    case 'sibling':
      return `Who is a sibling of ${deityName}?`;
    case 'spouse':
      return `Who is the spouse/consort of ${deityName}?`;
    case 'domain':
      return `What is ${deityName}'s primary domain?`;
    default:
      return `What is ${deityName}'s relationship?`;
  }
}

function mapRelationshipTypeToQuestionType(relType: string): QuestionType | null {
  const mapping: Record<string, QuestionType> = {
    parent_of: 'child', // If A is parent_of B, then for A we ask "who is child"
    sibling_of: 'sibling',
    spouse_of: 'spouse',
  };
  return mapping[relType] || null;
}

function getInverseQuestionType(relType: string): QuestionType | null {
  // For "parent_of" relationship from A to B, B's parent is A
  const inverseMapping: Record<string, QuestionType> = {
    parent_of: 'parent', // If A is parent_of B, for B we ask "who is parent"
  };
  return inverseMapping[relType] || null;
}

export function generateRelationshipQuiz(
  deities: Deity[],
  relationships: Relationship[],
  count: number = 10,
  difficulty: Difficulty = 'medium'
): RelationshipQuestion[] {
  const questions: RelationshipQuestion[] = [];
  const usedCombinations = new Set<string>();

  // Filter relationships to only include those with high/medium confidence
  const validRelTypes = ['parent_of', 'sibling_of', 'spouse_of'];
  const validRelationships = relationships.filter(
    r => validRelTypes.includes(r.relationshipType) &&
         (r.confidenceLevel === 'high' || r.confidenceLevel === 'medium')
  );

  // Create a deity map for quick lookups
  const deityMap = new Map(deities.map(d => [d.id, d]));

  // Generate relationship-based questions
  const shuffledRels = shuffleArray(validRelationships);

  for (const rel of shuffledRels) {
    if (questions.length >= count) break;

    const fromDeity = deityMap.get(rel.fromDeityId);
    const toDeity = deityMap.get(rel.toDeityId);

    if (!fromDeity || !toDeity) continue;

    // Randomly decide whether to ask about the "from" or "to" deity
    const askAboutTo = Math.random() > 0.5;

    if (askAboutTo) {
      // Ask: "Who is the parent of [toDeity]?" Answer: fromDeity
      const questionType = getInverseQuestionType(rel.relationshipType);
      if (!questionType) continue;

      const comboKey = `${toDeity.id}-${questionType}`;
      if (usedCombinations.has(comboKey)) continue;
      usedCombinations.add(comboKey);

      // Generate wrong answers from same pantheon if possible
      const samePantheonDeities = deities.filter(
        d => d.id !== fromDeity.id && d.pantheonId === toDeity.pantheonId
      );
      const wrongOptions = getRandomItems(samePantheonDeities, 3).map(d => d.name);

      if (wrongOptions.length < 3) {
        // Fill with deities from other pantheons
        const otherDeities = deities.filter(
          d => d.id !== fromDeity.id && !samePantheonDeities.includes(d)
        );
        wrongOptions.push(...getRandomItems(otherDeities, 3 - wrongOptions.length).map(d => d.name));
      }

      questions.push({
        id: `rel-${questions.length}-${Date.now()}`,
        deityId: toDeity.id,
        deityName: toDeity.name,
        deityImageUrl: toDeity.imageUrl,
        questionType,
        questionText: generateQuestionText(questionType, toDeity.name, rel.relationshipType),
        correctAnswer: fromDeity.name,
        correctDeityId: fromDeity.id,
        options: shuffleArray([fromDeity.name, ...wrongOptions.slice(0, 3)]),
        difficulty,
      });
    } else {
      // Ask: "Who is a child of [fromDeity]?" Answer: toDeity
      const questionType = mapRelationshipTypeToQuestionType(rel.relationshipType);
      if (!questionType) continue;

      const comboKey = `${fromDeity.id}-${questionType}-${toDeity.id}`;
      if (usedCombinations.has(comboKey)) continue;
      usedCombinations.add(comboKey);

      // Generate wrong answers from same pantheon if possible
      const samePantheonDeities = deities.filter(
        d => d.id !== toDeity.id && d.pantheonId === fromDeity.pantheonId
      );
      const wrongOptions = getRandomItems(samePantheonDeities, 3).map(d => d.name);

      if (wrongOptions.length < 3) {
        const otherDeities = deities.filter(
          d => d.id !== toDeity.id && !samePantheonDeities.includes(d)
        );
        wrongOptions.push(...getRandomItems(otherDeities, 3 - wrongOptions.length).map(d => d.name));
      }

      questions.push({
        id: `rel-${questions.length}-${Date.now()}`,
        deityId: fromDeity.id,
        deityName: fromDeity.name,
        deityImageUrl: fromDeity.imageUrl,
        questionType,
        questionText: generateQuestionText(questionType, fromDeity.name, rel.relationshipType),
        correctAnswer: toDeity.name,
        correctDeityId: toDeity.id,
        options: shuffleArray([toDeity.name, ...wrongOptions.slice(0, 3)]),
        difficulty,
      });
    }
  }

  // Add domain questions to fill remaining slots based on difficulty
  const domainQuestionCount = difficulty === 'hard' ? Math.min(2, count - questions.length) :
                              difficulty === 'medium' ? Math.min(3, count - questions.length) :
                              Math.min(4, count - questions.length);

  const deitiesWithDomains = deities.filter(d => d.domain && d.domain.length > 0);
  const shuffledDeities = shuffleArray(deitiesWithDomains);

  for (const deity of shuffledDeities) {
    if (questions.length >= count) break;

    const comboKey = `${deity.id}-domain`;
    if (usedCombinations.has(comboKey)) continue;
    if (questions.filter(q => q.questionType === 'domain').length >= domainQuestionCount) continue;

    usedCombinations.add(comboKey);

    const correctDomain = deity.domain[0];

    // Get wrong domain options from other deities
    const otherDomains = new Set<string>();
    for (const d of deities) {
      if (d.id !== deity.id && d.domain) {
        d.domain.forEach(dom => {
          if (dom !== correctDomain) otherDomains.add(dom);
        });
      }
    }

    const wrongOptions = getRandomItems([...otherDomains], 3);

    questions.push({
      id: `domain-${questions.length}-${Date.now()}`,
      deityId: deity.id,
      deityName: deity.name,
      deityImageUrl: deity.imageUrl,
      questionType: 'domain',
      questionText: generateQuestionText('domain', deity.name),
      correctAnswer: correctDomain,
      correctDeityId: deity.id,
      options: shuffleArray([correctDomain, ...wrongOptions]),
      difficulty,
    });
  }

  return shuffleArray(questions).slice(0, count);
}

export function calculateQuizXP(
  correctAnswers: number,
  totalQuestions: number,
  difficulty: Difficulty,
  usedTimer: boolean
): number {
  const baseXP = correctAnswers * XP_REWARDS[difficulty];

  // Bonus for perfect score
  const perfectBonus = correctAnswers === totalQuestions ? Math.floor(baseXP * 0.25) : 0;

  // Bonus for using timer (challenge mode)
  const timerBonus = usedTimer ? Math.floor(baseXP * 0.15) : 0;

  return baseXP + perfectBonus + timerBonus;
}

export function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    parent: 'Parent',
    child: 'Child',
    sibling: 'Sibling',
    spouse: 'Spouse/Consort',
    domain: 'Domain',
  };
  return labels[type];
}

export function getQuestionTypeIcon(type: QuestionType): string {
  const icons: Record<QuestionType, string> = {
    parent: 'crown',
    child: 'baby',
    sibling: 'users',
    spouse: 'heart',
    domain: 'sparkles',
  };
  return icons[type];
}
