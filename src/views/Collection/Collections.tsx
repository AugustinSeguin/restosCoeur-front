import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Button, TextInput } from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import type { Collection } from "../../types/Collection";

const Collections = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const loadCollections = useCallback(async () => {
    if (!token) {
      setCollections([]);
      setErrorMessage("Authentification requise pour afficher les collectes.");
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
      setErrorMessage("Impossible de charger les collectes pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    if (copiedId === null) {
      return;
    }

    const timeout = globalThis.setTimeout(() => {
      setCopiedId(null);
    }, 1500);

    return () => {
      globalThis.clearTimeout(timeout);
    };
  }, [copiedId]);

  const filteredCollections = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return collections;
    }

    return collections.filter((collection) =>
      collection.title.toLowerCase().includes(normalized),
    );
  }, [collections, searchQuery]);

  const copyFormUrl = async (formUrl: string, id: number) => {
    try {
      await globalThis.navigator.clipboard.writeText(formUrl);
      setCopiedId(id);
    } catch {
      setErrorMessage("Impossible de copier le lien.");
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
      <header className="relative flex items-center justify-center">
        <h1 className="m-0 text-center text-xl font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)] sm:text-2xl">
          Collecte
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <TextInput
          label="Rechercher une collecte"
          placeholder="Rechercher une collecte"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <Button
          type="button"
          onClick={() => navigate("/collections/create")}
          className="h-11 border border-[var(--color-primary)] bg-white px-6 text-[var(--color-primary)]"
        >
          Créer
        </Button>
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
                to={`/collections/${collection.id}`}
                className="w-fit text-left no-underline"
              >
                <h2 className="m-0 text-lg font-semibold text-[var(--color-text)] sm:text-2xl">
                  {collection.title}
                </h2>
              </Link>

              <Button
                type="button"
                className="w-full min-w-28 border border-[var(--color-primary)] bg-white text-[var(--color-primary)] sm:w-auto"
                onClick={() =>
                  void copyFormUrl(collection.formUrl, collection.id)
                }
              >
                {copiedId === collection.id ? "Lien copie" : "Copier lien"}
              </Button>
            </article>
          ))}
        </div>
      )}

      {!isLoading && filteredCollections.length === 0 ? (
        <p className="m-0 text-sm text-[var(--color-text)]">
          Aucune collecte ne correspond aux filtres actuels.
        </p>
      ) : null}
    </section>
  );
};

export default Collections;
