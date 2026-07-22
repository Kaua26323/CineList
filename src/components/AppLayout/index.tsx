import { Clapperboard } from "lucide-react";
import style from "./appLayout.module.css";
import { Outlet, NavLink, Link } from "react-router";

export function AppLayout() {
  return (
    <>
      <header className={style.headerBox}>
        <div className={style.headerContent}>
          <Link to="/" className={style.logo}>
            <Clapperboard aria-hidden="true" size={29} />
            <span>CineList</span>
          </Link>
          <nav className={style.navLinks}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${style.navLink} ${isActive ? style.active : undefined}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `${style.navLink} ${isActive ? style.active : undefined}`
              }
            >
              Favorites
            </NavLink>
          </nav>
        </div>
      </header>

      <Outlet />
    </>
  );
}
