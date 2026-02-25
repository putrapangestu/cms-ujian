import { create } from "zustand";

type GlobalState = {
    isMounted: boolean;
    setIsMounted: (isMounted: boolean) => void,
}

export const useGlobalStore = create<GlobalState>((set) => ({
    isMounted: false,
    setIsMounted: (isMounted: boolean) => set({ isMounted }),
}))