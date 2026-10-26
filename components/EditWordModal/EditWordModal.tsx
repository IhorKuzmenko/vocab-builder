
"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

import Icon from "@/components/Icon/Icon";
import type { Word, WordCategory } from "@/types/words";
import { WORD_CATEGORIES } from "@/types/words";
import type { WordDetection } from "@/lib/word-category";

import styles from "./EditWordModal.module.css";

type EditWordModalProps = {
  word: Word;
  onClose: () => void;
  onSuccess: () => void;
};

type DetectionState = {
  word: string;
  result: WordDetection | null;
  error: string;
};

function formatCategory(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function EditWordModal({
  word,
  onClose,
  onSuccess,
}: EditWordModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [en, setEn] = useState(word.en);
  const [ua, setUa] = useState(word.ua);
  const [category, setCategory] = useState<WordCategory>(word.category);
  const [isIrregular, setIsIrregular] = useState(word.isIrregular ?? false);
  const [categoryChangedManually, setCategoryChangedManually] =
    useState(false);
  const [verbTypeChangedManually, setVerbTypeChangedManually] =
    useState(false);

  const [detectionState, setDetectionState] = useState<DetectionState>({
    word: "",
    result: null,
    error: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentWord = en.trim().toLowerCase();
  const originalWord = word.en.trim().toLowerCase();
  const englishChanged = currentWord !== originalWord;

  const detection =
    englishChanged && detectionState.word === currentWord
      ? detectionState.result
      : null;

  const detectionError =
    englishChanged && detectionState.word === currentWord
      ? detectionState.error
      : "";

  const isDetecting =
    englishChanged &&
    currentWord.length > 0 &&
    !currentWord.includes("-") &&
    detectionState.word !== currentWord;

  const detectedCategories =
    detection?.categories.filter((item) =>
      WORD_CATEGORIES.includes(item),
    ) ?? [];

  const autoCategory =
    detectedCategories.length === 1
      ? detectedCategories[0]
      : null;

  const selectedCategory =
    englishChanged && !categoryChangedManually && autoCategory
      ? autoCategory
      : category;

  const selectedIsIrregular =
    selectedCategory === "verb" &&
    (verbTypeChangedManually
      ? isIrregular
      : englishChanged && detection?.irregularForms
        ? true
        : isIrregular);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const value = en.trim().toLowerCase();

    if (
      !value ||
      value === word.en.trim().toLowerCase() ||
      value.includes("-")
    ) {
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/words/detect-category?word=${encodeURIComponent(value)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Category detection unavailable.");
        }

        const result = (await response.json()) as WordDetection;

        if (controller.signal.aborted) return;

        setDetectionState({
          word: value,
          result,
          error: "",
        });
      } catch {
        if (controller.signal.aborted) return;

        setDetectionState({
          word: value,
          result: null,
          error: "Could not detect category. Please select it manually.",
        });
      }
    }, 600);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [en, word.en]);

  function handleEnglishChange(value: string) {
    setEn(value);
    setError("");
    setCategoryChangedManually(false);
    setVerbTypeChangedManually(false);
    setIsIrregular(false);
  }

  function handleCategoryChange(value: WordCategory) {
    setCategory(value);
    setIsIrregular(false);
    setCategoryChangedManually(true);
    setVerbTypeChangedManually(false);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || isDetecting) return;

    const trimmedEn = en.trim();
    const trimmedUa = ua.trim();

    if (!trimmedEn || !trimmedUa) {
      setError("Both fields are required.");
      return;
    }

    let finalEnglishWord = trimmedEn;

    if (selectedCategory === "verb" && selectedIsIrregular) {
      if (englishChanged && detection?.irregularForms) {
        finalEnglishWord = detection.irregularForms;
      } else if (
        trimmedEn !== word.en.trim() &&
        !/^[^-]+-[^-]+-[^-]+$/.test(trimmedEn)
      ) {
        setError("Enter an irregular verb in the format: go-went-gone.");
        return;
      }
    }

    const payload = {
      en: finalEnglishWord,
      ua: trimmedUa,
      category: selectedCategory,
      ...(selectedCategory === "verb" && {
        isIrregular: selectedIsIrregular,
      }),
    };

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/words/edit/${encodeURIComponent(word._id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const data: { message?: string } = await response
          .json()
          .catch(() => ({}));

        throw new Error(data.message || "Failed to update word.");
      }

      onSuccess();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();

        if (!isSubmitting) onClose();
      }}
    >
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close edit modal"
          disabled={isSubmitting}
        >
          ×
        </button>

        <h2 id={titleId} className={styles.visuallyHidden}>
          Edit word
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <input
                id="edit-word-ua"
                type="text"
                value={ua}
                onChange={(event) => setUa(event.target.value)}
                required
                maxLength={100}
                autoFocus
                className={styles.wordInput}
              />

              <label
                htmlFor="edit-word-ua"
                className={styles.languageLabel}
              >
                <Icon name="ukraine-logo" width={28} height={28} />
                <span>Ukrainian</span>
              </label>
            </div>

            <div className={styles.fieldRow}>
              <input
                id="edit-word-en"
                type="text"
                value={en}
                onChange={(event) => handleEnglishChange(event.target.value)}
                required
                maxLength={100}
                className={styles.wordInput}
              />

              <label
                htmlFor="edit-word-en"
                className={styles.languageLabel}
              >
                <Icon name="united-kingdom-logo" width={28} height={28} />
                <span>English</span>
              </label>
            </div>
          </div>

          <div className={styles.categorySection}>
            <label
              htmlFor="edit-word-category"
              className={styles.categoryLabel}
            >
              Category
            </label>

            <div className={styles.selectWrapper}>
              <select
                id="edit-word-category"
                value={selectedCategory}
                onChange={(event) =>
                  handleCategoryChange(event.target.value as WordCategory)
                }
                className={styles.categorySelect}
                disabled={isSubmitting}
              >
                {WORD_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {formatCategory(item)}
                  </option>
                ))}
              </select>

              <Icon name="arrow-down" width={12} height={8} />
            </div>

            {isDetecting && (
              <p className={styles.hint} role="status">
                Detecting word category...
              </p>
            )}

            {!isDetecting &&
              englishChanged &&
              detectedCategories.length === 1 && (
                <p className={styles.hint} role="status">
                  Detected: {formatCategory(detectedCategories[0])}
                </p>
              )}

            {!isDetecting &&
              englishChanged &&
              detectedCategories.length > 1 && (
                <p className={styles.hint} role="status">
                  Possible categories:{" "}
                  {detectedCategories.map(formatCategory).join(", ")}.
                  Please select the correct one.
                </p>
              )}

            {!isDetecting && detectionError && (
              <p className={styles.hint} role="status">
                {detectionError}
              </p>
            )}

            {selectedCategory === "verb" && (
              <fieldset className={styles.verbTypes}>
                <legend className={styles.visuallyHidden}>Verb type</legend>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="editVerbType"
                    checked={!selectedIsIrregular}
                    onChange={() => {
                      setCategory("verb");
                      setIsIrregular(false);
                      setCategoryChangedManually(true);
                      setVerbTypeChangedManually(true);
                    }}
                  />
                  Regular
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="editVerbType"
                    checked={selectedIsIrregular}
                    onChange={() => {
                      setCategory("verb");
                      setIsIrregular(true);
                      setCategoryChangedManually(true);
                      setVerbTypeChangedManually(true);
                    }}
                  />
                  Irregular
                </label>
              </fieldset>
            )}

            {selectedCategory === "verb" && selectedIsIrregular && (
              <p className={styles.hint}>
                {detection?.irregularForms
                  ? `Forms: ${detection.irregularForms}`
                  : "Use I form-II form-III form."}
              </p>
            )}
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={
                isSubmitting ||
                isDetecting ||
                !en.trim() ||
                !ua.trim()
              }
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
