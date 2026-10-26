
import {
  WORD_CATEGORIES,
  type WordCategory,
} from "@/types/words";

export type WordDetection = {
  categories: WordCategory[];
  irregularForms: string | null;
  found: boolean;
};

const CATEGORY_MAP: Record<string, WordCategory | undefined> = {
  verb: "verb",
  noun: "noun",
  adjective: "adjective",
  adverb: "adverb",
  pronoun: "pronoun",
  preposition: "preposition",
  conjunction: "conjunction",
  participle: "participle",
  numeral: "numerals",
  number: "numerals",
  "phrasal verb": "phrasal verb",
  phrase: "functional phrase",
};

const IRREGULAR_VERBS: Record<string, string> = {
  be: "be-was/were-been",
  become: "become-became-become",
  begin: "begin-began-begun",
  break: "break-broke-broken",
  bring: "bring-brought-brought",
  buy: "buy-bought-bought",
  come: "come-came-come",
  do: "do-did-done",
  drink: "drink-drank-drunk",
  drive: "drive-drove-driven",
  eat: "eat-ate-eaten",
  fall: "fall-fell-fallen",
  feel: "feel-felt-felt",
  find: "find-found-found",
  get: "get-got-got",
  give: "give-gave-given",
  go: "go-went-gone",
  have: "have-had-had",
  hear: "hear-heard-heard",
  know: "know-knew-known",
  leave: "leave-left-left",
  make: "make-made-made",
  meet: "meet-met-met",
  read: "read-read-read",
  run: "run-ran-run",
  say: "say-said-said",
  see: "see-saw-seen",
  send: "send-sent-sent",
  sing: "sing-sang-sung",
  sit: "sit-sat-sat",
  sleep: "sleep-slept-slept",
  speak: "speak-spoke-spoken",
  take: "take-took-taken",
  teach: "teach-taught-taught",
  think: "think-thought-thought",
  understand: "understand-understood-understood",
  wear: "wear-wore-worn",
  win: "win-won-won",
  write: "write-wrote-written",
};

export function getIrregularForms(word: string): string | null {
  return IRREGULAR_VERBS[word.trim().toLowerCase()] ?? null;
}

export function mapWordCategories(parts: string[]): WordCategory[] {
  const categories = new Set<WordCategory>();

  for (const part of parts) {
    const category = CATEGORY_MAP[part.toLowerCase()];

    if (category && WORD_CATEGORIES.includes(category)) {
      categories.add(category);
    }
  }

  return [...categories];
}
