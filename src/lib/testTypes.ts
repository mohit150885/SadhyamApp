// Shapes shared by the admin, the student exam screen and the API.
/** A rectangle on page `page` (1-based), as fractions (0–1) of the page size. */
export type Segment = { page: number; x: number; y: number; w: number; h: number };

export type AnswerLetter = "A" | "B" | "C" | "D" | "E";
export const LETTERS: AnswerLetter[] = ["A", "B", "C", "D", "E"];

export interface TestSection {
    name: string;
    /** First and last question number (inclusive). */
    from: number;
    to: number;
    /** Optional overrides of the test-wide marking. */
    marksCorrect?: number | null;
    marksWrong?: number | null;
}

export interface TestQuestion {
    n: number;
    segments: Segment[];
    /** Correct option, or null when the key is missing (question is not scored). */
    answer: AnswerLetter | null;
    explanation?: string;
    /** "bonus" = everyone who attempted gets full marks (e.g. a dropped question). */
    bonus?: boolean;
}

export type SolutionsVisibility = "after-submit" | "after-end" | "never";
export type TestMode = "crop" | "pages";

/** Firestore: mock_tests/<id> (server-only). */
export interface MockTest {
    id: string;
    seriesId: string;
    title: string;
    description?: string;
    instructions?: string;
    language?: string;
    durationMin: number;
    marksCorrect: number;
    marksWrong: number;
    options: number;
    mode: TestMode;
    sections: TestSection[];
    questions: TestQuestion[];
    /** Index = page number − 1. fileId is "" for pages that were not uploaded. */
    pages: { fileId: string; w: number; h: number }[];
    sourceFileId?: string;
    sourceName?: string;
    solutionFileId?: string;
    solutionName?: string;
    maxAttempts: number;
    solutionsVisibility: SolutionsVisibility;
    availableFrom?: string;
    availableTo?: string;
    published: boolean;
    free: boolean;
    order: number;
    createdAt: number;
    updatedAt?: number;
}

/** What the student sees before starting (no answers). */
export interface TestSummary {
    id: string;
    seriesId: string;
    title: string;
    description?: string;
    language?: string;
    durationMin: number;
    questionCount: number;
    totalMarks: number;
    marksCorrect: number;
    marksWrong: number;
    sections: { name: string; from: number; to: number; count: number; marksCorrect: number; marksWrong: number }[];
    free: boolean;
    availableFrom?: string;
    availableTo?: string;
    maxAttempts: number;
    order: number;
}

export interface SectionResult {
    name: string;
    total: number;
    attempted: number;
    correct: number;
    wrong: number;
    skipped: number;
    score: number;
    maxScore: number;
    timeSec: number;
}

export interface AttemptResult {
    score: number;
    maxScore: number;
    correct: number;
    wrong: number;
    skipped: number;
    attempted: number;
    accuracy: number;
    timeTakenSec: number;
    positive: number;
    negative: number;
    sections: SectionResult[];
}

export interface AttemptState {
    id: string;
    testId: string;
    seriesId: string;
    attemptNo: number;
    status: "in-progress" | "submitted";
    startedAt: number;
    deadline: number;
    answers: Record<string, AnswerLetter>;
    marked: number[];
    visited: number[];
    timeSpent: Record<string, number>;
    lastQ: number;
    savedAt: number;
    submittedAt?: number;
    autoSubmitted?: boolean;
    result?: AttemptResult;
}

export function marksFor(test: Pick<MockTest, "marksCorrect" | "marksWrong" | "sections">, n: number) {
    const s = test.sections.find((x) => n >= x.from && n <= x.to);
    return {
        correct: s?.marksCorrect ?? test.marksCorrect,
        wrong: s?.marksWrong ?? test.marksWrong,
        section: s,
    };
}

export function round2(n: number) {
    return Math.round(n * 100) / 100;
}
