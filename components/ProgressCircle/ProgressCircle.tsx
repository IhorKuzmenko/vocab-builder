import styles from "./ProgressCircle.module.css";

type ProgressCircleProps = {
  progress: number;
  size?: number;
};

export default function ProgressCircle({
  progress,
  size = 20,
}: ProgressCircleProps) {
  const value = Math.min(100, Math.max(0, progress));
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      role="img"
      aria-label={`Progress: ${value}%`}
      className={styles.circle}
    >
      <circle cx="10" cy="10" r={radius} className={styles.track} />
      <circle
        cx="10"
        cy="10"
        r={radius}
        className={styles.indicator}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
