"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True once the component has hydrated on the client, false during SSR and
 * the first client render — the standard way to gate client-only reads
 * (like next-themes' `resolvedTheme`) without a "setState in an effect"
 * cascading render.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
