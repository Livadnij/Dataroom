import { getDb } from "./db";

export async function resetLocalData(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["datarooms", "folders", "files"], "readwrite");
  await Promise.all([
    tx.objectStore("datarooms").clear(),
    tx.objectStore("folders").clear(),
    tx.objectStore("files").clear(),
  ]);
  await tx.done;
}
