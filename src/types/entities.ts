export interface Dataroom {
  id: string;
  name: string;
  createdAt: number;
}

export interface FolderNode {
  id: string;
  dataroomId: string;
  parentId: string;
  name: string;
  createdAt: number;
}

export interface FileNode {
  id: string;
  dataroomId: string;
  parentId: string;
  name: string;
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: number;
}

export type BrowserItem =
  | ({ kind: "folder" } & FolderNode)
  | ({ kind: "file" } & FileNode);
