import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import {
  Button,
  SelectList,
  TextInput,
  type SelectOption,
} from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import type { Store } from "../../types/Store";
import type { ZoneDetails } from "../../types/Zone";

const Zone = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [collections, setCollections] = useState<ZoneDetails["collections"]>(
    [],
  );
  const [selectedStoreValue, setSelectedStoreValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const storeOptions = useMemo<SelectOption[]>(
    () => [
      { label: "Selectionner un magasin", value: "" },
      ...stores.map((store) => ({
        label: store.title,
        value: store.id.toString(),
      })),
    ],
    [stores],
  );

  const selectedStores = useMemo(
    () => stores.filter((store) => selectedStoreIds.includes(store.id)),
    [stores, selectedStoreIds],
  );

  const loadZoneData = useCallback(async () => {
    if (!token || !id) {
      setErrorMessage("Impossible de charger la zone.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const [zoneResponse, storesResponse] = await Promise.all([
        api.get<ZoneDetails>(`/zones/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        api.get<Store[]>("/stores", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const details = zoneResponse.data;

      setTitle(details.title);
      setSelectedStoreIds(details.stores.map((store) => store.id));
      setCollections(details.collections);
      setStores(storesResponse.data);
    } catch {
      setErrorMessage("Erreur lors du chargement de la zone.");
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void loadZoneData();
  }, [loadZoneData]);

  const addStore = () => {
    const storeId = Number(selectedStoreValue);
    if (!storeId || selectedStoreIds.includes(storeId)) {
      return;
    }

    setSelectedStoreIds((prev) => [...prev, storeId]);
    setSelectedStoreValue("");
  };

  const removeStore = (storeId: number) => {
    setSelectedStoreIds((prev) =>
      prev.filter((idValue) => idValue !== storeId),
    );
  };

  const handleEdit = async () => {
    if (!token || !id) {
      setErrorMessage("Impossible de modifier la zone.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Le titre de la zone est requis.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.put(
        `/zones/${id}`,
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
      setErrorMessage("Erreur lors de la mise a jour de la zone.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-5xl rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-6">
        <p className="m-0 text-sm text-[var(--color-text)]">
          Chargement de la zone...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
      <header className="relative flex items-center justify-center">
        <h1 className="m-0 text-center text-xl font-semibold italic text-[var(--color-primary)] sm:text-2xl">
          Editer une zone
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
          Magasins associes
        </h2>

        {selectedStores.length > 0 ? (
          <div className="grid gap-2">
            {selectedStores.map((store) => (
              <div
                key={store.id}
                className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border border-[var(--color-primary)]/30 bg-white px-3 py-2"
              >
                <p className="m-0 text-sm font-medium text-[var(--color-text)]">
                  {store.title}
                </p>
                <Button
                  type="button"
                  onClick={() => removeStore(store.id)}
                  className="border border-[var(--color-primary)] bg-white px-3 py-1 text-sm text-[var(--color-primary)]"
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 text-sm text-[var(--color-text)]">
            Aucun magasin associe.
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <SelectList
            label="Associer un magasin"
            options={storeOptions}
            value={selectedStoreValue}
            onChange={(event) => setSelectedStoreValue(event.target.value)}
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

      {collections.length > 0 ? (
        <div className="grid gap-2">
          <h2 className="m-0 text-lg font-semibold text-[var(--color-primary)]">
            Collectes associees
          </h2>
          <div className="flex flex-wrap gap-2">
            {collections.map((relation) => (
              <p
                key={relation.collectionId}
                className="m-0 rounded-lg border-2 border-[var(--color-primary)] bg-white px-3 py-1 text-sm text-[var(--color-primary)]"
              >
                {relation.collection.title}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="m-0 rounded-lg border border-[var(--color-error)]/50 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex justify-center gap-3">
        <Button
          type="button"
          className="border border-[var(--color-primary)] bg-white px-8 py-2 text-[var(--color-primary)]"
          onClick={() => navigate("/zones")}
        >
          Retour
        </Button>
        <Button
          type="button"
          onClick={() => void handleEdit()}
          disabled={isSubmitting || !title.trim() || stores.length === 0}
          className="border border-[var(--color-primary)] bg-white px-8 py-2 text-[var(--color-primary)]"
        >
          {isSubmitting ? "Edition..." : "Editer"}
        </Button>
      </div>
    </section>
  );
};

export default Zone;
