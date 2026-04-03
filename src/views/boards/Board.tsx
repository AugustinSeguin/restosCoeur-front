import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import {
  Button,
  SelectList,
  type SelectOption,
} from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import type {
  Assignment,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "../../types/Assignment";
import type { Collection } from "../../types/Collection";
import type { Store } from "../../types/Store";
import type { User } from "../../types/User";

type UserAnswer = {
  id: number;
  userId: number;
  collectionId: number;
  slotId: number;
  zoneId: number;
  createdAt: string;
  updatedAt: string;
};

type SlotWithStores = {
  id: number;
  startAt: string;
  endAt: string;
  collectionId: number;
  openStores: Store[];
};

type BoardUser = User & {
  assignments: Assignment[];
  userAnswers: UserAnswer[];
};

type BoardCollection = Collection & {
  users: BoardUser[];
  slots: SlotWithStores[];
};

const formatSlotLabel = (slot: SlotWithStores, index: number) => {
  const start = new Date(slot.startAt);
  const end = new Date(slot.endAt);
  const date = start.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
  const timeRange = `${start.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}-${end.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return `${date} - ${timeRange}`;
};

const keyForSelection = (userId: number, slotId: number) =>
  `${userId}-${slotId}`;

const Board = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [board, setBoard] = useState<BoardCollection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [selectedStores, setSelectedStores] = useState<Record<string, string>>(
    {},
  );

  const collectionId = useMemo(() => Number(id), [id]);

  const loadBoard = useCallback(async () => {
    if (!token || !collectionId) {
      setBoard(null);
      setErrorMessage("Impossible de charger le board sans authentification.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<BoardCollection>(
        `/collectionsBoard/${collectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setBoard(response.data);
    } catch {
      setBoard(null);
      setErrorMessage("Impossible de charger le detail du board.");
    } finally {
      setIsLoading(false);
    }
  }, [token, collectionId]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (!board) {
      setSelectedStores({});
      return;
    }

    const defaults: Record<string, string> = {};

    for (const user of board.users) {
      for (const assignment of user.assignments) {
        defaults[keyForSelection(user.id, assignment.slotId)] = String(
          assignment.storeId,
        );
      }
    }

    setSelectedStores(defaults);
  }, [board]);

  const slotOptionsById = useMemo(() => {
    const map: Record<number, SelectOption[]> = {};

    for (const slot of board?.slots ?? []) {
      map[slot.id] = [
        { label: "Choisir un magasin", value: "" },
        ...slot.openStores.map((store) => ({
          label: store.title,
          value: String(store.id),
        })),
      ];
    }

    return map;
  }, [board]);

  const updateSelectedStore = (
    userId: number,
    slotId: number,
    value: string,
  ) => {
    const key = keyForSelection(userId, slotId);
    setSelectedStores((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveUserAssignments = async (user: BoardUser) => {
    if (!token || !board) {
      setErrorMessage("Authentification requise.");
      return;
    }

    setSavingUserId(user.id);
    setErrorMessage("");

    const answeredSlots = board.slots.filter((slot) =>
      user.userAnswers.some((answer) => answer.slotId === slot.id),
    );

    try {
      for (const slot of answeredSlots) {
        const selectedStoreId = Number(
          selectedStores[keyForSelection(user.id, slot.id)] ?? "",
        );

        if (!selectedStoreId) {
          continue;
        }

        const existing = user.assignments.find(
          (assignment) => assignment.slotId === slot.id,
        );

        if (existing) {
          const payload: UpdateAssignmentPayload = {
            newUserId: user.id,
            newSlotId: slot.id,
            newStoreId: selectedStoreId,
            newCollectionId: board.id,
          };

          await api.put(
            `/assignments/${existing.collectionId}/${existing.userId}/${existing.slotId}/${existing.storeId}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        } else {
          const payload: CreateAssignmentPayload = {
            userId: user.id,
            slotId: slot.id,
            storeId: selectedStoreId,
            collectionId: board.id,
          };

          await api.post("/assignments", payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }

      await loadBoard();
    } catch {
      setErrorMessage("Erreur pendant l'enregistrement des affectations.");
    } finally {
      setSavingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[95vw] rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
        <p className="m-0 text-sm text-[var(--color-text)]">
          Chargement du board...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-[95vw] gap-4 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-3 sm:p-6">
      <header className="flex items-center justify-center">
        <h1 className="m-0 text-center text-lg font-semibold uppercase tracking-[0.06em] text-[var(--color-primary)] sm:text-2xl">
          {board?.title ?? "Tableau de bord"}
        </h1>
      </header>

      {errorMessage ? (
        <p className="m-0 rounded-lg border border-[var(--color-error)]/50 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
          {errorMessage}
        </p>
      ) : null}

      {board ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-[var(--color-secondary)]/35 bg-white/60">
            <table className="min-w-[980px] table-fixed border-collapse">
              <thead>
                <tr>
                  <th className="w-52 border border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 px-3 py-3 text-left text-sm font-semibold text-[var(--color-primary)]">
                    Bénévole
                  </th>
                  {board.slots.map((slot, index) => (
                    <th
                      key={slot.id}
                      className="w-56 border border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 px-3 py-3 text-left text-sm font-semibold text-[var(--color-primary)]"
                    >
                      {formatSlotLabel(slot, index)}
                    </th>
                  ))}
                  <th className="w-36 border border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 px-3 py-3 text-left text-sm font-semibold text-[var(--color-primary)]">
                    Enregistrements
                  </th>
                </tr>
              </thead>

              <tbody>
                {board.users.map((user) => (
                  <tr key={user.id}>
                    <td className="border border-[var(--color-secondary)]/35 px-3 py-2 align-top text-sm font-medium text-[var(--color-text)]">
                      {user.firstName} {user.lastName}
                    </td>

                    {board.slots.map((slot) => {
                      const hasAnswer = user.userAnswers.some(
                        (answer) => answer.slotId === slot.id,
                      );

                      const borderClass = hasAnswer
                        ? "border-[var(--color-green)]"
                        : "border-[var(--color-red)]";

                      return (
                        <td
                          key={`${user.id}-${slot.id}`}
                          className={`border-2 ${borderClass} px-2 py-2 align-top`}
                        >
                          {hasAnswer ? (
                            <SelectList
                              label=""
                              options={slotOptionsById[slot.id] ?? []}
                              value={
                                selectedStores[
                                  keyForSelection(user.id, slot.id)
                                ] ?? ""
                              }
                              onChange={(event) =>
                                updateSelectedStore(
                                  user.id,
                                  slot.id,
                                  event.target.value,
                                )
                              }
                            />
                          ) : null}
                        </td>
                      );
                    })}

                    <td className="border border-[var(--color-secondary)]/35 px-2 py-2 align-top">
                      <Button
                        type="button"
                        disabled={savingUserId === user.id}
                        onClick={() => void saveUserAssignments(user)}
                        className="w-full bg-white text-[var(--color-primary)]"
                      >
                        {savingUserId === user.id
                          ? "Enregistrement..."
                          : "Enregistrer"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                console.log("Envoyer les notifications", board.id);
              }}
              className="w-full sm:w-auto"
            >
              Envoyer les notifications
            </Button>
          </div>
        </>
      ) : null}
    </section>
  );
};

export default Board;
