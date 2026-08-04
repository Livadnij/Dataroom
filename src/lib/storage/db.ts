import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Dataroom, FolderNode, FileNode } from '@/types/entities'

interface DataroomDB extends DBSchema {
  datarooms: {
    key: string
    value: Dataroom
  }
  folders: {
    key: string
    value: FolderNode
    indexes: { 'by-parent': [string, string]; 'by-dataroom': string }
  }
  files: {
    key: string
    value: FileNode
    indexes: { 'by-parent': [string, string]; 'by-dataroom': string }
  }
}

const DB_NAME = 'dataroom-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<DataroomDB>> | null = null

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<DataroomDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('datarooms', { keyPath: 'id' })

        const folders = db.createObjectStore('folders', { keyPath: 'id' })
        folders.createIndex('by-parent', ['dataroomId', 'parentId'])
        folders.createIndex('by-dataroom', 'dataroomId')

        const files = db.createObjectStore('files', { keyPath: 'id' })
        files.createIndex('by-parent', ['dataroomId', 'parentId'])
        files.createIndex('by-dataroom', 'dataroomId')
      },
    })
  }
  return dbPromise
}

export type { DataroomDB }
