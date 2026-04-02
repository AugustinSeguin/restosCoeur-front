export type Collection = {
  id: number;
  title: string;
  isActive: boolean;
  formUrl: string;
};

export type CollectionSlot = {
  id: number;
  startAt: string;
  endAt: string;
  collectionId: number;
};

export type CollectionZoneRelation = {
  collectionId: number;
  zoneId: number;
  zone: {
    id: number;
    title: string;
  };
};

export type CollectionDetails = Collection & {
  slots: CollectionSlot[];
  zones: CollectionZoneRelation[];
  users?: Array<{
    id: number;
  }>;
};
