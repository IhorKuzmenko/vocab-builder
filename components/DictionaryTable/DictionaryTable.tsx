"use client";

import { useEffect, useRef, useState } from "react";

import ProgressCircle from "@/components/ProgressCircle/ProgressCircle";
import type { Word } from "@/types/words";

import styles from "./DictionaryTable.module.css";

type DictionaryTableProps = {
  words: Word[];
  onEdit?: (word: Word) => void;
  onDelete?: (word: Word) => void;
};

export default function DictionaryTable({
  words,
  onEdit,
  onDelete,
}: DictionaryTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (!openMenuId) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuId]);

  if (words.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>Your dictionary is empty</h2>
        <p>
          Add your first word or choose one from the recommended vocabulary.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">
              <div className={styles.heading}>
                <span>Word</span>
                <svg width="24" height="24" aria-hidden="true">
                  <use href="/icons/sprite.svg#united-kingdom-logo" />
                </svg>
              </div>
            </th>

            <th scope="col">
              <div className={styles.heading}>
                <span>Translation</span>
                <svg width="24" height="24" aria-hidden="true">
                  <use href="/icons/sprite.svg#ukraine-logo" />
                </svg>
              </div>
            </th>

            <th scope="col" className={styles.categoryColumn}>
              Category
            </th>

            <th scope="col">Progress</th>

            <th scope="col" className={styles.actionsHeading}>
              <span className={styles.visuallyHidden}>Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {words.map((word) => {
            const isMenuOpen = openMenuId === word._id;
            const progress = Math.min(100, Math.max(0, word.progress ?? 0));

            return (
              <tr key={word._id}>
                <td>{word.en}</td>
                <td>{word.ua}</td>

                <td className={styles.categoryColumn}>
                  {word.category.charAt(0).toUpperCase() +
                    word.category.slice(1)}
                </td>

                <td>
                  <div className={styles.progress}>
                    <span className={styles.progressValue}>{progress}%</span>
                    <ProgressCircle progress={progress} />
                  </div>
                </td>

                <td
                  className={styles.actionsCell}
                  ref={isMenuOpen ? menuRef : null}
                >
                  <button
                    type="button"
                    className={styles.menuTrigger}
                    aria-label={`Actions for ${word.en}`}
                    aria-expanded={isMenuOpen}
                    onClick={() => setOpenMenuId(isMenuOpen ? null : word._id)}
                  >
                    <span aria-hidden="true">···</span>
                  </button>

                  {isMenuOpen && (
                    <div className={styles.dropdown}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onEdit?.(word);
                        }}
                        disabled={!onEdit}
                      >
                        <svg width="16" height="16" aria-hidden="true">
                          <use href="/icons/sprite.svg#edit-icon" />
                        </svg>
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete?.(word);
                        }}
                        disabled={!onDelete}
                      >
                        <svg width="16" height="16" aria-hidden="true">
                          <use href="/icons/sprite.svg#trash-icon" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
