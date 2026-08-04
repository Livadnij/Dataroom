export interface StorageEstimateResult {
  usage: number;
  quota: number;
  supported: boolean;
}

export async function getStorageEstimate(): Promise<StorageEstimateResult> {
  if (!navigator.storage?.estimate) {
    return { usage: 0, quota: 0, supported: false };
  }
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  return { usage, quota, supported: true };
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
