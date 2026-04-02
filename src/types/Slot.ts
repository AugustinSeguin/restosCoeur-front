export type Slot = {
  startAt: string;
  endAt: string;
  collectionId: number;
};

export type SlotFormData = {
  id?: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};
