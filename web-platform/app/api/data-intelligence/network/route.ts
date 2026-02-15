import { NextRequest, NextResponse } from 'next/server';
import {
  fetchServices, fetchServiceMetrics, fetchPartners,
  fetchServiceRelationships, fetchPartnerServiceLinks,
  fetchBoardMembers, fetchStories, fetchFinancials, fetchStaffStatistics,
} from '@/lib/data-intelligence/queries';
import type { NetworkNode, NetworkEdge, NodeType } from '@/lib/data-intelligence/types';
import { NODE_COLORS } from '@/lib/data-intelligence/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fiscalYear = searchParams.get('fy') ? parseInt(searchParams.get('fy')!) : undefined;
  const domains = searchParams.get('domains')?.split(',') || ['service', 'partner', 'finance', 'staff', 'story', 'governance'];

  try {
    // Run all queries in parallel
    const [services, metrics, partners, relationships, partnerLinks, board, stories, financials, staffStats] = await Promise.all([
      fetchServices(),
      fetchServiceMetrics(fiscalYear),
      fetchPartners(),
      fetchServiceRelationships(fiscalYear),
      fetchPartnerServiceLinks(fiscalYear),
      fetchBoardMembers(),
      fetchStories(),
      fetchFinancials(),
      fetchStaffStatistics(),
    ]);

    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];

    // Central PICC hub node
    nodes.push({
      id: 'picc-hub',
      label: 'PICC',
      type: 'governance',
      group: 0,
      size: 40,
      color: NODE_COLORS.governance,
      metadata: { description: 'Palm Island Community Company' },
    });

    // 1. Service nodes
    if (domains.includes('service')) {
      const metricsMap = new Map(metrics.map((m: any) => [m.organization_service_id, m]));

      for (const svc of services) {
        const svcMetrics = metricsMap.get(svc.id);
        const clientsServed = svcMetrics?.clients_served || 0;
        nodes.push({
          id: `svc-${svc.id}`,
          label: svc.name,
          type: 'service',
          group: 1,
          size: Math.max(12, Math.min(35, 12 + Math.sqrt(clientsServed) * 0.3)),
          color: NODE_COLORS.service,
          metadata: {
            slug: svc.slug,
            serviceType: svc.service_category,
            clientsServed,
            sessionsDelivered: svcMetrics?.sessions_delivered || 0,
            staffCount: svcMetrics?.staff_count || 0,
            keyAchievement: svcMetrics?.key_achievement || null,
          },
        });
        // Connect to hub
        edges.push({
          source: 'picc-hub',
          target: `svc-${svc.id}`,
          type: 'governs',
          weight: 0.3,
        });
      }

      // Service-to-service relationships
      for (const rel of relationships) {
        edges.push({
          source: `svc-${rel.source_service_id}`,
          target: `svc-${rel.target_service_id}`,
          type: rel.relationship_type as any,
          weight: parseFloat(rel.strength) || 0.5,
          label: rel.relationship_type,
        });
      }
    }

    // 2. Partner nodes
    if (domains.includes('partner')) {
      for (const partner of partners) {
        nodes.push({
          id: `partner-${partner.id}`,
          label: partner.short_name || partner.name,
          type: 'partner',
          group: 2,
          size: 14,
          color: NODE_COLORS.partner,
          metadata: {
            fullName: partner.name,
            partnerType: partner.partner_type,
            website: partner.website_url,
          },
        });
      }

      // Partner-service links
      for (const link of partnerLinks) {
        edges.push({
          source: `partner-${link.partner_id}`,
          target: `svc-${link.service_id}`,
          type: link.link_type === 'funds' ? 'funds_flow' : 'partnership',
          weight: link.link_type === 'funds' ? 0.7 : 0.5,
          label: link.link_type,
        });
      }

      // Partners without specific service links connect to hub
      const linkedPartnerIds = new Set(partnerLinks.map((l: any) => l.partner_id));
      for (const partner of partners) {
        if (!linkedPartnerIds.has(partner.id)) {
          edges.push({
            source: `partner-${partner.id}`,
            target: 'picc-hub',
            type: 'partnership',
            weight: 0.3,
          });
        }
      }
    }

    // 3. Finance nodes (expense categories from latest year)
    if (domains.includes('finance') && financials.length > 0) {
      const latest = financials[financials.length - 1];
      const expenseCategories = [
        { key: 'labour_costs', label: 'Labour', amount: latest.labour_costs || 0, color: '#EF4444' },
        { key: 'administration_expenses', label: 'Admin', amount: latest.administration_expenses || 0, color: '#F59E0B' },
        { key: 'travel_training_expenses', label: 'Travel & Training', amount: latest.travel_training_expenses || 0, color: '#8B5CF6' },
        { key: 'client_related_costs', label: 'Client Services', amount: latest.client_related_costs || 0, color: '#3B82F6' },
        { key: 'property_energy_expenses', label: 'Property & Energy', amount: latest.property_energy_expenses || 0, color: '#10B981' },
        { key: 'motor_vehicle_expenses', label: 'Motor Vehicles', amount: latest.motor_vehicle_expenses || 0, color: '#EC4899' },
      ];

      const maxExpense = Math.max(...expenseCategories.map(c => c.amount));

      for (const cat of expenseCategories) {
        nodes.push({
          id: `fin-${cat.key}`,
          label: cat.label,
          type: 'finance',
          group: 3,
          size: Math.max(10, 30 * (cat.amount / (maxExpense || 1))),
          color: cat.color,
          metadata: { amount: cat.amount, fiscalYear: latest.fiscal_year },
        });
        edges.push({
          source: 'picc-hub',
          target: `fin-${cat.key}`,
          type: 'funds_flow',
          weight: cat.amount / (maxExpense || 1),
        });
      }
    }

    // 4. Staff group nodes
    if (domains.includes('staff') && staffStats.length > 0) {
      const latest = staffStats[staffStats.length - 1];
      const nonIndigenous = (latest.total_staff || 0) - (latest.indigenous_staff_count || 0);
      const staffGroups = [
        { id: 'staff-indigenous', label: `Indigenous Staff (${latest.indigenous_staff_count})`, count: latest.indigenous_staff_count || 0 },
        { id: 'staff-non-indigenous', label: `Non-Indigenous Staff (${nonIndigenous})`, count: nonIndigenous },
        { id: 'staff-residents', label: `PI Residents (${latest.palm_island_resident_count})`, count: latest.palm_island_resident_count || 0 },
      ];

      for (const group of staffGroups) {
        nodes.push({
          id: group.id,
          label: group.label,
          type: 'staff',
          group: 4,
          size: Math.max(10, 10 + Math.sqrt(group.count) * 1.5),
          color: NODE_COLORS.staff,
          metadata: { count: group.count, fiscalYear: latest.fiscal_year },
        });
        edges.push({
          source: 'picc-hub',
          target: group.id,
          type: 'employs',
          weight: group.count / (latest.total_staff || 1),
        });
      }
    }

    // 5. Story nodes (sampled)
    if (domains.includes('story') && stories.length > 0) {
      const sampleStories = stories.slice(0, 10);
      for (const story of sampleStories) {
        nodes.push({
          id: `story-${story.id}`,
          label: story.title?.substring(0, 25) || 'Untitled',
          type: 'story',
          group: 5,
          size: story.is_featured ? 16 : 10,
          color: NODE_COLORS.story,
          metadata: { category: story.category, section: story.report_section },
        });
        edges.push({
          source: `story-${story.id}`,
          target: 'picc-hub',
          type: 'tells',
          weight: story.is_featured ? 0.7 : 0.3,
        });
      }
    }

    // 6. Governance / board nodes
    if (domains.includes('governance')) {
      for (const member of board) {
        nodes.push({
          id: `board-${member.id}`,
          label: member.name,
          type: 'governance',
          group: 6,
          size: member.role === 'Chair' ? 18 : 12,
          color: NODE_COLORS.governance,
          metadata: { role: member.role },
        });
        edges.push({
          source: `board-${member.id}`,
          target: 'picc-hub',
          type: 'governs',
          weight: member.role === 'Chair' ? 0.9 : 0.5,
        });
      }
    }

    // Filter out edges referencing non-existent nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    const validEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    return NextResponse.json({
      nodes,
      edges: validEdges,
      meta: {
        nodeCount: nodes.length,
        edgeCount: validEdges.length,
        domains,
        fiscalYear: fiscalYear || 'latest',
      },
    });
  } catch (error) {
    console.error('Network API error:', error);
    return NextResponse.json({ error: 'Failed to build network graph' }, { status: 500 });
  }
}
