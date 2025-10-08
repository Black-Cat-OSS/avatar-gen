// Counter entity model
export interface Counter {
  id: string;
  value: number;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CounterState {
  counters: Counter[];
  isLoading: boolean;
  error: string | null;
}

export interface CreateCounterData {
  label: string;
  initialValue?: number;
}

export interface UpdateCounterData {
  value?: number;
  label?: string;
}
