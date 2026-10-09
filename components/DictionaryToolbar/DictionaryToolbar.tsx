"use client";

import Link from "next/link";

import Icon from "@/components/Icon/Icon";
import type { DictionaryFilters } from "@/types/words";

import styles from "./DictionaryToolbar.module.css";

type DictionaryToolbarProps = {
  filters: DictionaryFilters;
  categories: string[];
  totalToStudy: number;
  onFiltersChange: (filters: DictionaryFilters) => void;
  onAddWord: () => void;
};

export default function DictionaryToolbar({
  filters,
  categories,
  totalToStudy,
  onFiltersChange,
  onAddWord,
}: DictionaryToolbarProps) {
  function updateFilters(changes: Partial<DictionaryFilters>) {
    onFiltersChange({ ...filters, ...changes });
  }

  return (
    <section className={styles.toolbar} aria-label="Dictionary filters">
      <div className={styles.filters}>
        <div className={styles.searchField}>
          <input
            type="search"
            value={filters.keyword}
            onChange={(event) => updateFilters({ keyword: event.target.value })}
            placeholder="Find the word"
            aria-label="Find the word"
            className={styles.searchInput}
          />

          <Icon name="search" width={20} height={20} />
        </div>

        <div className={styles.categoryField}>
          <select
            value={filters.category}
            onChange={(event) => {
              const category = event.target.value;

              onFiltersChange({
                ...filters,
                category,
                isIrregular: category === "verb" ? false : undefined,
              });
            }}
            aria-label="Select category"
            className={styles.categorySelect}
          >
            <option value="">Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <Icon name="arrow-down" width={13} height={8} />
        </div>

        {filters.category === "verb" && (
          <fieldset className={styles.verbTypes}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="verbType"
                checked={filters.isIrregular === false}
                onChange={() => updateFilters({ isIrregular: false })}
              />
              Regular
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="verbType"
                checked={filters.isIrregular === true}
                onChange={() => updateFilters({ isIrregular: true })}
              />
              Irregular
            </label>
          </fieldset>
        )}
      </div>

      <div className={styles.actions}>
        <p className={styles.statistics}>
          To study: <span>{totalToStudy}</span>
        </p>

        <div className={styles.actionButtons}>
          <button
            type="button"
            className={styles.addButton}
            onClick={onAddWord}
          >
            Add word
            <Icon name="plus" width={20} height={20} />
          </button>

          <Link href="/training" className={styles.trainingLink}>
            Train oneself
            <Icon name="arrow-right" width={15} height={9} />
          </Link>
        </div>
      </div>
    </section>
  );
}
