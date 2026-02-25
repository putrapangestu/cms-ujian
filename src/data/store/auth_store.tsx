import { removeToken, setToken } from "@/lib/token-handler";
import { create } from "zustand";
import { mutate } from "swr";
import type { RoleType } from "../types/Role";
import { AUTH } from "../const/api_url";

type AuthState = {
    isFetched: boolean;
    setIsFetched: (isFetched: boolean) => void;
    isAuthenticated: boolean;
    roles: RoleType[];
    user: any;
    login: (data: any, isValidate?: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isFetched: false,
    setIsFetched: (isFetched: boolean) => set({ isFetched }),
    isAuthenticated: false,
    roles: [],
    user: null,
    login: (data: any, isValidate: boolean =  true) => {
        set({ isAuthenticated: true, roles: data.roles, user: data.user })
        if(!isValidate) setToken(data.token)
        mutate(AUTH.ME, data.user)
    },
    logout: () => {
        set({ isAuthenticated: false, roles: [], user: null })
        removeToken()
        mutate(AUTH.ME, null)
    },
}))