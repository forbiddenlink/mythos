import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashCard } from '@/components/review/FlashCard';
import type { ReviewCard, DifficultyRating } from '@/lib/spaced-repetition';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('FlashCard', () => {
  const mockCard: ReviewCard = {
    id: 'test-card-1',
    type: 'deity-recognition',
    question: 'Who is the king of the gods?',
    answer: 'Zeus',
    hint: 'He wields lightning',
    imageUrl: '/images/zeus.jpg',
    metadata: {
      deityId: 'zeus',
      pantheonId: 'greek-pantheon',
    },
  };

  const mockOnRate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Question side (front)', () => {
    it('should display the question', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);

      expect(screen.getByText('Who is the king of the gods?')).toBeInTheDocument();
    });

    it('should display card type badge', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);

      expect(screen.getByText('Visual ID')).toBeInTheDocument();
    });

    it('should display image when provided', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);

      const img = screen.getByAltText('Identify this');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/images/zeus.jpg');
    });

    it('should display "Reveal Answer" button', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);

      expect(screen.getByRole('button', { name: /reveal answer/i })).toBeInTheDocument();
    });

    it('should display "Show Hint" button when hint is available', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);

      expect(screen.getByRole('button', { name: /show hint/i })).toBeInTheDocument();
    });

    it('should not display hint button when no hint is provided', () => {
      const cardWithoutHint = { ...mockCard, hint: undefined };
      render(<FlashCard card={cardWithoutHint} onRate={mockOnRate} />);

      expect(screen.queryByRole('button', { name: /show hint/i })).not.toBeInTheDocument();
    });
  });

  describe('Hint toggle', () => {
    it('should toggle hint visibility when clicked', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);

      // Initially hint is hidden
      expect(screen.queryByText('He wields lightning')).not.toBeInTheDocument();

      // Click to show hint
      fireEvent.click(screen.getByRole('button', { name: /show hint/i }));

      // Hint should be visible
      expect(screen.getByText('He wields lightning')).toBeInTheDocument();

      // Button should now say "Hide Hint"
      expect(screen.getByRole('button', { name: /hide hint/i })).toBeInTheDocument();

      // Click to hide hint
      fireEvent.click(screen.getByRole('button', { name: /hide hint/i }));

      // Hint should be hidden again
      expect(screen.queryByText('He wields lightning')).not.toBeInTheDocument();
    });
  });

  describe('Flip interaction', () => {
    it('should flip to answer side when "Reveal Answer" is clicked', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);

      // Click reveal
      fireEvent.click(screen.getByRole('button', { name: /reveal answer/i }));

      // Answer should be visible
      expect(screen.getByText('Zeus')).toBeInTheDocument();

      // Question should not be visible in same way (it flips)
      expect(screen.queryByRole('button', { name: /reveal answer/i })).not.toBeInTheDocument();
    });

    it('should show initial flipped state when showAnswer is true', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} showAnswer={true} />);

      // Should start on answer side
      expect(screen.getByText('Zeus')).toBeInTheDocument();
    });
  });

  describe('Answer side (back)', () => {
    it('should display the answer', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);
      fireEvent.click(screen.getByRole('button', { name: /reveal answer/i }));

      expect(screen.getByText('Zeus')).toBeInTheDocument();
    });

    it('should display rating buttons', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);
      fireEvent.click(screen.getByRole('button', { name: /reveal answer/i }));

      expect(screen.getByRole('button', { name: /forgot/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /good/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /easy/i })).toBeInTheDocument();
    });

    it('should display rating descriptions', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);
      fireEvent.click(screen.getByRole('button', { name: /reveal answer/i }));

      expect(screen.getByText('Could not remember')).toBeInTheDocument();
      expect(screen.getByText('Remembered with difficulty')).toBeInTheDocument();
      expect(screen.getByText('Remembered correctly')).toBeInTheDocument();
      expect(screen.getByText('Remembered easily')).toBeInTheDocument();
    });
  });

  describe('Rating buttons', () => {
    it.each([
      [1, /forgot/i],
      [2, /hard/i],
      [3, /good/i],
      [4, /easy/i],
    ])('should call onRate with %i when %s is clicked', (rating, buttonPattern) => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);
      fireEvent.click(screen.getByRole('button', { name: /reveal answer/i }));

      fireEvent.click(screen.getByRole('button', { name: buttonPattern }));

      expect(mockOnRate).toHaveBeenCalledWith(rating);
    });

    it('should reset to question side after rating', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);

      // Flip to answer
      fireEvent.click(screen.getByRole('button', { name: /reveal answer/i }));
      expect(screen.getByText('Zeus')).toBeInTheDocument();

      // Rate
      fireEvent.click(screen.getByRole('button', { name: /good/i }));

      // Should flip back (card is reset for next card)
      expect(screen.getByRole('button', { name: /reveal answer/i })).toBeInTheDocument();
    });

    it('should reset hint visibility after rating', () => {
      render(<FlashCard card={mockCard} onRate={mockOnRate} />);

      // Show hint
      fireEvent.click(screen.getByRole('button', { name: /show hint/i }));
      expect(screen.getByText('He wields lightning')).toBeInTheDocument();

      // Flip and rate
      fireEvent.click(screen.getByRole('button', { name: /reveal answer/i }));
      fireEvent.click(screen.getByRole('button', { name: /good/i }));

      // Hint should be hidden again
      expect(screen.queryByText('He wields lightning')).not.toBeInTheDocument();
    });
  });

  describe('Different card types', () => {
    it.each([
      ['deity-recognition', 'Visual ID'],
      ['domain-match', 'Domain'],
      ['symbol-match', 'Symbol'],
      ['pantheon-match', 'Pantheon'],
      ['story-character', 'Story'],
    ] as const)('should display correct badge for %s type', (type, expectedLabel) => {
      const card: ReviewCard = {
        ...mockCard,
        type,
      };
      render(<FlashCard card={card} onRate={mockOnRate} />);

      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    });
  });

  describe('Card without image', () => {
    it('should not display image container when imageUrl is not provided', () => {
      const cardWithoutImage = { ...mockCard, imageUrl: undefined };
      render(<FlashCard card={cardWithoutImage} onRate={mockOnRate} />);

      expect(screen.queryByAltText('Identify this')).not.toBeInTheDocument();
    });
  });
});
