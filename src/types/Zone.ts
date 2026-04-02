import type { Collection } from "./Collection";
import type { Store } from "./Store";

export type Zone = {
  id: number;
  title: string;
};

export type ZoneCollectionRelation = {
  collectionId: number;
  zoneId: number;
  collection: Collection;
};

export type ZoneDetails = Zone & {
  stores: Store[];
  collections: ZoneCollectionRelation[];
};
