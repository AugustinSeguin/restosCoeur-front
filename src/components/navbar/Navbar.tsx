import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../generic";

type NavbarProps = {
  onLogout: () => void;
};

const navItems = [
  { to: "/board", label: "Tableau de bord" },
  { to: "/collections", label: "Collectes" },
  { to: "/zones", label: "Zones" },
  { to: "/stores", label: "Magasins" },
  { to: "/users", label: "Utilisateurs" },
];

function Navbar({ onLogout }: Readonly<NavbarProps>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--color-primary)] bg-[var(--bg-color)]">
      <div className="mx-auto flex w-full items-center justify-between px-5 py-3">
        <span className="text-base font-bold text-[var(--color-primary)]">
          Restos du Coeur
        </span>

        <button
          type="button"
          className="rounded-md border border-[var(--color-primary)] px-3 py-2 text-sm text-white lg:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Ouvrir le menu"
          aria-expanded={isOpen}
        >
          Menu
        </button>

        <nav className="hidden items-center gap-3 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "!bg-[var(--color-primary)] !text-white hover:!text-white"
                    : "text-[var(--color-primary)] hover:bg-[var(--color-secondary)]/20"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Button type="button" variant="secondary" onClick={onLogout}>
            Logout
          </Button>
        </nav>
      </div>

      {isOpen ? (
        <nav className="grid gap-2 border-t border-[var(--color-primary)] px-5 py-3 lg:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "!bg-[var(--color-primary)] !text-white hover:!text-white"
                    : "text-[var(--color-primary)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
          >
            Logout
          </Button>
        </nav>
      ) : null}
    </header>
  );
}

export default Navbar;
