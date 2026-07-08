import { Button } from "@/components/Button";
import styles from "./notFound.module.css";
import { useNavigate } from "react-router";

interface NotFoundProps {
  reason?: string;
}

export function NotFound({ reason = "Page not found" }: NotFoundProps) {
  const navigate = useNavigate();

  const handleBackHome = (): void => {
    navigate("/");
  };

  return (
    <section className={styles.notFoundContainer}>
      <div className={styles.notFoundContent}>
        <p className={styles.codeError}>404</p>
        <h1 className={styles.errorTitle}>{reason}</h1>
        <p className={styles.errorMessage}>
          The page you are looking for does not exist or is no longer available.
        </p>
        <Button size="180px" variant="secondary" onClick={handleBackHome}>
          Back to home
        </Button>
      </div>
    </section>
  );
}
