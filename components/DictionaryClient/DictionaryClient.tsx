"use client";

import { useEffect, useState } from "react";

import AddWordModal from "@/components/AddWordModal/AddWordModal";
import EditWordModal from "@/components/EditWordModal/EditWordModal";
import DictionaryToolbar from "@/components/DictionaryToolbar/DictionaryToolbar";
import DictionaryTable from "@/components/DictionaryTable/DictionaryTable";
import Pagination from "@/components/Pagination/Pagination";

import type {
  DictionaryFilters,
  Word,
  WordsResponse,
  WordsStatistics,
} from "@/types/words";

import styles from "./DictionaryClient.module.css";

const PAGE_SIZE = 7;

const initialFilters: DictionaryFilters = {
  keyword: "",
  category: "",
  isIrregular: undefined,
};

export default function DictionaryClient() {
  const [filters, setFilters] = useState<DictionaryFilters>(initialFilters);

  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [categories, setCategories] = useState<string[]>([]);
  const [totalToStudy, setTotalToStudy] = useState(0);

  const [words, setWords] = useState<Word[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingWordId, setDeletingWordId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(filters.keyword.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [filters.keyword]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [categoriesResponse, statisticsResponse] = await Promise.all([
          fetch("/api/words/categories"),
          fetch("/api/words/statistics"),
        ]);

        if (!categoriesResponse.ok || !statisticsResponse.ok) {
          throw new Error("Failed to load dictionary information.");
        }

        const categoriesData: string[] = await categoriesResponse.json();

        const statisticsData: WordsStatistics = await statisticsResponse.json();

        setCategories(categoriesData);
        setTotalToStudy(statisticsData.totalCount);
      } catch (error) {
        console.error(error);
        setError("Unable to load dictionary information.");
      }
    }

    void loadInitialData();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadWords() {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (debouncedKeyword) {
        params.set("keyword", debouncedKeyword);
      }

      if (filters.category) {
        params.set("category", filters.category);
      }

      if (filters.category === "verb" && filters.isIrregular !== undefined) {
        params.set("isIrregular", String(filters.isIrregular));
      }

      try {
        const response = await fetch(`/api/words/own?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load words.");
        }

        const data: WordsResponse = await response.json();

        if (controller.signal.aborted) return;

        setWords(data.results ?? []);
        setTotalPages(data.totalPages ?? 0);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(error);

        setError("Unable to load words. Please try again.");
        setWords([]);
        setTotalPages(0);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadWords();

    return () => controller.abort();
  }, [
    page,
    debouncedKeyword,
    filters.category,
    filters.isIrregular,
    refreshKey,
  ]);

  function handleFiltersChange(nextFilters: DictionaryFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  async function refreshStatistics() {
    try {
      const response = await fetch("/api/words/statistics");

      if (!response.ok) return;

      const data: WordsStatistics = await response.json();

      setTotalToStudy(data.totalCount);
    } catch (error) {
      console.error("Failed to refresh statistics:", error);
    }
  }

  function handleWordCreated() {
    setIsAddModalOpen(false);
    setPage(1);
    setRefreshKey((previous) => previous + 1);

    void refreshStatistics();
  }

  function handleWordUpdated() {
    setEditingWord(null);
    setRefreshKey((previous) => previous + 1);
  }

  async function handleDeleteWord(word: Word) {
    if (deletingWordId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${word.en}"?`,
    );

    if (!confirmed) return;

    setError("");
    setDeletingWordId(word._id);

    try {
      const response = await fetch(
        `/api/words/delete/${encodeURIComponent(word._id)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data: { message?: string } = await response
          .json()
          .catch(() => ({}));

        throw new Error(data.message || "Failed to delete word.");
      }

      setWords((previous) => previous.filter((item) => item._id !== word._id));

      if (words.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        setRefreshKey((previous) => previous + 1);
      }

      void refreshStatistics();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to delete word.",
      );
    } finally {
      setDeletingWordId(null);
    }
  }

  return (
    <div className={styles.dictionary}>
      <DictionaryToolbar
        filters={filters}
        categories={categories}
        totalToStudy={totalToStudy}
        onFiltersChange={handleFiltersChange}
        onAddWord={() => setIsAddModalOpen(true)}
      />

      <div className={styles.content}>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className={styles.loading}>Loading words...</p>
        ) : (
          <>
            <DictionaryTable
              words={words}
              onEdit={(word) => setEditingWord(word)}
              onDelete={handleDeleteWord}
            />

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {isAddModalOpen && (
        <AddWordModal
          categories={categories}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleWordCreated}
        />
      )}

      {editingWord && (
        <EditWordModal
          word={editingWord}
          onClose={() => setEditingWord(null)}
          onSuccess={handleWordUpdated}
        />
      )}
    </div>
  );
}
