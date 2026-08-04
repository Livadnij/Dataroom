export type Theme = "light" | "dark" | "system";
export type ViewMode = "table" | "grid";

export interface Settings {
  theme: Theme;
  viewMode: ViewMode;
}

const STORAGE_KEY = "dataroom-settings";

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  viewMode: "table",
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let cachedRaw: string | null | undefined;
let cachedSettings: Settings = DEFAULT_SETTINGS;

export function readSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return DEFAULT_SETTINGS;
  }

  if (raw === cachedRaw) return cachedSettings;
  cachedRaw = raw;

  if (!raw) {
    cachedSettings = DEFAULT_SETTINGS;
    return cachedSettings;
  }

  try {
    cachedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    cachedSettings = DEFAULT_SETTINGS;
  }
  return cachedSettings;
}

export function writeSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  notify();
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const next = { ...readSettings(), ...patch };
  writeSettings(next);
  return next;
}
