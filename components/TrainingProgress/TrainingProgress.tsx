
import styles from "./TrainingProgress.module.css";

interface TrainingProgressProps {
  current: number;
  total: number;
}

export default function TrainingProgress({
  current,
  total,
}: TrainingProgressProps) {
  const safeTotal = Math.max(0, total);
  const safeCurrent = Math.min(Math.max(0, current), safeTotal);

  const progress =
    safeTotal > 0 ? (safeCurrent / safeTotal) * 100 : 0;

  const remaining = safeTotal - safeCurrent;

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.circle}
        style={{
          background: `conic-gradient(
            var(--color-green) 0% ${progress}%,
            #e8e8e8 ${progress}% 100%
          )`,
        }}
        role="progressbar"
        aria-label="Training progress"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
        aria-valuetext={`${safeCurrent} of ${safeTotal} exercises completed`}
      >
        <span className={styles.value}>{remaining}</span>
      </div>
    </div>
  );
}
