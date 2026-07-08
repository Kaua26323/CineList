import style from "./appLayout.module.css";
import { Outlet, NavLink } from "react-router";

export function AppLayout() {
  return (
    <>
      <header className={style.headerBox}>
        <div className={style.headerContent}>
          <h1 className={style.logo}>CineList</h1>
          <nav className={style.navLinks}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? style.active : undefined
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive ? style.active : undefined
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
