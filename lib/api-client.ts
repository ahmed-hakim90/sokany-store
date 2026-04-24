"use client";

import axios, { type AxiosError } from "axios";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const url = error.config?.url ?? "";
      const method = (error.config?.method ?? "get").toLowerCase();
      if (
        url.includes("/auth/login") ||
        url.includes("/auth/firebase") ||
        url.includes("/auth/register") ||
        url.includes("/auth/logout")
      ) {
        return Promise.reject(error);
      }
      // Public GETs proxied to Woo can return 401 (bad/readonly keys, endpoint policy). That is not a storefront session expiry.
      if (
        method === "get" &&
        (url === "reviews" ||
          url.startsWith("reviews?") ||
          url.includes("/reviews"))
      ) {
        return Promise.reject(error);
      }
      useAuthStore.getState().clearAuth();
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.assign(ROUTES.LOGIN);
      }
    }
    return Promise.reject(error);
  },
);
