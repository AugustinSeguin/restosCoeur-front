import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axiosConfig";
import { Button, Checkbox, TextInput } from "../../components/generic";

type CollectionSlot = {
  id: number;
  startAt: string;
  endAt: string;
  collectionId: number;
};

type CollectionZone = {
  collectionId: number;
  zoneId: number;
  zone: {
    id: number;
    title: string;
  };
};

type CollectionDetails = {
  id: number;
  title: string;
  isActive: boolean;
  formUrl: string;
  slots: CollectionSlot[];
  zones: CollectionZone[];
};

type FormValues = {
  lastName: string;
  firstName: string;
  phoneNumber: string;
  birthdate: string;
  codePostal: string;
  email: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const getCollectionIdFromUrl = () => {
  const params = new URLSearchParams(globalThis.location.search);
  const fromCollectionId = params.get("collectionId");
  const fromId = params.get("id");
  const raw = fromCollectionId ?? fromId ?? "1";
  const parsed = Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    if (!fromCollectionId && !fromId) {
      params.set("collectionId", "1");
      const query = params.toString();
      const newUrl = `${globalThis.location.pathname}${query ? `?${query}` : ""}${globalThis.location.hash}`;
      globalThis.history.replaceState(null, "", newUrl);
    }
    return 1;
  }

  if (!fromCollectionId && !fromId) {
    params.set("collectionId", String(parsed));
    const query = params.toString();
    const newUrl = `${globalThis.location.pathname}?${query}${globalThis.location.hash}`;
    globalThis.history.replaceState(null, "", newUrl);
  }

  return parsed;
};

const formatDayLabel = (isoDate: string) => {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(isoDate));
};

const formatTimeLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  const hour = date.getHours();
  const minutes = date.getMinutes();

  if (minutes === 0) {
    return `${hour}h`;
  }

  return `${hour}h${String(minutes).padStart(2, "0")}`;
};

const validate = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  if (!values.lastName.trim()) {
    errors.lastName = "Le nom est obligatoire.";
  }

  if (!values.firstName.trim()) {
    errors.firstName = "Le prenom est obligatoire.";
  }

  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = "Le numero de telephone est obligatoire.";
  } else if (!/^(\+?\d[\d\s().-]{7,}\d)$/.test(values.phoneNumber.trim())) {
    errors.phoneNumber = "Le format du numero de telephone est invalide.";
  }

  if (!values.birthdate) {
    errors.birthdate = "La date de naissance est obligatoire.";
  }

  if (!values.codePostal.trim()) {
    errors.codePostal = "Le code postal est obligatoire.";
  } else if (!/^\d{5}$/.test(values.codePostal.trim())) {
    errors.codePostal = "Le code postal doit contenir 5 chiffres.";
  }

  if (
    values.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  ) {
    errors.email = "Le format de l'email est invalide.";
  }

  return errors;
};

const Form = () => {
  const collectionId = useMemo(() => getCollectionIdFromUrl(), []);
  const [collection, setCollection] = useState<CollectionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({
    lastName: "",
    firstName: "",
    phoneNumber: "",
    birthdate: "",
    codePostal: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState<number[]>([]);
  const [submissionMessage, setSubmissionMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<CollectionDetails>(
          `/collections/${collectionId}`,
        );

        setCollection(response.data);
      } catch {
        setError("Impossible de recuperer les donnees de collecte.");
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId]);

  const groupedSlots = useMemo(() => {
    if (!collection) {
      return [] as Array<{ key: string; day: string; slots: CollectionSlot[] }>;
    }

    const sortedSlots = [...collection.slots].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    );

    const byDay = new Map<string, CollectionSlot[]>();

    for (const slot of sortedSlots) {
      const key = new Date(slot.startAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const current = byDay.get(key);
      if (current) {
        current.push(slot);
      } else {
        byDay.set(key, [slot]);
      }
    }

    return Array.from(byDay.entries()).map(([key, slots]) => ({
      key,
      day: formatDayLabel(slots[0].startAt),
      slots,
    }));
  }, [collection]);

  const handleInputChange = (field: keyof FormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const toggleSlot = (slotId: number) => {
    setSelectedSlotIds((previous) =>
      previous.includes(slotId)
        ? previous.filter((id) => id !== slotId)
        : [...previous, slotId],
    );
  };

  const toggleZone = (zoneId: number) => {
    setSelectedZoneIds((previous) =>
      previous.includes(zoneId)
        ? previous.filter((id) => id !== zoneId)
        : [...previous, zoneId],
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmissionMessage(null);

    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      birthdate: values.birthdate,
      codePostal: values.codePostal,
      phoneNumber: values.phoneNumber,
      email: values.email,
      collecteId: collectionId,
      slotIds: selectedSlotIds,
      zoneIds: selectedZoneIds,
    };

    api
      .post("/user-answers", payload)
      .then(() => {
        setTimeout(() => {
          navigate(`/form/success?collectionId=${collectionId}`, {
            state: { collectionTitle: collection?.title },
          });
        }, 1000);
      })
      .catch(() => {
        setSubmissionMessage({
          type: "error",
          text: "Nous avons rencontré une erreur dans la soumission du formulaire. Veuillez réessayer ultérieurement.",
        });
      });
  };

  if (loading) {
    return (
      <p className="text-center text-[var(--color-primary)]">
        Chargement des donnees...
      </p>
    );
  }

  if (error) {
    return <p className="text-center text-[var(--color-secondary)]">{error}</p>;
  }

  if (!collection) {
    return (
      <p className="text-center text-[var(--color-primary)]">
        Aucune collection trouvee.
      </p>
    );
  }

  return (
    <section className="flex min-h-screen w-full flex-col items-stretch pb-6 pt-2">
      <h1 className="mb-4 text-center text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl">
        Formulaire benevole
      </h1>

      <form
        className="grid w-full gap-3 rounded-md border-2 border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--bg-color)_85%,white_15%)] px-4 py-6 sm:px-5"
        onSubmit={handleSubmit}
        noValidate
      >
        {submissionMessage && (
          <div
            className={`m-0 text-center text-sm font-semibold ${
              submissionMessage.type === "warning"
                ? "text-[var(--color-secondary)]"
                : "text-[var(--color-error)]"
            }`}
          >
            {submissionMessage.text}
          </div>
        )}

        <p className="m-0 text-center text-lg font-bold text-[var(--color-secondary)]">
          {collection.title}
        </p>

        <TextInput
          label="Nom *"
          value={values.lastName}
          onChange={(event) =>
            handleInputChange("lastName", event.target.value)
          }
          helperText={errors.lastName}
          required
        />

        <TextInput
          label="Prenom *"
          value={values.firstName}
          onChange={(event) =>
            handleInputChange("firstName", event.target.value)
          }
          helperText={errors.firstName}
          required
        />

        <TextInput
          label="Numero de tel *"
          type="tel"
          value={values.phoneNumber}
          onChange={(event) =>
            handleInputChange("phoneNumber", event.target.value)
          }
          helperText={errors.phoneNumber}
          required
        />

        <TextInput
          label="Date de naissance *"
          type="date"
          value={values.birthdate}
          onChange={(event) =>
            handleInputChange("birthdate", event.target.value)
          }
          helperText={errors.birthdate}
          required
        />

        <TextInput
          label="Code postal *"
          inputMode="numeric"
          maxLength={5}
          value={values.codePostal}
          onChange={(event) =>
            handleInputChange("codePostal", event.target.value)
          }
          helperText={errors.codePostal}
          required
        />

        <TextInput
          label="Email"
          type="email"
          value={values.email}
          onChange={(event) => handleInputChange("email", event.target.value)}
          helperText={errors.email}
        />

        <div className="mt-1 grid gap-1">
          {groupedSlots.map(({ day, slots }) => (
            <div key={day} className="grid gap-1">
              <p className="m-0 font-bold capitalize">{day}</p>
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between gap-3"
                >
                  <Checkbox
                    id={`slot-${slot.id}`}
                    label={`${formatTimeLabel(slot.startAt)} - ${formatTimeLabel(slot.endAt)}`}
                    checked={selectedSlotIds.includes(slot.id)}
                    onChange={() => toggleSlot(slot.id)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-1 grid gap-1">
          <p className="m-0 font-bold">Zones</p>
          {collection.zones.map((zoneItem) => (
            <div
              key={zoneItem.zoneId}
              className="flex items-center justify-between gap-3"
            >
              <Checkbox
                id={`zone-${zoneItem.zoneId}`}
                label={zoneItem.zone.title}
                checked={selectedZoneIds.includes(zoneItem.zoneId)}
                onChange={() => toggleZone(zoneItem.zoneId)}
              />
            </div>
          ))}
        </div>

        <Button className="mt-2" type="submit" variant="secondary">
          SOUMETTRE
        </Button>
      </form>
    </section>
  );
};

export default Form;
