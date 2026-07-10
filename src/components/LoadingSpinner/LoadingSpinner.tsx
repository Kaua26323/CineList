import styles from "./LoadingSpinner.module.css";

export interface LoadingSpinnerProps {
  label?: string;
  size?: "small" | "medium" | "large";
}

export function LoadingSpinner({
  label = "Loading movies…",
  size = "medium",
}: LoadingSpinnerProps) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <span
        className={`${styles.spinner} ${styles[size]}`}
        aria-hidden="true"
      />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
