
"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

import Icon from "@/components/Icon/Icon";
import type { CreateWordRequest, WordCategory } from "@/types/words";
import type { WordDetection } from "@/lib/word-category";

import styles from "./AddWordModal.module.css";

type AddWordModalProps = {
  categories: string[];
  onClose: () => void;
  onSuccess: () => void;
};

type DetectionState = {
  word: string;
  result: WordDetection | null;
  error: string;
};

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function AddWordModal({
  categories,
  onClose,
  onSuccess,
}: AddWordModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [category, setCategory] = useState<WordCategory | "">("");
  const [isIrregular, setIsIrregular] = useState(false);
  const [en, setEn] = useState("");
  const [ua, setUa] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [detectionState, setDetectionState] = useState<DetectionState>({
    word: "",
    result: null,
    error: "",
  });

  const currentWord = en.trim().toLowerCase();

  const detection =
    detectionState.word === currentWord
      ? detectionState.result
      : null;

  const detectionError =
    detectionState.word === currentWord
      ? detectionState.error
      : "";

  const isDetecting =
    currentWord.length > 0 &&
    !currentWord.includes("-") &&
    detectionState.word !== currentWord;

  const availableCategories = categories as WordCategory[];

  const detectedCategories =
    detection?.categories.filter((item) =>
      availableCategories.includes(item),
    ) ?? [];

  const autoCategory =
    detectedCategories.length === 1
      ? detectedCategories[0]
      : "";

  const selectedCategory = category || autoCategory;

  const selectedIsIrregular =
    selectedCategory === "verb" &&
    (isIrregular ||
      (category === "" &&
        autoCategory === "verb" &&
        Boolean(detection?.irregularForms)));

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  useEffect(() => {
    const word = en.trim().toLowerCase();

    if (!word || word.includes("-")) {
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/words/detect-category?word=${encodeURIComponent(word)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Category detection unavailable.");
        }

        const result = (await response.json()) as WordDetection;

        if (controller.signal.aborted) return;

        setDetectionState({
          word,
          result,
          error: "",
        });
      } catch {
        if (controller.signal.aborted) return;

        setDetectionState({
          word,
          result: null,
          error:
            "Could not detect category. Please select it manually.",
        });
      }
    }, 600);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [en]);

  function handleEnglishChange(value: string) {
    setEn(value);
    setCategory("");
    setIsIrregular(false);
    setError("");
  }

  function handleCategoryChange(value: string) {
    setCategory(value as WordCategory | "");
    setIsIrregular(false);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || isDetecting) return;

    setError("");

    if (!selectedCategory) {
      setError("Please select a word category.");
      return;
    }

    const englishWord = en.trim();
    const ukrainianWord = ua.trim();

    if (!englishWord || !ukrainianWord) {
      setError("Please fill in both translations.");
      return;
    }

    let finalEnglishWord = englishWord;

    if (selectedCategory === "verb" && selectedIsIrregular) {
      if (detection?.irregularForms) {
        finalEnglishWord = detection.irregularForms;
      } else if (!/^[^-]+-[^-]+-[^-]+$/.test(englishWord)) {
        setError(
          "Enter an irregular verb in the format: go-went-gone.",
        );
        return;
      }
    }

    const payload: CreateWordRequest = {
      en: finalEnglishWord,
      ua: ukrainianWord,
      category: selectedCategory,
    };

    if (selectedCategory === "verb") {
      payload.isIrregular = selectedIsIrregular;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/words/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data: { message?: string } = await response
          .json()
          .catch(() => ({}));

        throw new Error(data.message || "Failed to add word.");
      }

      onSuccess();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong.",
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
          aria-label="Close modal"
          disabled={isSubmitting}
        >
          ×
        </button>

        <h2 id={titleId} className={styles.title}>
          Add word
        </h2>

        <p className={styles.description}>
          Adding a new word to the dictionary is an important step in enriching
          the language base and expanding the vocabulary.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.categorySection}>
            <div className={styles.selectWrapper}>
              <select
                value={selectedCategory}
                onChange={(event) =>
                  handleCategoryChange(event.target.value)
                }
                aria-label="Word category"
                className={styles.categorySelect}
                required
              >
                <option value="" disabled>
                  Select category
                </option>

                {categories.map((item) => (
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
              detection &&
              detectedCategories.length === 1 && (
                <p className={styles.hint} role="status">
                  Detected: {formatCategory(detectedCategories[0])}
                </p>
              )}

            {!isDetecting &&
              detection &&
              detectedCategories.length > 1 && (
                <p className={styles.hint} role="status">
                  Possible categories:{" "}
                  {detectedCategories.map(formatCategory).join(", ")}.
                  Please select the correct one.
                </p>
              )}

            {!isDetecting &&
              detection &&
              detectedCategories.length === 0 && (
                <p className={styles.hint}>
                  Category not found. Please select it manually.
                </p>
              )}

            {detectionError && (
              <p className={styles.hint} role="status">
                {detectionError}
              </p>
            )}

            {selectedCategory === "verb" && (
              <>
                <fieldset className={styles.verbTypes}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="newWordVerbType"
                      checked={!selectedIsIrregular}
                      onChange={() => {
                        setCategory("verb");
                        setIsIrregular(false);
                      }}
                    />
                    Regular
                  </label>

                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="newWordVerbType"
                      checked={selectedIsIrregular}
                      onChange={() => {
                        setCategory("verb");
                        setIsIrregular(true);
                      }}
                    />
                    Irregular
                  </label>
                </fieldset>

                {selectedIsIrregular && (
                  <p className={styles.hint}>
                    {detection?.irregularForms
                      ? `Forms: ${detection.irregularForms}`
                      : "Enter the verb in the format I form-II form-III form."}
                  </p>
                )}
              </>
            )}
          </div>

          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <input
                id="add-word-ua"
                type="text"
                value={ua}
                onChange={(event) => setUa(event.target.value)}
                placeholder="Працювати"
                maxLength={100}
                required
                className={styles.wordInput}
              />

              <label
                htmlFor="add-word-ua"
                className={styles.languageLabel}
              >
                <Icon name="ukraine-logo" width={24} height={24} />
                <span>Ukrainian</span>
              </label>
            </div>

            <div className={styles.fieldRow}>
              <input
                id="add-word-en"
                type="text"
                value={en}
                onChange={(event) =>
                  handleEnglishChange(event.target.value)
                }
                placeholder="Work"
                maxLength={100}
                required
                className={styles.wordInput}
              />

              <label
                htmlFor="add-word-en"
                className={styles.languageLabel}
              >
                <Icon
                  name="united-kingdom-logo"
                  width={24}
                  height={24}
                />
                <span>English</span>
              </label>
            </div>
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
                !selectedCategory
              }
            >
              {isSubmitting ? "Adding..." : "Add"}
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
