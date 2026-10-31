"use client";

import { useEffect, useRef } from "react";
import {
  BUNDLE_STORAGE_PREFIX,
  useAppStore,
} from "@/stores/app-store";

/** Ghi bundle mock vào localStorage khi đổi (giữ demo sau refresh). */
export function PersistBridge() {
  const skip = useRef(true);
  useEffect(() => {
    return useAppStore.subscribe((state, prev) => {
      if (skip.current) {
        skip.current = false;
        return;
      }
      if (!state.verticalId || !state.bundle) return;
      if (state.bundle === prev.bundle) return;
      try {
        window.localStorage.setItem(
          `${BUNDLE_STORAGE_PREFIX}${state.verticalId}`,
          JSON.stringify(state.bundle),
        );
      } catch {
        /* quota */
      }
    });
  }, []);
  return null;
}
