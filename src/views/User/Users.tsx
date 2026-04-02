import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Button, TextInput } from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import type { User } from "../../types/User";

const Users = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [admins, setAdmins] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAdmins = useCallback(async () => {
    if (!token) {
      setAdmins([]);
      setErrorMessage("Authentification requise pour afficher les admins.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<User[]>("/users/admins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAdmins(response.data);
    } catch {
      setErrorMessage("Impossible de charger les admins pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const filteredAdmins = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return admins;
    }

    return admins.filter((admin) => {
      const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
      return (
        fullName.includes(normalized) ||
        admin.username.toLowerCase().includes(normalized) ||
        (admin.email?.toLowerCase().includes(normalized) ?? false)
      );
    });
  }, [admins, searchQuery]);

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
      <header className="relative flex items-center justify-center">
        <h1 className="m-0 text-center text-xl font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)] sm:text-2xl">
          Admins
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <TextInput
          label="Rechercher un admin"
          placeholder="Rechercher un admin"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <Button
          onClick={() => navigate("/users/create")}
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
          Chargement des admins...
        </p>
      ) : (
        <div className="grid gap-4 pt-2">
          {filteredAdmins.map((admin) => (
            <article key={admin.id} className="rounded-xl px-1 py-1">
              <h2 className="m-0 text-lg font-semibold text-[var(--color-text)] sm:text-2xl">
                {admin.firstName} {admin.lastName}
              </h2>
            </article>
          ))}
        </div>
      )}

      {!isLoading && filteredAdmins.length === 0 ? (
        <p className="m-0 text-sm text-[var(--color-text)]">
          Aucun admin ne correspond aux filtres actuels.
        </p>
      ) : null}
    </section>
  );
};

export default Users;
