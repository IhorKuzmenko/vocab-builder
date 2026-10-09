"use client";

import styles from "./Pagination.module.css";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => {
      const start = Math.max(1, Math.min(page - 2, totalPages - 4));

      return start + index;
    },
  );

  return (
    <nav className={styles.pagination} aria-label="Dictionary pages">
      <button
        type="button"
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        aria-label="First page"
      >
        «
      </button>

      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {visiblePages.map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onPageChange(number)}
          className={page === number ? styles.active : ""}
          aria-current={page === number ? "page" : undefined}
        >
          {number}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        ›
      </button>

      <button
        type="button"
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        aria-label="Last page"
      >
        »
      </button>
    </nav>
  );
}
