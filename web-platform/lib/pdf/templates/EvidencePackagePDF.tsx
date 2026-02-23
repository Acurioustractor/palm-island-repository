import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { C, MARGIN } from '../theme'

interface EvidenceItem {
  evidence_type: string
  evidence_title: string
  relevance_score: number
  notes?: string
}

interface Outcome {
  outcome_name: string
  outcome_description?: string
  target_metric?: string
  target_value?: number
  actual_value?: number
  status: string
  evidence: EvidenceItem[]
}

interface EvidencePackageData {
  grantName: string
  funderName: string
  fiscalYear: string
  outcomes: Outcome[]
}

export default function EvidencePackagePDF({ data }: { data: EvidencePackageData }) {
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={{ padding: MARGIN, fontFamily: 'Inter' }}>
        <View style={{ marginBottom: 40, paddingBottom: 20, borderBottom: `2px solid ${C.ocean}` }}>
          <Text style={{ fontSize: 28, fontWeight: 700, color: C.ocean, marginBottom: 8 }}>
            Evidence Package
          </Text>
          <Text style={{ fontSize: 16, color: C.driftwood, marginBottom: 4 }}>
            {data.grantName}
          </Text>
          <Text style={{ fontSize: 14, color: C.driftwood }}>
            {data.funderName} | {data.fiscalYear}
          </Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: C.driftwood, marginBottom: 8 }}>
            This package contains evidence supporting {data.outcomes.length} grant outcome{data.outcomes.length !== 1 ? 's' : ''}.
          </Text>
        </View>

        {/* Summary Table */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: C.rock }}>
            Outcomes Summary
          </Text>
          {data.outcomes.map((outcome, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                paddingVertical: 6,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <Text style={{ flex: 3, fontSize: 10, color: C.rock }}>
                {outcome.outcome_name}
              </Text>
              <Text style={{ flex: 1, fontSize: 10, color: C.driftwood, textAlign: 'center' }}>
                {outcome.status}
              </Text>
              <Text style={{ flex: 1, fontSize: 10, color: C.driftwood, textAlign: 'right' }}>
                {outcome.evidence.length} items
              </Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Outcome Detail Pages */}
      {data.outcomes.map((outcome, oi) => (
        <Page key={oi} size="A4" style={{ padding: MARGIN, fontFamily: 'Inter' }}>
          <View style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
            <Text style={{ fontSize: 16, fontWeight: 700, color: C.ocean, marginBottom: 4 }}>
              Outcome {oi + 1}: {outcome.outcome_name}
            </Text>
            {outcome.outcome_description && (
              <Text style={{ fontSize: 10, color: C.driftwood, marginBottom: 4 }}>
                {outcome.outcome_description}
              </Text>
            )}
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {outcome.target_metric && (
                <Text style={{ fontSize: 9, color: C.driftwood }}>
                  Target: {outcome.target_metric} = {outcome.target_value}
                </Text>
              )}
              {outcome.actual_value != null && (
                <Text style={{ fontSize: 9, color: C.driftwood }}>
                  Actual: {outcome.actual_value}
                </Text>
              )}
              <Text style={{ fontSize: 9, fontWeight: 600, color: C.rock }}>
                Status: {outcome.status}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: C.rock }}>
            Evidence ({outcome.evidence.length} items)
          </Text>

          {outcome.evidence.map((ev, ei) => (
            <View
              key={ei}
              style={{
                marginBottom: 8,
                padding: 8,
                backgroundColor: C.shell,
                borderRadius: 4,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: 600, color: C.rock }}>
                  {ev.evidence_title || 'Untitled'}
                </Text>
                <Text style={{ fontSize: 8, color: C.driftwood }}>
                  {ev.evidence_type} | Relevance: {Math.round(ev.relevance_score * 100)}%
                </Text>
              </View>
              {ev.notes && (
                <Text style={{ fontSize: 9, color: C.driftwood }}>
                  {ev.notes}
                </Text>
              )}
            </View>
          ))}

          {outcome.evidence.length === 0 && (
            <Text style={{ fontSize: 10, color: C.driftwood, fontStyle: 'italic' }}>
              No evidence linked to this outcome yet.
            </Text>
          )}
        </Page>
      ))}
    </Document>
  )
}
