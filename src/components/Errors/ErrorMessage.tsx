import styles from "./errorMessage.module.css";

interface ErrorMessageContext {
  title: string;
  code?: string;
  message?: string;
}

interface ErrorMessageAction {
  label: string;
  onClick: () => void;
}

interface ErrorMessageProps {
  error: ErrorMessageContext;
  onRetry?: () => void;
  action?: ErrorMessageAction;
}

export function ErrorMessage({ error, action, onRetry }: ErrorMessageProps) {
  return (
    <section className={styles.wrapper} role="alert">
      <div className={styles.content}>
        <div className={styles.icon} aria-hidden="true">
          !
        </div>
        {error.code ? <p className={styles.codeError}>{error.code}</p> : null}
        <h2 className={styles.title}>{error.title}</h2>
        {error.message ? (
          <p className={styles.messageError}>{error.message}</p>
        ) : null}
        {onRetry || action ? (
          <div className={styles.actions}>
            {onRetry ? (
              <button
                type="button"
                className={styles.onRetryButton}
                onClick={onRetry}
              >
                Try Again
              </button>
            ) : null}

            {action ? (
              <button
                type="button"
                className={styles.actionButton}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
