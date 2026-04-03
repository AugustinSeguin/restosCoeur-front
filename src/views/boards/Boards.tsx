import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useAuth } from "../../contexts/AuthContext";
import type { Collection } from "../../types/Collection";
import { TextInput } from "../../components/generic";

const Boards = () => {
  const { token } = useAuth();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCollections = useCallback(async () => {
    if (!token) {
      setCollections([]);
      setErrorMessage("Authentification requise pour afficher les boards.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<Collection[]>("/collections", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCollections(response.data);
    } catch {
      setErrorMessage("Impossible de charger les collectes pour le board.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const filteredCollections = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return collections;
    }

    return collections.filter((collection) =>
      collection.title.toLowerCase().includes(normalized),
    );
  }, [collections, searchQuery]);

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-5 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
      <header className="flex items-center justify-center">
        <h1 className="m-0 text-center text-xl font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)] sm:text-2xl">
          Tableau de bord
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <TextInput
          label="Rechercher une collecte"
          placeholder="Rechercher une collecte"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>
      {errorMessage ? (
        <p className="m-0 rounded-lg border border-[var(--color-error)]/50 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <p className="m-0 text-sm text-[var(--color-text)]">
          Chargement des collectes...
        </p>
      ) : (
        <div className="grid gap-4 pt-2">
          {filteredCollections.map((collection) => (
            <article
              key={collection.id}
              className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-1 py-1"
            >
              <Link
                to={`/board/${collection.id}`}
                className="w-fit text-left no-underline"
              >
                <h2 className="m-0 text-lg font-semibold text-[var(--color-text)] sm:text-2xl">
                  {collection.title}
                </h2>
              </Link>
            </article>
          ))}
        </div>
      )}

      {!isLoading && filteredCollections.length === 0 ? (
        <p className="m-0 text-sm text-[var(--color-text)]">
          Aucune collecte ne correspond a votre recherche.
        </p>
      ) : null}
    </section>
  );
};

export default Boards;
