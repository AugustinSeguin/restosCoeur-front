import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import {
  Button,
  SelectList,
  TextInput,
  type SelectOption,
} from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import type { Store } from "../../types/Store";
import type { Zone } from "../../types/Zone";

const CreateZone = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [selectedStoreValue, setSelectedStoreValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const storeOptions = useMemo<SelectOption[]>(
    () =>
      stores.map((store) => ({
        label: store.title,
        value: store.id.toString(),
      })),
    [stores],
  );

  const selectedStores = useMemo(
    () => stores.filter((store) => selectedStoreIds.includes(store.id)),
    [stores, selectedStoreIds],
  );

  useEffect(() => {
    if (selectedStoreValue || storeOptions.length === 0) {
      return;
    }

    setSelectedStoreValue(storeOptions[0].value);
  }, [selectedStoreValue, storeOptions]);

  const loadStores = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoadingStores(true);

    try {
      const response = await api.get<Store[]>("/stores", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStores(response.data);
    } catch {
      setErrorMessage("Impossible de charger les magasins.");
    } finally {
      setIsLoadingStores(false);
    }
  }, [token]);

  useEffect(() => {
    void loadStores();
  }, [loadStores]);

  const addStore = () => {
    const storeId = Number(selectedStoreValue);
    if (storeId && !selectedStoreIds.includes(storeId)) {
      setSelectedStoreIds([...selectedStoreIds, storeId]);
      setSelectedStoreValue("");
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setErrorMessage("Le titre de la zone est requis.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.post<Zone>(
        "/zones",
        {
          title: title.trim(),
          storeIds: selectedStoreIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate("/zones", { replace: true });
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
          Créer une zone
        </h1>
      </header>

      <div>
        <TextInput
          label="Titre"
          placeholder="Titre de la zone"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="grid gap-3">
        <h2 className="m-0 text-lg font-semibold text-[var(--color-primary)]">
          Magasins
        </h2>

        {selectedStores.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedStores.map((store) => (
              <p
                key={store.id}
                className="m-0 rounded-lg border-2 border-[var(--color-primary)] bg-white px-3 py-1 text-sm text-[var(--color-primary)]"
              >
                {store.title}
              </p>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <SelectList
            label="Associer un magasin"
            options={storeOptions}
            value={selectedStoreValue}
            onChange={(event) => setSelectedStoreValue(event.target.value)}
            disabled={isLoadingStores}
          />

          <div className="flex items-end justify-start sm:justify-end">
            <Button
              type="button"
              onClick={addStore}
              disabled={!selectedStoreValue}
              className="h-11 w-full border border-[var(--color-primary)] bg-white text-[var(--color-primary)] sm:w-auto"
            >
              Ajouter
            </Button>
          </div>
        </div>
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
          onClick={() => navigate("/zones")}
          className="rounded-lg border border-[var(--color-primary)] bg-white px-6 py-2 font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Annuler
        </Button>
      </div>
    </section>
  );
};

export default CreateZone;
