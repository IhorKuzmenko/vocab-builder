
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import RecommendTable from "@/components/RecommendTable/RecommendTable";
import styles from "./RecommendClient.module.css";

type RecommendedWord = {
  _id: string;
  en: string;
  ua: string;
  category: string;
  isIrregular?: boolean;
};

const categories = [
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
];

const demoWords: RecommendedWord[] = [
  {
    _id: "1",
    en: "Able",
    ua: "Здібний",
    category: "pronoun",
  },
  {
    _id: "2",
    en: "Absolutely",
    ua: "Абсолютно",
    category: "adverb",
  },
  {
    _id: "3",
    en: "Swim, swam, swum",
    ua: "Плавати",
    category: "participle",
  },
  {
    _id: "4",
    en: "Think, thought, thought",
    ua: "Думати",
    category: "participle",
  },
  {
    _id: "5",
    en: "Come apart",
    ua: "Роз'єднувати",
    category: "phrasal verb",
  },
  {
    _id: "6",
    en: "Go back",
    ua: "Повертатися",
    category: "phrasal verb",
  },
  {
    _id: "7",
    en: "Develop",
    ua: "Розвиватися",
    category: "verb",
    isIrregular: false,
  },
];

const PAGE_SIZE = 7;

export default function RecommendClient() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [isIrregular, setIsIrregular] = useState(false);
  const [page, setPage] = useState(1);

  const filteredWords = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return demoWords.filter((word) => {
      const matchesKeyword =
        word.en.toLowerCase().includes(normalizedKeyword) ||
        word.ua.toLowerCase().includes(normalizedKeyword);

      const matchesCategory =
        !category || word.category === category;

      const matchesVerbType =
        category !== "verb" ||
        word.isIrregular === isIrregular;

      return matchesKeyword && matchesCategory && matchesVerbType;
    });
  }, [keyword, category, isIrregular]);

  const totalPages = Math.ceil(filteredWords.length / PAGE_SIZE);

  const visibleWords = filteredWords.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function handleCategoryChange(value: string) {
    setCategory(value);
    setIsIrregular(false);
    setPage(1);
  }

  return (
    <section className={`container ${styles.recommend}`}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <div className={styles.searchField}>
            <input
              type="search"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="Find the word"
              aria-label="Find the word"
            />

            <svg width="20" height="20" aria-hidden="true">
              <circle
                cx="8.5"
                cy="8.5"
                r="5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="m13 13 4.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className={styles.categoryField}>
            <select
              value={category}
              onChange={(event) =>
                handleCategoryChange(event.target.value)
              }
              aria-label="Word category"
            >
              <option value="">Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="m6 9 6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {category === "verb" && (
            <fieldset className={styles.verbTypes}>
              <legend className={styles.visuallyHidden}>
                Verb type
              </legend>

              <label>
                <input
                  type="radio"
                  name="recommend-verb-type"
                  checked={!isIrregular}
                  onChange={() => {
                    setIsIrregular(false);
                    setPage(1);
                  }}
                />
                <span>Regular</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="recommend-verb-type"
                  checked={isIrregular}
                  onChange={() => {
                    setIsIrregular(true);
                    setPage(1);
                  }}
                />
                <span>Irregular</span>
              </label>
            </fieldset>
          )}
        </div>

        <div className={styles.study}>
          <div className={styles.studyCount}>
            <span>To study:</span>
            <strong>20</strong>
          </div>

          <Link href="/training" className={styles.trainLink}>
            Train oneself
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <RecommendTable
        words={visibleWords}
        onAdd={(word) => {
          // Подключим API добавления на следующем этапе.
          console.info("Add recommended word:", word);
        }}
      />

      {totalPages > 0 && (
        <nav
          className={styles.pagination}
          aria-label="Pagination"
        >
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(1)}
            aria-label="First page"
          >
            «
          </button>

          <button
            type="button"
            disabled={page === 1}
            onClick={() =>
              setPage((current) => current - 1)
            }
            aria-label="Previous page"
          >
            ‹
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1,
          ).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={
                pageNumber === page
                  ? styles.activePage
                  : undefined
              }
              onClick={() => setPage(pageNumber)}
              aria-current={
                pageNumber === page ? "page" : undefined
              }
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) => current + 1)
            }
            aria-label="Next page"
          >
            ›
          </button>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
            aria-label="Last page"
          >
            »
          </button>
        </nav>
      )}
    </section>
  );
}
