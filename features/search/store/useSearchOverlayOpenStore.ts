import { create } from "zustand";

type SearchOverlayOpenState = {
  open: boolean;
  initialQuery: string;
  openOverlay: (initialQuery?: string) => void;
  closeOverlay: () => void;
};

export const useSearchOverlayOpenStore = create<SearchOverlayOpenState>((set) => ({
  open: false,
  initialQuery: "",
  openOverlay: (initialQuery = "") =>
    set({ open: true, initialQuery: initialQuery.trim() }),
  closeOverlay: () => set({ open: false, initialQuery: "" }),
}));
