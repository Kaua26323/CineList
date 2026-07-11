import { Clapperboard } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";

import styles from "./PageShell.module.css";

export interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
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
        {children}
      </main>
    </div>
  );
}
