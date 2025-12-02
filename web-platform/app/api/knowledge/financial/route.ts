import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CreateFinancialRecordInput } from '@/lib/knowledge-base/types'

// GET - List financial records with filtering
export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { searchParams } = new URL(request.url)

    const fiscal_year = searchParams.get('fiscal_year')
    const record_type = searchParams.get('record_type')
    const category = searchParams.get('category')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('financial_records')
      .select(`
        *,
        source:research_sources(id, title, source_type, is_verified)
      `)
      .order('record_date', { ascending: false })

    // Filter by fiscal year (format: "2023-2024")
    if (fiscal_year) {
      query = query.eq('fiscal_year', fiscal_year)
    }

    // Filter by record type (income, expense, asset, liability, etc.)
    if (record_type) {
      query = query.eq('record_type', record_type)
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category)
    }

    // Filter by date range
    if (date_from) {
      query = query.gte('record_date', date_from)
    }
    if (date_to) {
      query = query.lte('record_date', date_to)
    }

    query = query.range(offset, offset + limit - 1)

    const { data: records, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate summary statistics if fiscal_year is specified
    let summary = null
    if (fiscal_year && records && records.length > 0) {
      const income = records
        .filter(r => r.record_type === 'income')
        .reduce((sum, r) => sum + (r.amount || 0), 0)

      const expenses = records
        .filter(r => r.record_type === 'expense')
        .reduce((sum, r) => sum + (r.amount || 0), 0)

      const assets = records
        .filter(r => r.record_type === 'asset')
        .reduce((sum, r) => sum + (r.amount || 0), 0)

      const liabilities = records
        .filter(r => r.record_type === 'liability')
        .reduce((sum, r) => sum + (r.amount || 0), 0)

      summary = {
        fiscal_year,
        total_income: income,
        total_expenses: expenses,
        net_result: income - expenses,
        total_assets: assets,
        total_liabilities: liabilities,
        net_assets: assets - liabilities,
        record_count: records.length
      }
    }

    return NextResponse.json({ records, summary })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create financial record
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const body: CreateFinancialRecordInput = await request.json()

    if (!body.record_type || !body.fiscal_year || !body.category) {
      return NextResponse.json({
        error: 'Missing required fields: record_type, fiscal_year, category'
      }, { status: 400 })
    }

    const { data: record, error } = await supabase
      .from('financial_records')
      .insert({
        record_type: body.record_type,
        fiscal_year: body.fiscal_year,
        category: body.category,
        subcategory: body.subcategory,
        description: body.description,
        amount: body.amount,
        currency: body.currency || 'AUD',
        period_start: body.period_start,
        period_end: body.period_end,
        period_type: body.period_type,
        source_id: body.source_id,
        notes: body.notes
      })
      .select(`
        *,
        source:research_sources(id, title, source_type, is_verified)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ record, created: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Bulk import financial records
export async function PUT(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const body = await request.json()
    const { records, source_id } = body

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({
        error: 'Records array is required and must not be empty'
      }, { status: 400 })
    }

    // Validate all records have required fields
    for (const record of records) {
      if (!record.record_type || !record.fiscal_year || !record.category) {
        return NextResponse.json({
          error: 'All records must have record_type, fiscal_year, and category'
        }, { status: 400 })
      }
    }

    // Add source_id to all records if provided
    const recordsToInsert = records.map(r => ({
      record_type: r.record_type,
      fiscal_year: r.fiscal_year,
      category: r.category,
      subcategory: r.subcategory,
      description: r.description,
      amount: r.amount,
      currency: r.currency || 'AUD',
      record_date: r.record_date,
      source_id: r.source_id || source_id,
      metadata: r.metadata
    }))

    const { data: insertedRecords, error } = await supabase
      .from('financial_records')
      .insert(recordsToInsert)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      records: insertedRecords,
      imported_count: insertedRecords?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
