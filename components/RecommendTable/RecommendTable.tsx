import type { Word } from "@/types/words";

import styles from "./RecommendTable.module.css";

type RecommendTableProps = {
  words: Word[];
  addingId: string | null;
  onAdd: (word: Word) => void;
};

export default function RecommendTable({
  words,
  addingId,
  onAdd,
}: RecommendTableProps) {
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

            <th scope="col">Category</th>

            <th scope="col" className={styles.actionsHeading}>
              <span className={styles.visuallyHidden}>Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {words.map((word) => {
            const isAdding = addingId === word._id;

            return (
              <tr key={word._id}>
                <td>{word.en}</td>
                <td>{word.ua}</td>
                <td>
                  {word.category.charAt(0).toUpperCase() +
                    word.category.slice(1)}
                </td>

                <td className={styles.actionsCell}>
                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => onAdd(word)}
                    disabled={addingId !== null}
                    aria-label={
                      isAdding
                        ? `Adding ${word.en}`
                        : `Add ${word.en} to dictionary`
                    }
                  >
                    <span className={styles.addText}>
                      {isAdding ? "Adding..." : "Add to dictionary"}
                    </span>

                    <span className={styles.arrow} aria-hidden="true">
                      {isAdding ? "…" : "→"}
                    </span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {words.length === 0 && (
        <p className={styles.emptyState}>No recommended words found.</p>
      )}
    </div>
  );
}
