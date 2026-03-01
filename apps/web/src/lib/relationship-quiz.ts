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
  _relationshipType?: string
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

function generateWrongDeityOptions(
  answerDeity: Deity,
  subjectDeity: Deity,
  allDeities: Deity[]
): string[] {
  const samePantheonDeities = allDeities.filter(
    d => d.id !== answerDeity.id && d.pantheonId === subjectDeity.pantheonId
  );
  const wrongOptions = getRandomItems(samePantheonDeities, 3).map(d => d.name);

  if (wrongOptions.length < 3) {
    const otherDeities = allDeities.filter(
      d => d.id !== answerDeity.id && !samePantheonDeities.includes(d)
    );
    wrongOptions.push(...getRandomItems(otherDeities, 3 - wrongOptions.length).map(d => d.name));
  }

  return wrongOptions;
}

interface RelQuestionParams {
  rel: Relationship;
  fromDeity: Deity;
  toDeity: Deity;
  askAboutTo: boolean;
  usedCombinations: Set<string>;
  allDeities: Deity[];
  questionIndex: number;
  difficulty: Difficulty;
}

function generateRelationshipQuestion({
  rel, fromDeity, toDeity, askAboutTo,
  usedCombinations, allDeities, questionIndex, difficulty,
}: RelQuestionParams): RelationshipQuestion | null {
  const questionType = askAboutTo
    ? getInverseQuestionType(rel.relationshipType)
    : mapRelationshipTypeToQuestionType(rel.relationshipType);
  if (!questionType) return null;

  const subject = askAboutTo ? toDeity : fromDeity;
  const answer = askAboutTo ? fromDeity : toDeity;

  const comboKey = askAboutTo
    ? `${subject.id}-${questionType}`
    : `${subject.id}-${questionType}-${answer.id}`;
  if (usedCombinations.has(comboKey)) return null;
  usedCombinations.add(comboKey);

  const wrongOptions = generateWrongDeityOptions(answer, subject, allDeities);

  return {
    id: `rel-${questionIndex}-${Date.now()}`,
    deityId: subject.id,
    deityName: subject.name,
    deityImageUrl: subject.imageUrl,
    questionType,
    questionText: generateQuestionText(questionType, subject.name, rel.relationshipType),
    correctAnswer: answer.name,
    correctDeityId: answer.id,
    options: shuffleArray([answer.name, ...wrongOptions.slice(0, 3)]),
    difficulty,
  };
}

function generateDomainQuestion(
  deity: Deity,
  allDeities: Deity[],
  usedCombinations: Set<string>,
  questionIndex: number,
  difficulty: Difficulty
): RelationshipQuestion | null {
  const comboKey = `${deity.id}-domain`;
  if (usedCombinations.has(comboKey)) return null;
  usedCombinations.add(comboKey);

  const correctDomain = deity.domain[0];

  const otherDomains = new Set<string>();
  for (const d of allDeities) {
    if (d.id !== deity.id && d.domain) {
      d.domain.forEach(dom => {
        if (dom !== correctDomain) otherDomains.add(dom);
      });
    }
  }

  const wrongOptions = getRandomItems([...otherDomains], 3);

  return {
    id: `domain-${questionIndex}-${Date.now()}`,
    deityId: deity.id,
    deityName: deity.name,
    deityImageUrl: deity.imageUrl,
    questionType: 'domain',
    questionText: generateQuestionText('domain', deity.name),
    correctAnswer: correctDomain,
    correctDeityId: deity.id,
    options: shuffleArray([correctDomain, ...wrongOptions]),
    difficulty,
  };
}

function getDomainQuestionCount(difficulty: Difficulty, remainingSlots: number): number {
  const maxByDifficulty: Record<Difficulty, number> = {
    hard: 2,
    medium: 3,
    easy: 4,
  };
  return Math.min(maxByDifficulty[difficulty], remainingSlots);
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
  const validRelTypes = new Set(['parent_of', 'sibling_of', 'spouse_of']);
  const validRelationships = relationships.filter(
    r => validRelTypes.has(r.relationshipType) &&
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

    const askAboutTo = Math.random() > 0.5;
    const question = generateRelationshipQuestion({
      rel, fromDeity, toDeity, askAboutTo,
      usedCombinations, allDeities: deities, questionIndex: questions.length, difficulty,
    });
    if (question) questions.push(question);
  }

  // Add domain questions to fill remaining slots based on difficulty
  const domainQuestionCount = getDomainQuestionCount(difficulty, count - questions.length);

  const deitiesWithDomains = deities.filter(d => d.domain && d.domain.length > 0);
  const shuffledDeities = shuffleArray(deitiesWithDomains);

  for (const deity of shuffledDeities) {
    if (questions.length >= count) break;
    if (questions.filter(q => q.questionType === 'domain').length >= domainQuestionCount) break;

    const question = generateDomainQuestion(
      deity, deities, usedCombinations, questions.length, difficulty
    );
    if (question) questions.push(question);
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
