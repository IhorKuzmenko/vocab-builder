
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import type { TrainingAnswerResult } from "@/types/training";

import styles from "./TrainingResultModal.module.css";

interface TrainingResultModalProps {
  results: TrainingAnswerResult[];
  onClose: () => void;
}

function getUniqueWords(
  results: TrainingAnswerResult[],
  isCorrect: boolean,
): string[] {
  const uniqueWords = new Map<string, string>();

  results
    .filter((result) => result.isDone === isCorrect)
    .forEach((result) => {
      const word = result.en.trim();

      if (!word) return;

      const key = word.toLocaleLowerCase();

      if (!uniqueWords.has(key)) {
        uniqueWords.set(key, word);
      }
    });

  return Array.from(uniqueWords.values());
}

export default function TrainingResultModal({
  results,
  onClose,
}: TrainingResultModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const correctWords = getUniqueWords(results, true);
  const mistakeWords = getUniqueWords(results, false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab") {
        const focusableElements =
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );

        if (!focusableElements?.length) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [onClose]);

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="training-results-title"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close training results"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 id="training-results-title" className={styles.title}>
          Well done
        </h2>

        <div className={styles.columns}>
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Correct answers:</h3>

            <ul className={styles.wordList}>
              {correctWords.map((word) => (
                <li key={word.toLocaleLowerCase()}>{word}</li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Mistakes:</h3>

            <ul className={styles.wordList}>
              {mistakeWords.map((word) => (
                <li key={word.toLocaleLowerCase()}>{word}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.illustration}>
          <Image
            src="/images/book@2x.png"
            alt="Open book illustration"
            width={160}
            height={140}
            sizes="(max-width: 767px) 120px, 160px"
          />
        </div>
      </div>
    </div>
  );
}
