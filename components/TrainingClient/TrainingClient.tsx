
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import TrainingEmpty from "@/components/TrainingEmpty/TrainingEmpty";
import TrainingProgress from "@/components/TrainingProgress/TrainingProgress";
import TrainingResultModal from "@/components/TrainingResultModal/TrainingResultModal";

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

function getErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null) {
    const error = data as Record<string, unknown>;

    if (typeof error.message === "string") {
      return error.message;
    }

    if (typeof error.error === "string") {
      return error.error;
    }
  }

  return fallback;
}

export default function TrainingClient() {
  const router = useRouter();

  const [tasks, setTasks] = useState<TrainingTask[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
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

        const data: unknown = await response.json();

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, "Failed to load training tasks"),
          );
        }

        const parsedTasks = parseTrainingTasks(data);

        if (controller.signal.aborted) return;

        if (parsedTasks === null) {
          throw new Error("Unexpected training tasks response format");
        }

        setTasks(parsedTasks);
        setAnswers({});
        setIndex(0);
        setError("");
      } catch (caughtError) {
        if (controller.signal.aborted) return;

        setTasks([]);
        setError(
          caughtError instanceof Error
            ? caughtError.message
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
  const currentAnswer = answers[index] ?? "";

  const isEnglishAnswer = currentTask?.task === "en";

  const sourceWord = currentTask
    ? isEnglishAnswer
      ? currentTask.ua
      : currentTask.en
    : "";

  const completedCount = Object.values(answers).filter(
    (answer) => answer.trim().length > 0,
  ).length;

  function handleAnswerChange(value: string) {
    setAnswers((previous) => ({
      ...previous,
      [index]: value,
    }));
  }

  function handleNext() {
    if (index < tasks.length - 1) {
      setIndex((previous) => previous + 1);
    }
  }

  async function handleSave() {
    if (saving || tasks.length === 0) return;

    const hasEmptyAnswers = tasks.some(
      (_, taskIndex) => !(answers[taskIndex] ?? "").trim(),
    );

    if (hasEmptyAnswers) {
      toast.error("Please complete all translations before saving");
      return;
    }

    const payload: TrainingAnswer[] = tasks.map((task, taskIndex) => {
      const answer = (answers[taskIndex] ?? "").trim();

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

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Failed to save training (${response.status})`,
          ),
        );
      }

      if (!Array.isArray(data) || !data.every(isTrainingResult)) {
        throw new Error("Unexpected training results format");
      }

      setResults(data);
      toast.success("Training saved successfully");
    } catch (caughtError) {
      toast.error(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to save training",
      );
    } finally {
      setSaving(false);
    }
  }

  const handleCancel = useCallback(() => {
    router.push("/dictionary");
  }, [router]);

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
      <TrainingProgress
        current={completedCount}
        total={tasks.length}
      />

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
            placeholder="Enter translation"
          />

          <button
            type="button"
            className={styles.nextButton}
            onClick={handleNext}
            disabled={index === tasks.length - 1 || saving}
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
        <TrainingResultModal
          results={results}
          onClose={handleCancel}
        />
      )}
    </section>
  );
}
