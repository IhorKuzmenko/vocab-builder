"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

import Icon from "@/components/Icon/Icon";
import type { CreateWordRequest, WordCategory } from "@/types/words";

import styles from "./AddWordModal.module.css";

type AddWordModalProps = {
  categories: string[];
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddWordModal({
  categories,
  onClose,
  onSuccess,
}: AddWordModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [category, setCategory] = useState("verb");
  const [isIrregular, setIsIrregular] = useState(false);
  const [en, setEn] = useState("");
  const [ua, setUa] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    const payload: CreateWordRequest = {
      en: en.trim(),
      ua: ua.trim(),
      category: category as WordCategory,
    };

    if (category === "verb") {
      payload.isIrregular = isIrregular;
    }

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
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
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

        if (!isSubmitting) {
          onClose();
        }
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
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setIsIrregular(false);
                }}
                aria-label="Word category"
                className={styles.categorySelect}
                required
              >
                {categories.length === 0 && <option value="verb">Verb</option>}

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>

              <Icon name="arrow-down" width={12} height={8} />
            </div>

            {category === "verb" && (
              <>
                <fieldset className={styles.verbTypes}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="newWordVerbType"
                      checked={!isIrregular}
                      onChange={() => setIsIrregular(false)}
                    />
                    Regular
                  </label>

                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="newWordVerbType"
                      checked={isIrregular}
                      onChange={() => setIsIrregular(true)}
                    />
                    Irregular
                  </label>
                </fieldset>

                {category === "verb" && isIrregular && (
                  <p className={styles.hint}>
                    Such data must be entered in the format I form-II form-III
                    form.
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

              <label htmlFor="add-word-ua" className={styles.languageLabel}>
                <Icon name="ukraine-logo" width={24} height={24} />
                <span>Ukrainian</span>
              </label>
            </div>

            <div className={styles.fieldRow}>
              <input
                id="add-word-en"
                type="text"
                value={en}
                onChange={(event) => setEn(event.target.value)}
                placeholder="Work"
                maxLength={100}
                required
                className={styles.wordInput}
              />

              <label htmlFor="add-word-en" className={styles.languageLabel}>
                <Icon name="united-kingdom-logo" width={24} height={24} />
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
              disabled={isSubmitting}
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
