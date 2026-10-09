export const WORD_CATEGORIES = [
  "verb",
  "participle",
  "noun",
  "adjective",
  "pronoun",
  "numerals",
  "adverb",
  "preposition",
  "conjunction",
  "phrasal verb",
  "functional phrase",
] as const;

export type WordCategory = (typeof WORD_CATEGORIES)[number];

export type Word = {
  _id: string;
  en: string;
  ua: string;
  category: WordCategory;
  isIrregular?: boolean;
  owner?: string;
  progress: number;
};

export type WordsResponse = {
  results: Word[];
  totalPages?: number;
  page?: number;
  perPage?: number;
};

export type WordsStatistics = {
  totalCount: number;
};

export type DictionaryFilters = {
  keyword: string;
  category: string;
  isIrregular?: boolean;
};

export type CreateWordRequest = {
  en: string;
  ua: string;
  category: WordCategory;
  isIrregular?: boolean;
};
