import { Clapperboard, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";

import type { AppError } from "../../types/errors";
import styles from "./PageShell.module.css";

export interface PageShellProps {
  children: ReactNode;
  storageWarning?: AppError | null;
}

export function PageShell({ children, storageWarning = null }: PageShellProps) {
  return (
    <div className={styles.app}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link className={styles.brand} to="/" aria-label="CineList home">
            <Clapperboard aria-hidden="true" />
            <span>CineList</span>
          </Link>
          <nav aria-label="Primary navigation">
            <ul className={styles.navigation}>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.activeNavLink : ""}`
                  }
                  to="/"
                  end
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.activeNavLink : ""}`
                  }
                  to="/favorites"
                >
                  Favorites
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className={styles.main} id="main-content" tabIndex={-1}>
        {storageWarning && (
          <div className={styles.syncWarning} role="alert">
            <TriangleAlert size={22} aria-hidden="true" />
            <div>
              <strong>Favorites sync warning</strong>
              <p>{storageWarning.message}</p>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
