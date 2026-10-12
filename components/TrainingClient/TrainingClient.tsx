
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import TrainingEmpty from "@/components/TrainingEmpty/TrainingEmpty";

import type {
  TrainingAnswer,
  TrainingAnswerResult,
  TrainingTask,
} from "@/types/training";

import styles from "./TrainingClient.module.css";

function isTrainingTask(value: unknown): value is TrainingTask {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const task = value as Record<string, unknown>;

  return (
    typeof task._id === "string" &&
    (task.task === "en" || task.task === "ua") &&
    (task.en === undefined || typeof task.en === "string") &&
    (task.ua === undefined || typeof task.ua === "string")
  );
}

function parseTrainingTasks(data: unknown): TrainingTask[] | null {
  let tasks: unknown;

  if (Array.isArray(data)) {
    tasks = data;
  } else if (typeof data === "object" && data !== null) {
    if ("tasks" in data) {
      tasks = data.tasks;
    } else if ("words" in data) {
      tasks = data.words;
    } else {
      return null;
    }
  } else {
    return null;
  }

  if (!Array.isArray(tasks) || !tasks.every(isTrainingTask)) {
    return null;
  }

  return tasks;
}

function isTrainingResult(
  value: unknown,
): value is TrainingAnswerResult {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const result = value as Record<string, unknown>;

  return (
    typeof result._id === "string" &&
    typeof result.en === "string" &&
    typeof result.ua === "string" &&
    (result.task === "en" || result.task === "ua") &&
    typeof result.isDone === "boolean"
  );
}

export default function TrainingClient() {
  const router = useRouter();

  const [tasks, setTasks] = useState<TrainingTask[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [results, setResults] = useState<
    TrainingAnswerResult[] | null
  >(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      try {
        const response = await fetch("/api/words/tasks", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load training tasks (${response.status})`,
          );
        }

        const data: unknown = await response.json();
        const parsedTasks = parseTrainingTasks(data);

        if (controller.signal.aborted) return;

        if (parsedTasks === null) {
          setTasks([]);
          setError("Unexpected training tasks response format");
          return;
        }

        setTasks(parsedTasks);
        setError("");
      } catch (error) {
        if (controller.signal.aborted) return;

        setTasks([]);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadTasks();

    return () => controller.abort();
  }, []);

  const currentTask = tasks[index];

  const currentAnswer = currentTask
    ? (answers[currentTask._id] ?? "")
    : "";

  const isEnglishAnswer = currentTask?.task === "en";

  const sourceWord = currentTask
    ? isEnglishAnswer
      ? currentTask.ua
      : currentTask.en
    : "";

  const progress = tasks.length
    ? ((index + 1) / tasks.length) * 100
    : 0;

  function handleAnswerChange(value: string) {
    if (!currentTask) return;

    setAnswers((previous) => ({
      ...previous,
      [currentTask._id]: value,
    }));
  }

  function handleNext() {
    if (index < tasks.length - 1) {
      setIndex((previous) => previous + 1);
    }
  }

  async function handleSave() {
    if (saving || tasks.length === 0) return;

    const payload: TrainingAnswer[] = tasks.map((task) => {
      const answer = (answers[task._id] ?? "").trim();

      return {
        _id: task._id,
        task: task.task,
        en: task.task === "en" ? answer : (task.en ?? ""),
        ua: task.task === "ua" ? answer : (task.ua ?? ""),
      };
    });

    setSaving(true);

    try {
      const response = await fetch("/api/words/answers", {
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

        throw new Error(
          data.message || "Failed to save training",
        );
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data) || !data.every(isTrainingResult)) {
        throw new Error("Unexpected training results format");
      }

      setResults(data);
      toast.success("Training saved successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save training",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    router.push("/dictionary");
  }

  if (loading) {
    return (
      <section className={`container ${styles.training}`}>
        <p className={styles.status}>Loading training...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`container ${styles.training}`}>
        <p role="alert" className={styles.status}>
          {error}
        </p>
      </section>
    );
  }

  if (tasks.length === 0) {
    return (
      <section className={`container ${styles.training}`}>
        <TrainingEmpty />
      </section>
    );
  }

  return (
    <section className={`container ${styles.training}`}>
      <div className={styles.progressWrapper}>
        <div
          className={styles.progressCircle}
          style={{
            background: `conic-gradient(var(--color-green) ${progress}%, #e8e8e8 ${progress}%)`,
          }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={tasks.length}
          aria-valuenow={index + 1}
          aria-label="Training progress"
        >
          <span>{tasks.length - index}</span>
        </div>
      </div>

      <div className={styles.exercise}>
        <div className={styles.answerPanel}>
          <div className={styles.panelHeading}>
            <label htmlFor="training-answer">
              Введіть переклад
            </label>

            <span className={styles.language}>
              <svg width="24" height="24" aria-hidden="true">
                <use
                  href={
                    isEnglishAnswer
                      ? "/icons/sprite.svg#united-kingdom-logo"
                      : "/icons/sprite.svg#ukraine-logo"
                  }
                />
              </svg>

              {isEnglishAnswer ? "English" : "Ukrainian"}
            </span>
          </div>

          <textarea
            id="training-answer"
            className={styles.answerInput}
            value={currentAnswer}
            onChange={(event) =>
              handleAnswerChange(event.target.value)
            }
            aria-label="Your translation"
          />

          <button
            type="button"
            className={styles.nextButton}
            onClick={handleNext}
            disabled={index === tasks.length - 1}
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className={styles.wordPanel}>
          <div className={styles.panelHeading}>
            <span className={styles.sourceWord}>
              {sourceWord || "—"}
            </span>

            <span className={styles.language}>
              <svg width="24" height="24" aria-hidden="true">
                <use
                  href={
                    isEnglishAnswer
                      ? "/icons/sprite.svg#ukraine-logo"
                      : "/icons/sprite.svg#united-kingdom-logo"
                  }
                />
              </svg>

              {isEnglishAnswer ? "Ukrainian" : "English"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>

      {results && (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="training-results-title"
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleCancel}
              aria-label="Close results"
            >
              ×
            </button>

            <h2 id="training-results-title">Well done</h2>

            <div className={styles.resultColumns}>
              <div>
                <h3>Correct answers:</h3>

                {results
                  .filter((result) => result.isDone)
                  .map((result) => (
                    <p key={result._id}>
                      {result.en || result.ua}
                    </p>
                  ))}
              </div>

              <div>
                <h3>Mistakes:</h3>

                {results
                  .filter((result) => !result.isDone)
                  .map((result) => (
                    <p key={result._id}>
                      {result.en || result.ua}
                    </p>
                  ))}
              </div>
            </div>

            <div className={styles.bookIllustration}>
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
      )}
    </section>
  );
}
