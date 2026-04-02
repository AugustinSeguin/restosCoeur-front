import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Button, TextInput } from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import type { Zone } from "../../types/Zone";

const Zones = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [zones, setZones] = useState<Zone[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadZones = useCallback(async () => {
    if (!token) {
      setZones([]);
      setErrorMessage("Authentification requise pour afficher les zones.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<Zone[]>("/zones", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setZones(response.data);
    } catch {
      setErrorMessage("Impossible de charger les zones pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadZones();
  }, [loadZones]);

  const filteredZones = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return zones;
    }

    return zones.filter((zone) =>
      zone.title.toLowerCase().includes(normalized),
    );
  }, [zones, searchQuery]);

  const handleDeleteZone = async (zoneId: number) => {
    if (!token) {
      setErrorMessage("Authentification requise pour supprimer une zone.");
      return;
    }

    try {
      await api.delete(`/zones/${zoneId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setZones((prev) => prev.filter((zone) => zone.id !== zoneId));
    } catch {
      setErrorMessage("Erreur lors de la suppression de la zone.");
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
      <header className="relative flex items-center justify-center">
        <h1 className="m-0 text-center text-xl font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)] sm:text-2xl">
          Zones
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <TextInput
          label="Rechercher une zone"
          placeholder="Rechercher une zone"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <Button
          onClick={() => navigate("/zones/create")}
          type="button"
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
          Chargement des zones...
        </p>
      ) : (
        <div className="grid gap-4 pt-2">
          {filteredZones.map((zone) => (
            <article
              key={zone.id}
              className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-1 py-1"
            >
              <Link to={`/zones/${zone.id}`} className="no-underline">
                <h2 className="m-0 text-lg font-semibold text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)] sm:text-2xl">
                  {zone.title}
                </h2>
              </Link>

              <Button
                type="button"
                className="w-full min-w-28 border border-[var(--color-primary)] bg-white text-[var(--color-primary)] sm:w-auto"
                onClick={() => void handleDeleteZone(zone.id)}
              >
                Supprimer
              </Button>
            </article>
          ))}
        </div>
      )}

      {!isLoading && filteredZones.length === 0 ? (
        <p className="m-0 text-sm text-[var(--color-text)]">
          Aucune zone ne correspond aux filtres actuels.
        </p>
      ) : null}
    </section>
  );
};

export default Zones;
