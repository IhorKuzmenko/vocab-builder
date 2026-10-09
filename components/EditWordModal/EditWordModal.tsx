"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

import Icon from "@/components/Icon/Icon";
import type { Word } from "@/types/words";

import styles from "./EditWordModal.module.css";

type EditWordModalProps = {
  word: Word;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditWordModal({
  word,
  onClose,
  onSuccess,
}: EditWordModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [en, setEn] = useState(word.en);
  const [ua, setUa] = useState(word.ua);

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

    const trimmedEn = en.trim();
    const trimmedUa = ua.trim();

    if (!trimmedEn || !trimmedUa) {
      setError("Both fields are required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const payload = {
      en: trimmedEn,
      ua: trimmedUa,
      category: word.category,
      ...(word.category === "verb" && {
        isIrregular: word.isIrregular ?? false,
      }),
    };

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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
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

              <label htmlFor="edit-word-ua" className={styles.languageLabel}>
                <Icon name="ukraine-logo" width={28} height={28} />
                <span>Ukrainian</span>
              </label>
            </div>

            <div className={styles.fieldRow}>
              <input
                id="edit-word-en"
                type="text"
                value={en}
                onChange={(event) => setEn(event.target.value)}
                required
                maxLength={100}
                className={styles.wordInput}
              />

              <label htmlFor="edit-word-en" className={styles.languageLabel}>
                <Icon name="united-kingdom-logo" width={28} height={28} />
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
              disabled={isSubmitting || !en.trim() || !ua.trim()}
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
