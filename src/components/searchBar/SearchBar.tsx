import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button, TextInput } from "../generic";

type SearchBarProps = {
  title: string;
  search: (query?: string) => void;
};

function SearchBar({ title, search }: Readonly<SearchBarProps>) {
  const [query, setQuery] = useState("");

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const timeout = globalThis.setTimeout(() => {
      search(normalizedQuery);
    }, 300);

    return () => {
      globalThis.clearTimeout(timeout);
    };
  }, [normalizedQuery, search]);

  const handleSubmit = (
    event: Parameters<NonNullable<ComponentProps<"form">["onSubmit"]>>[0],
  ) => {
    event.preventDefault();
    search(normalizedQuery);
  };

  return (
    <section className="w-full rounded-2xl bg-[var(--color-secondary)]/15 p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-[var(--color-primary)] sm:text-lg">
        {title}
      </h2>

      <form
        className="flex w-full flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={handleSubmit}
      >
        <div className="w-full sm:flex-1">
          <TextInput
            label="Rechercher"
            placeholder="Nom, id, information..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full border-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-[var(--color-primary)] text-white sm:w-auto"
        >
          Rechercher
        </Button>
      </form>
    </section>
  );
}

export default SearchBar;
