
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import styles from "./TrainingEmpty.module.css";

export default function TrainingEmpty() {
  const router = useRouter();

  return (
    <section className={styles.empty}>
      <div className={styles.illustration}>
        <Image
          src="/images/blood-report@2x.png"
          alt="Vocabulary learning illustration"
          width={265}
          height={282}
          sizes="(max-width: 767px) 144px, (max-width: 1023px) 200px, 265px"
          priority
        />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          You don&apos;t have a single word to learn right now.
        </h1>

        <p className={styles.description}>
          Please create or add a word to start the workout. We want to
          improve your vocabulary and develop your knowledge, so
          please share the words you are interested in adding to your
          study.
        </p>

        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => router.push("/dictionary")}
          >
            Add word
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => router.push("/dictionary")}
          >
            Cancel
          </button>
        </div>
      </div>
    </section>
  );
}
