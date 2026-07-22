import styles from "./loadingSpinner.module.css";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className={styles.loadingWrapper} role="status" aria-live="polite">
      <span className={styles.spinner}></span>
      {message ? <p className={styles.loadingMessage}>{message}</p> : null}
    </div>
  );
}
