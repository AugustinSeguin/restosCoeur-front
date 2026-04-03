import type { Store } from "./Store";

export type Assignment = {
  userId: number;
  slotId: number;
  storeId: number;
  collectionId: number;
  slot?: {
    id: number;
    startAt: string;
    endAt: string;
    collectionId: number;
  };
  store?: Store;
};

export type CreateAssignmentPayload = {
  userId: number;
  slotId: number;
  storeId: number;
  collectionId: number;
};

export type UpdateAssignmentPayload = {
  userId: number;
  slotId: number;
  storeId: number;
  collectionId: number;
  newStoreId: number;
};
