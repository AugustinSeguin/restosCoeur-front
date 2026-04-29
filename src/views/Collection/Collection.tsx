import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import {
  Button,
  Checkbox,
  SelectList,
  TextInput,
  type SelectOption,
} from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import { importVolunteersFromExcel } from "../../helpers/FileHelper";
import type { CollectionDetails } from "../../types/Collection";
import type { SlotFormData } from "../../types/Slot";
import type { Zone } from "../../types/Zone";

const toInputDateTime = (isoDate: string) => {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  };
};

const Collection = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formUrl, setFormUrl] = useState("");
  const [userIds, setUserIds] = useState<number[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [slots, setSlots] = useState<SlotFormData[]>([]);
  const [currentSlot, setCurrentSlot] = useState<SlotFormData>({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneValue, setSelectedZoneValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const loadCollectionData = useCallback(async () => {
    if (!token || !id) {
      setErrorMessage("Impossible de charger la collecte.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const [collectionResponse, zonesResponse] = await Promise.all([
        api.get<CollectionDetails>(`/collections/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        api.get<Zone[]>("/zones", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const details = collectionResponse.data;

      setTitle(details.title);
      setIsActive(details.isActive);
      setFormUrl(details.formUrl);
      setUserIds(details.users?.map((user) => user.id) ?? []);
      setSelectedZoneIds(details.zones.map((item) => item.zoneId));
      setZones(zonesResponse.data);
      setSlots(
        details.slots.map((slot) => {
          const start = toInputDateTime(slot.startAt);
          const end = toInputDateTime(slot.endAt);

          return {
            id: slot.id,
            startDate: start.date,
            startTime: start.time,
            endDate: end.date,
            endTime: end.time,
          };
        }),
      );
    } catch {
      setErrorMessage("Erreur lors du chargement de la collecte.");
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void loadCollectionData();
  }, [loadCollectionData]);

  const addZone = () => {
    const zoneId = Number(selectedZoneValue);
    if (!zoneId || selectedZoneIds.includes(zoneId)) {
      return;
    }

    setSelectedZoneIds((prev) => [...prev, zoneId]);
    setSelectedZoneValue("");
  };

  const addSlot = () => {
    if (
      !currentSlot.startDate ||
      !currentSlot.startTime ||
      !currentSlot.endDate ||
      !currentSlot.endTime
    ) {
      return;
    }

    setSlots((prev) => [...prev, currentSlot]);
    setCurrentSlot({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, slotIndex) => slotIndex !== index));
  };

  const handleDeleteSlot = async (index: number, slotId?: number) => {
    if (!slotId) {
      removeSlot(index);
      return;
    }

    if (!token) {
      setErrorMessage("Authentification requise pour supprimer un creneau.");
      return;
    }

    try {
      await api.delete(`/slots/${slotId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      removeSlot(index);
    } catch {
      setErrorMessage("Erreur lors de la suppression du creneau.");
    }
  };

  const formatSlotDisplay = (slot: SlotFormData) => {
    return `${slot.startDate} ${slot.startTime}-${slot.endTime}`;
  };

  const handleDownloadVolunteers = async () => {
    if (!token || !id) {
      setErrorMessage("Impossible de télécharger les bénévoles.");
      return;
    }

    setErrorMessage("");

    try {
      const response = await api.get(`/collections/${id}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const contentTypeHeader = response.headers["content-type"];
      const contentType =
        typeof contentTypeHeader === "string"
          ? contentTypeHeader
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([response.data], {
        type: contentType,
      });

      const downloadUrl = globalThis.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const contentDispositionHeader = response.headers["content-disposition"];
      const contentDisposition =
        typeof contentDispositionHeader === "string"
          ? contentDispositionHeader
          : "";
      const filenameMatch = /filename=\"?([^\"]+)\"?/i.exec(contentDisposition);
      const filename = filenameMatch?.[1] || `collection_${id}_users.xlsx`;

      link.href = downloadUrl;
      link.download = filename;
      link.click();
      globalThis.URL.revokeObjectURL(downloadUrl);
    } catch {
      setErrorMessage("Erreur lors du téléchargement des bénévoles.");
    }
  };

  const handleImportVolunteers = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file || !token || !id) {
      return;
    }

    const collectionId = Number(id);

    const result = await importVolunteersFromExcel(file, collectionId, token);

    if (result.success) {
      setErrorMessage("");
      // Reload the collection data to see the newly imported volunteers
      await loadCollectionData();
    } else {
      setErrorMessage(result.message);
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = async () => {
    if (!token || !id) {
      setErrorMessage("Impossible de modifier la collecte.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Le titre de la collecte est requis.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.put(
        `/collections/${id}`,
        {
          title: title.trim(),
          isActive,
          formUrl:
            formUrl ||
            `https://forms.example.com/${title.toLowerCase().replaceAll(/\s+/g, "-")}`,
          userIds,
          zoneIds: selectedZoneIds,
          slots: slots.map((slot) => {
            const startAt = new Date(
              `${slot.startDate}T${slot.startTime}:00Z`,
            ).toISOString();
            const endAt = new Date(
              `${slot.endDate}T${slot.endTime}:00Z`,
            ).toISOString();

            if (slot.id) {
              return {
                id: slot.id,
                startAt,
                endAt,
              };
            }

            return {
              startAt,
              endAt,
            };
          }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate("/collections", { replace: true });
    } catch {
      setErrorMessage("Erreur lors de la mise a jour de la collecte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-5xl rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-6">
        <p className="m-0 text-sm text-[var(--color-text)]">
          Chargement de la collecte...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
      <header className="relative flex items-center justify-center">
        <h1 className="m-0 text-center text-xl font-semibold italic text-[var(--color-primary)] sm:text-2xl">
          Editer une collecte
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
          Creneaux
        </h2>

        {slots.length > 0 ? (
          <div className="grid gap-2">
            {slots.map((slot, index) => (
              <div
                key={`${slot.startDate}-${slot.startTime}-${index}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-primary)]/30 bg-white px-3 py-2"
              >
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {formatSlotDisplay(slot)}
                </span>
                <Button
                  type="button"
                  onClick={() => void handleDeleteSlot(index, slot.id)}
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
              label="Date de debut"
              type="date"
              value={currentSlot.startDate}
              onChange={(event) =>
                setCurrentSlot((prev) => ({
                  ...prev,
                  startDate: event.target.value,
                }))
              }
            />
            <TextInput
              label="Heure de debut"
              type="time"
              value={currentSlot.startTime}
              onChange={(event) =>
                setCurrentSlot((prev) => ({
                  ...prev,
                  startTime: event.target.value,
                }))
              }
            />
            <TextInput
              label="Date de fin"
              type="date"
              value={currentSlot.endDate}
              onChange={(event) =>
                setCurrentSlot((prev) => ({
                  ...prev,
                  endDate: event.target.value,
                }))
              }
            />
            <TextInput
              label="Heure de fin"
              type="time"
              value={currentSlot.endTime}
              onChange={(event) =>
                setCurrentSlot((prev) => ({
                  ...prev,
                  endTime: event.target.value,
                }))
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
              Créer un creneau
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
          onClick={() => void handleDownloadVolunteers()}
        >
          Télécharger les bénévoles en Excel
        </Button>
        <Button
          type="button"
          className="border border-[var(--color-primary)] bg-white px-8 py-2 text-[var(--color-primary)]"
          onClick={() => navigate("/collections")}
        >
          Retour
        </Button>
        <Button
          type="button"
          onClick={() => void handleEdit()}
          disabled={isSubmitting || !title.trim()}
          className="border border-[var(--color-primary)] bg-white px-8 py-2 text-[var(--color-primary)]"
        >
          {isSubmitting ? "Edition..." : "Editer"}
        </Button>
      </div>
    </section>
  );
};

export default Collection;
