import { lazy, type ComponentType } from "react";

const RELOAD_KEY = "chunk-reload-attempted";

/**
 * Lazy import that recovers from stale chunk hashes after a new deploy.
 * If the dynamic import fails (old index.js pointing at a removed chunk),
 * reload the page once to fetch the fresh manifest.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const mod = await factory();
      window.sessionStorage.removeItem(RELOAD_KEY);
      return mod;
    } catch (error) {
      const alreadyTried = window.sessionStorage.getItem(RELOAD_KEY);
      if (!alreadyTried) {
        window.sessionStorage.setItem(RELOAD_KEY, "1");
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}
