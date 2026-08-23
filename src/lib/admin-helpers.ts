// src/lib/admin-helpers.ts

import { adminInsert, adminUpdate, adminDelete } from '@/lib/admin-api'

/**
 * Upsert untuk single-record tables.
 * Jika record belum ada (id === 'new'), INSERT.
 * Jika sudah ada, UPDATE.
 * 
 * ⚠️ Otomatis exclude `id`, `created_at`, `updated_at` dari data.
 */
export async function upsertSingle(
  table: string,
  record: any,
  now: string = new Date().toISOString()
): Promise<any> {
  const { id, created_at, updated_at, ...dataWithoutMeta } = record

  const payload = {
    ...dataWithoutMeta,
    updated_at: now,
  }

  if (!id || id === 'new') {
    // INSERT - biarkan database generate id & created_at
    return await adminInsert(table, payload)
  } else {
    // UPDATE - by id
    return await adminUpdate(table, id, payload)
  }
}

/**
 * Save array of records (multiple records table).
 * - Records dengan id === 'new' akan di-INSERT
 * - Records dengan id valid akan di-UPDATE
 * - Records yang ada di DB tapi tidak di array akan di-DELETE
 */
export async function saveMultiple(
  table: string,
  records: any[],
  existingIds: string[],
  now: string = new Date().toISOString()
): Promise<void> {
  const currentIds = records
    .filter((r) => r.id && r.id !== 'new')
    .map((r) => r.id)

  // 1. DELETE records yang sudah dihapus dari UI
  const toDelete = existingIds.filter((id) => !currentIds.includes(id))
  for (const id of toDelete) {
    try {
      await adminDelete(table, id)
    } catch (err) {
      console.warn(`[saveMultiple] Failed to delete ${id}:`, err)
    }
  }

  // 2. INSERT or UPDATE setiap record
  for (const record of records) {
    const { id, created_at, updated_at, ...dataWithoutMeta } = record
    const payload = { ...dataWithoutMeta, updated_at: now }

    if (!id || id === 'new') {
      await adminInsert(table, payload)
    } else {
      await adminUpdate(table, id, payload)
    }
  }
}