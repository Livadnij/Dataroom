import { getDb } from "./db";
import { resolveNameCollision } from "@/lib/validation/nameCollision";
import type {
  DataroomStorage,
  DataroomContents,
  CascadeCount,
} from "./DataroomStorage";
import type { Dataroom, FolderNode, FileNode } from "@/types/entities";
import { nanoid } from "nanoid";

function parentKey(dataroomId: string, folderId: string | null): string {
  return folderId ?? dataroomId;
}

function byParentRange(dataroomId: string, parentKeyValue: string) {
  return IDBKeyRange.only([dataroomId, parentKeyValue]);
}

async function collectDescendants(
  dataroomId: string,
  folderId: string,
): Promise<{ folderIds: string[]; fileIds: string[] }> {
  const db = await getDb();
  const folderIds: string[] = [folderId];
  const fileIds: string[] = [];
  const queue: string[] = [folderId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const [childFolders, childFiles] = await Promise.all([
      db.getAllFromIndex(
        "folders",
        "by-parent",
        byParentRange(dataroomId, currentId),
      ),
      db.getAllFromIndex(
        "files",
        "by-parent",
        byParentRange(dataroomId, currentId),
      ),
    ]);
    for (const folder of childFolders) {
      folderIds.push(folder.id);
      queue.push(folder.id);
    }
    for (const file of childFiles) {
      fileIds.push(file.id);
    }
  }

  return { folderIds, fileIds };
}

async function listDatarooms(): Promise<Dataroom[]> {
  const db = await getDb();
  const all = await db.getAll("datarooms");
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

async function createDataroom(name: string): Promise<Dataroom> {
  const db = await getDb();
  const existing = await db.getAll("datarooms");
  const resolvedName = resolveNameCollision(
    name,
    existing.map((d) => d.name),
  );
  const dataroom: Dataroom = {
    id: nanoid(),
    name: resolvedName,
    createdAt: Date.now(),
  };
  await db.put("datarooms", dataroom);
  return dataroom;
}

async function deleteDataroom(id: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["datarooms", "folders", "files"], "readwrite");
  const [folderKeys, fileKeys] = await Promise.all([
    tx.objectStore("folders").index("by-dataroom").getAllKeys(id),
    tx.objectStore("files").index("by-dataroom").getAllKeys(id),
  ]);
  await Promise.all([
    ...folderKeys.map((k) => tx.objectStore("folders").delete(k)),
    ...fileKeys.map((k) => tx.objectStore("files").delete(k)),
    tx.objectStore("datarooms").delete(id),
  ]);
  await tx.done;
}

async function listContents(
  dataroomId: string,
  folderId: string | null,
): Promise<DataroomContents> {
  const db = await getDb();
  const key = parentKey(dataroomId, folderId);
  const [folders, files] = await Promise.all([
    db.getAllFromIndex("folders", "by-parent", byParentRange(dataroomId, key)),
    db.getAllFromIndex("files", "by-parent", byParentRange(dataroomId, key)),
  ]);
  return {
    folders: folders.sort((a, b) => a.name.localeCompare(b.name)),
    files: files.sort((a, b) => a.name.localeCompare(b.name)),
  };
}

async function getFolder(id: string): Promise<FolderNode | undefined> {
  const db = await getDb();
  return db.get("folders", id);
}

async function getBreadcrumbs(
  dataroomId: string,
  folderId: string | null,
): Promise<FolderNode[]> {
  const db = await getDb();
  const trail: FolderNode[] = [];
  let currentId: string | null = folderId;

  while (currentId && currentId !== dataroomId) {
    const folder = await db.get("folders", currentId);
    if (!folder) break;
    trail.unshift(folder);
    currentId = folder.parentId === dataroomId ? null : folder.parentId;
  }

  return trail;
}

async function createFolder(
  dataroomId: string,
  parentId: string | null,
  name: string,
): Promise<FolderNode> {
  const db = await getDb();
  const key = parentKey(dataroomId, parentId);
  const siblings = await db.getAllFromIndex(
    "folders",
    "by-parent",
    byParentRange(dataroomId, key),
  );
  const resolvedName = resolveNameCollision(
    name,
    siblings.map((f) => f.name),
  );
  const folder: FolderNode = {
    id: nanoid(),
    dataroomId,
    parentId: key,
    name: resolvedName,
    createdAt: Date.now(),
  };
  await db.put("folders", folder);
  return folder;
}

async function renameFolder(id: string, name: string): Promise<void> {
  const db = await getDb();
  const folder = await db.get("folders", id);
  if (!folder) throw new Error(`Folder ${id} not found`);
  const siblings = await db.getAllFromIndex(
    "folders",
    "by-parent",
    byParentRange(folder.dataroomId, folder.parentId),
  );
  const resolvedName = resolveNameCollision(
    name,
    siblings.filter((f) => f.id !== id).map((f) => f.name),
  );
  await db.put("folders", { ...folder, name: resolvedName });
}

async function previewFolderDeletion(id: string): Promise<CascadeCount> {
  const folder = await getFolder(id);
  if (!folder) return { folders: 0, files: 0 };
  const { folderIds, fileIds } = await collectDescendants(
    folder.dataroomId,
    id,
  );
  return { folders: folderIds.length, files: fileIds.length };
}

async function deleteFolder(id: string): Promise<CascadeCount> {
  const db = await getDb();
  const folder = await getFolder(id);
  if (!folder) return { folders: 0, files: 0 };

  const { folderIds, fileIds } = await collectDescendants(
    folder.dataroomId,
    id,
  );

  const tx = db.transaction(["folders", "files"], "readwrite");
  await Promise.all([
    ...folderIds.map((fid) => tx.objectStore("folders").delete(fid)),
    ...fileIds.map((fid) => tx.objectStore("files").delete(fid)),
  ]);
  await tx.done;

  return { folders: folderIds.length, files: fileIds.length };
}

async function uploadFile(
  dataroomId: string,
  parentId: string | null,
  file: File,
): Promise<FileNode> {
  const db = await getDb();
  const key = parentKey(dataroomId, parentId);
  const siblings = await db.getAllFromIndex(
    "files",
    "by-parent",
    byParentRange(dataroomId, key),
  );
  const resolvedName = resolveNameCollision(
    file.name,
    siblings.map((f) => f.name),
  );
  const fileNode: FileNode = {
    id: nanoid(),
    dataroomId,
    parentId: key,
    name: resolvedName,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    blob: file,
    createdAt: Date.now(),
  };
  await db.put("files", fileNode);
  return fileNode;
}

async function renameFile(id: string, name: string): Promise<void> {
  const db = await getDb();
  const file = await db.get("files", id);
  if (!file) throw new Error(`File ${id} not found`);
  const siblings = await db.getAllFromIndex(
    "files",
    "by-parent",
    byParentRange(file.dataroomId, file.parentId),
  );
  const resolvedName = resolveNameCollision(
    name,
    siblings.filter((f) => f.id !== id).map((f) => f.name),
  );
  await db.put("files", { ...file, name: resolvedName });
}

async function deleteFile(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("files", id);
}

async function getFileBlob(id: string): Promise<Blob | undefined> {
  const db = await getDb();
  const file = await db.get("files", id);
  return file?.blob;
}

export const dataroomStorage: DataroomStorage = {
  listDatarooms,
  createDataroom,
  deleteDataroom,
  listContents,
  getFolder,
  getBreadcrumbs,
  createFolder,
  renameFolder,
  previewFolderDeletion,
  deleteFolder,
  uploadFile,
  renameFile,
  deleteFile,
  getFileBlob,
};
