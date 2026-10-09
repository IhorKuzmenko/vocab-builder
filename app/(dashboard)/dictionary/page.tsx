import type { Metadata } from "next";

import DictionaryClient from "@/components/DictionaryClient/DictionaryClient";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dictionary | VocabBuilder",
  description: "Manage, search and practice your English vocabulary.",
};

export default function DictionaryPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <DictionaryClient />
      </div>
    </main>
  );
}
