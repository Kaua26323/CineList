import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import styles from "./NotFound.module.css";

export function NotFound() {
  return (
    <section className={styles.container} aria-labelledby="not-found-title">
      <p className={styles.eyebrow}>404</p>
      <h1 className={styles.title} id="not-found-title">
        Page not found
      </h1>
      <p className={styles.message}>
        The page you requested doesn&apos;t exist or may have moved.
      </p>
      <Link className={styles.link} to="/">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Home
      </Link>
    </section>
  );
}
