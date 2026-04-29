import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import {
  Button,
  Checkbox,
  SelectList,
  TextInput,
  type SelectOption,
} from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import type { Collection } from "../../types/Collection";
import type { Slot } from "../../types/Slot";
import type { Zone } from "../../types/Zone";

type SlotFormData = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

const CreateCollection = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [slots, setSlots] = useState<SlotFormData[]>([]);
  const [currentSlot, setCurrentSlot] = useState<SlotFormData>({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [selectedZoneValue, setSelectedZoneValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const zoneOptions = useMemo<SelectOption[]>(
    () =>
      zones.map((zone) => ({
        label: zone.title,
        value: zone.id.toString(),
      })),
    [zones],
  );

  const selectedZones = useMemo(
    () => zones.filter((zone) => selectedZoneIds.includes(zone.id)),
    [zones, selectedZoneIds],
  );

  useEffect(() => {
    if (selectedZoneValue || zoneOptions.length !== 1) {
      return;
    }

    setSelectedZoneValue(zoneOptions[0].value);
  }, [selectedZoneValue, zoneOptions]);

  const loadZones = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoadingZones(true);

    try {
      const response = await api.get<Zone[]>("/zones", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setZones(response.data);
    } catch {
      setErrorMessage("Impossible de charger les zones.");
    } finally {
      setIsLoadingZones(false);
    }
  }, [token]);

  useEffect(() => {
    void loadZones();
  }, [loadZones]);

  const addZone = () => {
    const zoneId = Number(selectedZoneValue);
    if (zoneId && !selectedZoneIds.includes(zoneId)) {
      setSelectedZoneIds([...selectedZoneIds, zoneId]);
      setSelectedZoneValue("");
    }
  };

  const addSlot = () => {
    if (
      currentSlot.startDate &&
      currentSlot.startTime &&
      currentSlot.endDate &&
      currentSlot.endTime
    ) {
      setSlots([...slots, currentSlot]);
      setCurrentSlot({
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
    }
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const formatSlotDisplay = (slot: SlotFormData) => {
    return `${slot.startDate} ${slot.startTime}-${slot.endTime}`;
  };

  const handleImportVolunteers = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Note: We need a collection ID, so this will only work after creation
    // For CreateCollection, we'll show a message
    setErrorMessage(
      "Vous devez d'abord créer la collecte avant d'importer les bénévoles.",
    );

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setErrorMessage("Le titre de la collecte est requis.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Create collection
      const collectionResponse = await api.post<Collection>(
        "/collections",
        {
          title: title.trim(),
          isActive,
          formUrl: `https://forms.example.com/${title.toLowerCase().replaceAll(/\s+/g, "-")}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const collectionId = collectionResponse.data.id;

      // 2. Create slots only when at least one slot exists
      if (slots.length > 0) {
        const slotPromises = slots.map((slot) => {
          const startAt = new Date(
            `${slot.startDate}T${slot.startTime}:00Z`,
          ).toISOString();
          const endAt = new Date(
            `${slot.endDate}T${slot.endTime}:00Z`,
          ).toISOString();

          return api.post<Slot>(
            "/slots",
            {
              startAt,
              endAt,
              collectionId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        });

        await Promise.all(slotPromises);
      }

      // 3. Navigate back to collections
      navigate("/collections", { replace: true });
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
          Créer une collecte
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <TextInput
          label="Titre"
          placeholder="Titre de la collecte"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className="flex items-end">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-full border border-[var(--color-primary)] bg-white px-4 text-sm text-[var(--color-primary)] sm:w-auto"
          >
            Importer les bénévoles réguliers
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportVolunteers}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <Checkbox
          label="Active"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
      </div>

      <div className="grid gap-3">
        <h2 className="m-0 text-lg font-semibold text-[var(--color-primary)]">
          Zones
        </h2>

        {selectedZones.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedZones.map((zone) => (
              <p
                key={zone.id}
                className="m-0 rounded-lg border-2 border-[var(--color-primary)] bg-white px-3 py-1 text-sm text-[var(--color-primary)]"
              >
                {zone.title}
              </p>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <SelectList
            label="Associer une zone"
            options={zoneOptions}
            value={selectedZoneValue}
            onChange={(event) => setSelectedZoneValue(event.target.value)}
            disabled={isLoadingZones}
          />

          <div className="flex items-end justify-start sm:justify-end">
            <Button
              type="button"
              onClick={addZone}
              disabled={!selectedZoneValue}
              className="h-11 w-full border border-[var(--color-primary)] bg-white text-[var(--color-primary)] sm:w-auto"
            >
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <h2 className="m-0 text-lg font-semibold text-[var(--color-primary)]">
          Créneaux
        </h2>

        {slots.length > 0 ? (
          <div className="grid gap-2">
            {slots.map((slot, index) => (
              <div
                key={`${slot.startDate}-${slot.startTime}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-primary)]/30 bg-white px-3 py-2"
              >
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {formatSlotDisplay(slot)}
                </span>
                <Button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="border border-[var(--color-error)] bg-white px-2 py-1 text-sm text-[var(--color-error)]"
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-3 rounded-lg border border-[var(--color-primary)]/25 bg-white/50 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TextInput
              label="Date de début"
              type="date"
              value={currentSlot.startDate}
              onChange={(event) =>
                setCurrentSlot({
                  ...currentSlot,
                  startDate: event.target.value,
                })
              }
            />
            <TextInput
              label="Heure de début"
              type="time"
              value={currentSlot.startTime}
              onChange={(event) =>
                setCurrentSlot({
                  ...currentSlot,
                  startTime: event.target.value,
                })
              }
            />
            <TextInput
              label="Date de fin"
              type="date"
              value={currentSlot.endDate}
              onChange={(event) =>
                setCurrentSlot({ ...currentSlot, endDate: event.target.value })
              }
            />
            <TextInput
              label="Heure de fin"
              type="time"
              value={currentSlot.endTime}
              onChange={(event) =>
                setCurrentSlot({ ...currentSlot, endTime: event.target.value })
              }
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              onClick={addSlot}
              disabled={
                !currentSlot.startDate ||
                !currentSlot.startTime ||
                !currentSlot.endDate ||
                !currentSlot.endTime
              }
              className="border border-[var(--color-primary)] bg-white px-6 text-[var(--color-primary)]"
            >
              Créer un créneau
            </Button>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <p className="m-0 rounded-lg border border-[var(--color-error)]/50 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex justify-center gap-3">
        <Button
          type="button"
          className="border border-[var(--color-primary)] bg-white px-8 py-2 text-[var(--color-primary)]"
          onClick={() => navigate("/collections")}
        >
          Retour
        </Button>
        <Button
          type="button"
          onClick={() => void handleCreate()}
          disabled={isSubmitting || !title.trim()}
          className="border border-[var(--color-primary)] bg-white px-8 py-2 text-[var(--color-primary)]"
        >
          {isSubmitting ? "Création..." : "Créer"}
        </Button>
      </div>
    </section>
  );
};

export default CreateCollection;
