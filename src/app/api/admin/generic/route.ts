// src/app/api/admin/generic/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { verifyAdminToken } from '@/lib/admin-auth'

const ALLOWED_TABLES = [
  'weddings', 'wedding_couples', 'wedding_events',
  'wedding_gift_accounts', 'wedding_social_links',
  'wedding_themes', 'wedding_media', 'wedding_seos',
  'wedding_features', 'gallery', 'documentary',
  'love_story', 'guests',
]

// Helper untuk log request
function logRequest(method: string, data: any) {
  console.log(`\n${'='.repeat(50)}`)
  console.log(`[${new Date().toISOString()}] GENERIC ${method}`)
  console.log(`Table: ${data.table}`)
  console.log(`Data:`, JSON.stringify(data.data || data, null, 2))
  console.log('='.repeat(50))
}

export async function POST(request: NextRequest) {
  // 1. Check Authorization header
  const authHeader = request.headers.get('Authorization')
  console.log('[POST] Auth header:', authHeader ? 'Present' : 'MISSING')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[POST] Missing or invalid Authorization header')
    return NextResponse.json(
      { error: 'Missing Authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.replace('Bearer ', '')

  // 2. Verify JWT token
  const verified = verifyAdminToken(token)
  if (!verified) {
    console.error('[POST] Invalid or expired token')
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }
  console.log('[POST] Token verified:', verified.role)

  try {
    // 3. Parse request body
    const body = await request.json()
    const { table, data } = body

    logRequest('POST', { table, data })

    // 4. Validate table
    if (!table || !ALLOWED_TABLES.includes(table)) {
      console.error('[POST] Invalid table:', table)
      return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 })
    }

    if (!data || typeof data !== 'object') {
      console.error('[POST] Invalid data:', data)
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // 5. Create service role client
    const supabase = createServerSupabase()
    console.log('[POST] Service role client created')

    // 6. Perform insert
    console.log('[POST] Executing insert...')
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error('[POST] SUPABASE ERROR:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 }
      )
    }

    console.log('[POST] SUCCESS! Inserted:', result?.id)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('[POST] EXCEPTION:', error)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { table, data, id } = body

    logRequest('PUT', { table, id, data })

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const supabase = createServerSupabase()

    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PUT] ERROR:', error)
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 }
      )
    }

    console.log('[PUT] SUCCESS! Updated:', result?.id)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('[PUT] EXCEPTION:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { table, id } = body

    console.log(`[DELETE] Table: ${table}, ID: ${id}`)

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: `Invalid table: ${table}` }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const supabase = createServerSupabase()

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE] ERROR:', error)
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      )
    }

    console.log('[DELETE] SUCCESS!')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[DELETE] EXCEPTION:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}