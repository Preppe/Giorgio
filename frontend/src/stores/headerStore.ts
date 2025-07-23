import { create } from 'zustand';

interface HeaderState {
  title: string;
}

interface HeaderActions {
  setTitle: (title: string) => void;
  resetTitle: () => void;
}

type HeaderStore = HeaderState & HeaderActions;

export const useHeaderStore = create<HeaderStore>((set) => ({
  title: 'GIORGIO',

  setTitle: (title: string) => {
    set({ title });
  },

  resetTitle: () => {
    set({ title: 'GIORGIO' });
  },
}));

export const getHeaderTitle = (): string => {
  return useHeaderStore.getState().title;
};

export const setHeaderTitle = (title: string): void => {
  useHeaderStore.getState().setTitle(title);
};

export const resetHeaderTitle = (): void => {
  useHeaderStore.getState().resetTitle();
};
