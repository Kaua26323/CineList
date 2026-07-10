import { CircleAlert, RotateCcw } from "lucide-react";
import { Link } from "react-router";

import type { AppError } from "../../types/errors";
import { Button } from "../Button/Button";
import styles from "./ErrorMessage.module.css";

export interface ErrorMessageLink {
  label: string;
  to: string;
}

export interface ErrorMessageProps {
  error: AppError | string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  recoveryLink?: ErrorMessageLink;
}

export function ErrorMessage({
  error,
  title = "Something went wrong",
  onRetry,
  retryLabel = "Try again",
  recoveryLink,
}: ErrorMessageProps) {
  const message = typeof error === "string" ? error : error.message;

  return (
    <section className={styles.container} role="alert" aria-labelledby="error-title">
      <CircleAlert className={styles.icon} aria-hidden="true" />
      <div className={styles.content}>
        <h2 className={styles.title} id="error-title">
          {title}
        </h2>
        <p className={styles.message}>{message}</p>
        {(onRetry || recoveryLink) && (
          <div className={styles.actions}>
            {onRetry && (
              <Button variant="secondary" onClick={onRetry}>
                <RotateCcw size={18} aria-hidden="true" />
                {retryLabel}
              </Button>
            )}
            {recoveryLink && (
              <Link className={styles.link} to={recoveryLink.to}>
                {recoveryLink.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
