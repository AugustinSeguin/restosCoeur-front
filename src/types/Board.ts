import type { Assignment } from "./Assignment";
import type { Collection } from "./Collection";
import type { Store } from "./Store";
import type { User } from "./User";

export type UserAnswer = {
  id: number;
  userId: number;
  collectionId: number;
  slotId: number;
  zoneId: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SlotWithStores = {
  id: number;
  startAt: string;
  endAt: string;
  collectionId: number;
  openStores: Store[];
};

export type BoardUser = User & {
  assignments: Assignment[];
  userAnswers: UserAnswer[];
};

export type BoardCollection = Collection & {
  users: BoardUser[];
  slots: SlotWithStores[];
};
