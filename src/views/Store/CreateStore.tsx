import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Button, Checkbox, TextInput } from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import type { Store } from "../../types/Store";

const CreateStore = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("19:00");
  const [isOpenSunday, setIsOpenSunday] = useState(false);
  const [minVolunteers, setMinVolunteers] = useState(2);
  const [idealVolunteers, setIdealVolunteers] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      setErrorMessage("Le titre du magasin est requisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.post<Store>(
        "/stores",
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
      setErrorMessage("Erreur lors de la création. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
      <header className="relative flex items-center justify-center">
        <h1 className="m-0 text-center text-xl font-semibold italic text-[var(--color-primary)] sm:text-2xl">
          Créer un magasin
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

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          type="button"
          onClick={handleCreate}
          disabled={isSubmitting}
          className="rounded-lg bg-[var(--color-primary)] px-6 py-2 font-medium text-white transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
        >
          {isSubmitting ? "Création en cours..." : "Créer"}
        </Button>

        <Button
          type="button"
          onClick={() => navigate("/stores")}
          className="rounded-lg border border-[var(--color-primary)] bg-white px-6 py-2 font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Annuler
        </Button>
      </div>
    </section>
  );
};

export default CreateStore;
