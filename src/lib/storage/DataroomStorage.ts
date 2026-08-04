import type { Dataroom, FolderNode, FileNode } from "@/types/entities";

export interface DataroomContents {
  folders: FolderNode[];
  files: FileNode[];
}

export interface CascadeCount {
  folders: number;
  files: number;
}

export interface DataroomStorage {
  listDatarooms(): Promise<Dataroom[]>;
  createDataroom(name: string): Promise<Dataroom>;
  deleteDataroom(id: string): Promise<void>;

  listContents(
    dataroomId: string,
    folderId: string | null,
  ): Promise<DataroomContents>;
  getFolder(id: string): Promise<FolderNode | undefined>;
  getBreadcrumbs(
    dataroomId: string,
    folderId: string | null,
  ): Promise<FolderNode[]>;
  createFolder(
    dataroomId: string,
    parentId: string | null,
    name: string,
  ): Promise<FolderNode>;
  renameFolder(id: string, name: string): Promise<void>;
  previewFolderDeletion(id: string): Promise<CascadeCount>;
  deleteFolder(id: string): Promise<CascadeCount>;

  uploadFile(
    dataroomId: string,
    parentId: string | null,
    file: File,
  ): Promise<FileNode>;
  renameFile(id: string, name: string): Promise<void>;
  deleteFile(id: string): Promise<void>;
  getFileBlob(id: string): Promise<Blob | undefined>;
}
