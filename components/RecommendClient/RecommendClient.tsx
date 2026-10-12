"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import Pagination from "@/components/Pagination/Pagination";
import RecommendTable from "@/components/RecommendTable/RecommendTable";

import type { Word, WordsResponse, WordsStatistics } from "@/types/words";

import styles from "./RecommendClient.module.css";

const PAGE_SIZE = 7;

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

export default function RecommendClient() {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [category, setCategory] = useState("");
  const [isIrregular, setIsIrregular] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [words, setWords] = useState<Word[]>([]);

  const [toStudy, setToStudy] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addingId, setAddingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [keyword]);

  const loadStatistics = useCallback(async () => {
    try {
      const response = await fetch("/api/words/statistics", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data: WordsStatistics = await response.json();
      setToStudy(data.totalCount);
    } catch {
      // Statistics are optional for rendering the page.
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchStatistics() {
      try {
        const response = await fetch("/api/words/statistics", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data: WordsStatistics = await response.json();

        if (!controller.signal.aborted) {
          setToStudy(data.totalCount);
        }
      } catch {
        // Ignore statistics request errors.
      }
    }

    void fetchStatistics();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWords() {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (debouncedKeyword) {
        params.set("keyword", debouncedKeyword);
      }

      if (category) {
        params.set("category", category);
      }

      if (category === "verb") {
        params.set("isIrregular", String(isIrregular));
      }

      try {
        const response = await fetch(`/api/words/all?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load recommended words");
        }

        const data: WordsResponse = await response.json();

        if (controller.signal.aborted) return;

        setWords(data.results);
        setTotalPages(data.totalPages ?? 0);
        setError("");
      } catch (error) {
        if (controller.signal.aborted) return;

        setWords([]);
        setTotalPages(0);

        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadWords();

    return () => controller.abort();
  }, [page, debouncedKeyword, category, isIrregular, refreshKey]);

  function handleCategoryChange(value: string) {
    setCategory(value);
    setIsIrregular(false);
    setPage(1);
    setLoading(true);
  }

  function handleKeywordChange(value: string) {
    setKeyword(value);
    setLoading(true);
  }

  function handleVerbTypeChange(value: boolean) {
    setIsIrregular(value);
    setPage(1);
    setLoading(true);
  }

  function handlePageChange(value: number) {
    setPage(value);
    setLoading(true);
  }

  async function handleAdd(word: Word) {
    if (addingId !== null) return;

    setAddingId(word._id);

    try {
      const response = await fetch(
        `/api/words/add/${encodeURIComponent(word._id)}`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const data: { message?: string } = await response
          .json()
          .catch(() => ({}));

        throw new Error(data.message || "Failed to add word");
      }

      toast.success(`"${word.en}" added to dictionary`);

      setLoading(true);
      setRefreshKey((current) => current + 1);

      await loadStatistics();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add word",
      );
    } finally {
      setAddingId(null);
    }
  }

  return (
    <section className={`container ${styles.recommend}`}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <div className={styles.searchField}>
            <input
              type="search"
              value={keyword}
              onChange={(event) => handleKeywordChange(event.target.value)}
              placeholder="Find the word"
              aria-label="Find the word"
            />

            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
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
              onChange={(event) => handleCategoryChange(event.target.value)}
              aria-label="Word category"
            >
              <option value="">Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>

            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
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
              <legend className={styles.visuallyHidden}>Verb type</legend>

              <label>
                <input
                  type="radio"
                  name="recommend-verb-type"
                  checked={!isIrregular}
                  onChange={() => handleVerbTypeChange(false)}
                />
                <span>Regular</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="recommend-verb-type"
                  checked={isIrregular}
                  onChange={() => handleVerbTypeChange(true)}
                />
                <span>Irregular</span>
              </label>
            </fieldset>
          )}
        </div>

        <div className={styles.study}>
          <div className={styles.studyCount}>
            <span>To study:</span>
            <strong>{toStudy ?? "—"}</strong>
          </div>

          <Link href="/training" className={styles.trainLink}>
            Train oneself
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <p className={styles.statusMessage}>Loading recommended words...</p>
      ) : error ? (
        <p role="alert" className={styles.statusMessage}>
          {error}
        </p>
      ) : (
        <RecommendTable
          words={words}
          addingId={addingId}
          onAdd={(word) => {
            void handleAdd(word);
          }}
        />
      )}

      {!loading && !error && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}
