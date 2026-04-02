import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Button, Checkbox, TextInput } from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import type { Store } from "../../types/Store";

const StoreEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("19:00");
  const [isOpenSunday, setIsOpenSunday] = useState(false);
  const [minVolunteers, setMinVolunteers] = useState(2);
  const [idealVolunteers, setIdealVolunteers] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStoreData = useCallback(async () => {
    if (!token || !id) {
      setErrorMessage("Impossible de charger le magasin.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<Store>(`/stores/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const store = response.data;

      setTitle(store.title);
      setOpeningTime(store.openingTime);
      setClosingTime(store.closingTime);
      setIsOpenSunday(store.isOpenSunday);
      setMinVolunteers(store.minVolunteers);
      setIdealVolunteers(store.idealVolunteers);
    } catch {
      setErrorMessage("Erreur lors du chargement du magasin.");
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void loadStoreData();
  }, [loadStoreData]);

  const handleEdit = async () => {
    if (!token || !id) {
      setErrorMessage("Impossible de modifier le magasin.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Le titre du magasin est requis.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.put(
        `/stores/${id}`,
        {
          title: title.trim(),
          openingTime,
          closingTime,
          isOpenSunday,
          minVolunteers: Number(minVolunteers),
          idealVolunteers: Number(idealVolunteers),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate("/stores", { replace: true });
    } catch {
      setErrorMessage("Erreur lors de la mise a jour du magasin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-5xl rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-6">
        <p className="m-0 text-sm text-[var(--color-text)]">
          Chargement du magasin...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
      <header className="relative flex items-center justify-center">
        <h1 className="m-0 text-center text-xl font-semibold italic text-[var(--color-primary)] sm:text-2xl">
          Editer un magasin
        </h1>
      </header>

      <div>
        <TextInput
          label="Titre"
          placeholder="Titre du magasin"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr]">
        <TextInput
          label="Heure d'ouverture"
          type="time"
          value={openingTime}
          onChange={(event) => setOpeningTime(event.target.value)}
        />

        <TextInput
          label="Heure de fermeture"
          type="time"
          value={closingTime}
          onChange={(event) => setClosingTime(event.target.value)}
        />
      </div>

      <div>
        <Checkbox
          label="Ouvert le dimanche"
          checked={isOpenSunday}
          onChange={(event) => setIsOpenSunday(event.target.checked)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr]">
        <TextInput
          label="Minimum de bénévoles"
          type="number"
          value={minVolunteers}
          onChange={(event) => setMinVolunteers(Number(event.target.value))}
        />

        <TextInput
          label="Nombre idéal de bénévoles"
          type="number"
          value={idealVolunteers}
          onChange={(event) => setIdealVolunteers(Number(event.target.value))}
        />
      </div>

      {errorMessage ? (
        <p className="m-0 rounded-lg border border-[var(--color-error)]/50 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex justify-center gap-3">
        <Button
          type="button"
          onClick={() => navigate("/stores")}
          className="rounded-lg border border-[var(--color-primary)] bg-white px-6 py-2 font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Retour
        </Button>
        <Button
          type="button"
          onClick={handleEdit}
          disabled={isSubmitting}
          className="rounded-lg bg-[var(--color-primary)] px-6 py-2 font-medium text-white transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
        >
          {isSubmitting ? "Edition en cours..." : "Editer"}
        </Button>
      </div>
    </section>
  );
};

export default StoreEdit;
