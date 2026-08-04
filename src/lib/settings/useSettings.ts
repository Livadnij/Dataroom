import { useSyncExternalStore } from "react";
import {
  readSettings,
  subscribe,
  updateSettings,
  type Settings,
} from "./store";

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const settings = useSyncExternalStore(subscribe, readSettings, readSettings);
  return [settings, updateSettings];
}
