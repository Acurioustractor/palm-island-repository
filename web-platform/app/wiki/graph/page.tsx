'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon';
import Breadcrumbs from '@/components/wiki/Breadcrumbs';
import KnowledgeGraph from '@/components/wiki/KnowledgeGraph';
import { HISTORY_CHAPTERS } from '@/lib/history/chapters';

type NodeType = 'story' | 'person' | 'service' | 'knowledge' | 'quote' | 'artifact';

const TYPE_FILTERS: Array<{ type: NodeType; label: string; icon: BespokeIconName }> = [
  { type: 'story', label: 'Stories', icon: 'story' },
  { type: 'person', label: 'People', icon: 'person' },
  { type: 'service', label: 'Services', icon: 'community' },
  { type: 'knowledge', label: 'Knowledge', icon: 'knowledge' },
  { type: 'quote', label: 'Quotes', icon: 'quote' },
  { type: 'artifact', label: 'Artifacts', icon: 'knowledge' },
];

export default function KnowledgeGraphPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-picc-ochre mx-auto mb-4"></div>
          <p className="text-picc-earth-300">Loading knowledge graph...</p>
        </div>
      </div>
    }>
      <KnowledgeGraphPageInner />
    </Suspense>
  );
}

function KnowledgeGraphPageInner() {
  const searchParams = useSearchParams();
  const chapterSlug = searchParams.get('chapter');
  const chapter = chapterSlug ? HISTORY_CHAPTERS.find(c => c.slug === chapterSlug) : null;

  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<NodeType>>(
    new Set<NodeType>(chapter
      ? ['artifact', 'story', 'person', 'service', 'knowledge', 'quote']
      : ['story', 'person', 'service', 'knowledge', 'quote']
    )
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadGraph() {
      const supabase = createClient();
      const nodes: any[] = [];
      const edges: any[] = [];
      const nodeMap = new Map();

      // 1. Load stories with relationships (up to 200)
      const { data: stories } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          story_category,
          storyteller:storyteller_id (
            id,
            full_name,
            preferred_name
          ),
          service:service_id (
            id,
            service_name
          )
        `)
        .eq('is_public', true)
        .limit(200);

      if (stories) {
        stories.forEach((story: any) => {
          if (!nodeMap.has(story.id)) {
            nodes.push({
              id: story.id,
              label: story.title.length > 30 ? story.title.substring(0, 27) + '...' : story.title,
              type: 'story',
              metadata: { category: story.story_category },
            });
            nodeMap.set(story.id, true);
          }

          if (story.storyteller) {
            const sid = story.storyteller.id;
            if (!nodeMap.has(sid)) {
              nodes.push({
                id: sid,
                label: story.storyteller.preferred_name || story.storyteller.full_name,
                type: 'person',
                size: 15,
              });
              nodeMap.set(sid, true);
            }
            edges.push({ source: sid, target: story.id, type: 'created', strength: 1.0 });
          }

          if (story.service) {
            const svcId = story.service.id;
            if (!nodeMap.has(svcId)) {
              nodes.push({
                id: svcId,
                label: story.service.service_name,
                type: 'service',
                size: 18,
              });
              nodeMap.set(svcId, true);
            }
            edges.push({ source: story.id, target: svcId, type: 'related_to', strength: 0.8 });
          }
        });
      }

      // 2. Load services not already added
      const { data: services } = await supabase
        .from('organization_services')
        .select('id, name, slug, service_category')
        .eq('is_active', true);

      if (services) {
        services.forEach((svc: any) => {
          if (!nodeMap.has(svc.id)) {
            nodes.push({
              id: svc.id,
              label: svc.name,
              type: 'service',
              size: 16,
              metadata: { category: svc.service_category },
            });
            nodeMap.set(svc.id, true);
          }
        });
      }

      // 3. Load knowledge entries
      const { data: knowledge } = await supabase
        .from('knowledge_entries')
        .select('id, title, category, slug')
        .eq('is_public', true)
        .limit(100);

      if (knowledge) {
        knowledge.forEach((entry: any) => {
          if (!nodeMap.has(entry.id)) {
            nodes.push({
              id: entry.id,
              label: entry.title.length > 30 ? entry.title.substring(0, 27) + '...' : entry.title,
              type: 'knowledge',
              metadata: { category: entry.category },
            });
            nodeMap.set(entry.id, true);
          }
        });
      }

      // 4. Load elder quotes
      const { data: quotes } = await supabase
        .from('elder_quotes')
        .select('id, quote_text, speaker_name, theme')
        .limit(50);

      if (quotes) {
        quotes.forEach((quote: any) => {
          if (!nodeMap.has(quote.id)) {
            nodes.push({
              id: quote.id,
              label: `"${quote.quote_text.substring(0, 25)}..."`,
              type: 'quote',
              size: 10,
              metadata: { speaker: quote.speaker_name, theme: quote.theme },
            });
            nodeMap.set(quote.id, true);
          }
        });
      }

      // 5. Load history artifacts (filtered by chapter if specified)
      const artifactQuery = supabase
        .from('history_artifacts')
        .select('id, title, artifact_type, chapter_ref, date_original, content_summary')
        .limit(chapterSlug ? 200 : 50);

      if (chapterSlug) {
        artifactQuery.eq('chapter_ref', chapterSlug);
      }

      const { data: artifacts } = await artifactQuery;

      if (artifacts) {
        artifacts.forEach((artifact: any) => {
          if (!nodeMap.has(artifact.id)) {
            nodes.push({
              id: artifact.id,
              label: artifact.title.length > 30 ? artifact.title.substring(0, 27) + '...' : artifact.title,
              type: 'artifact',
              size: 12,
              metadata: {
                artifactType: artifact.artifact_type,
                chapter: artifact.chapter_ref,
                date: artifact.date_original,
              },
            });
            nodeMap.set(artifact.id, true);
          }
        });

        // Connect artifacts in the same chapter to each other
        if (chapterSlug && artifacts.length > 1) {
          for (let i = 0; i < artifacts.length - 1; i++) {
            edges.push({
              source: artifacts[i].id,
              target: artifacts[i + 1].id,
              type: 'timeline',
              strength: 0.3,
            });
          }
        }
      }

      // 6. Load service-story links for additional edges
      const { data: storyLinks } = await supabase
        .from('service_story_links')
        .select('story_id, service_name')
        .limit(200);

      if (storyLinks && services) {
        const serviceByName = new Map(services.map((s: any) => [s.name, s.id]));
        storyLinks.forEach((link: any) => {
          const serviceId = serviceByName.get(link.service_name);
          if (serviceId && nodeMap.has(link.story_id) && nodeMap.has(serviceId)) {
            edges.push({
              source: link.story_id,
              target: serviceId,
              type: 'related_to',
              strength: 0.7,
            });
          }
        });
      }

      setGraphData({ nodes, edges });
      setLoading(false);
    }

    loadGraph();
  }, [chapterSlug]);

  // Filter nodes and edges based on active filters and search
  const filteredData = useMemo(() => {
    let filteredNodes = graphData.nodes.filter(n => activeFilters.has(n.type));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(n =>
        n.label.toLowerCase().includes(q) ||
        n.metadata?.category?.toLowerCase().includes(q) ||
        n.metadata?.speaker?.toLowerCase().includes(q)
      );
    }

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graphData.edges.filter(
      e => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [graphData, activeFilters, searchQuery]);

  const toggleFilter = (type: NodeType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const breadcrumbs = [
    { label: 'Wiki', href: '/wiki', icon: BookOpen },
    { label: 'Knowledge Graph', href: '/wiki/graph' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-cream">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />

        {/* Chapter Context Banner */}
        {chapter && (
          <div className="mb-6 bg-gradient-to-r from-picc-ochre/10 to-warm-50 border border-picc-ochre/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-picc-ochre" />
              <div>
                <p className="text-sm text-picc-earth-300">Viewing artifacts from</p>
                <p className="font-semibold text-picc-earth">{chapter.title} <span className="font-normal text-picc-earth-300">({chapter.dateRange})</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/wiki/history/${chapter.slug}`}
                className="inline-flex items-center gap-1.5 text-sm text-picc-ochre hover:text-picc-ochre/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to chapter
              </Link>
              <Link
                href="/wiki/graph"
                className="text-sm text-picc-earth-300 hover:text-picc-earth transition-colors"
              >
                View all
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BespokeIcon name="knowledge" size={40} />
            <h1 className="text-4xl font-bold text-picc-earth font-serif">
              Knowledge Graph
            </h1>
          </div>
          <p className="text-lg text-picc-earth-300">
            {chapter
              ? `Exploring connections for ${chapter.title}`
              : 'Explore the relationships between stories, people, services, and knowledge'}
          </p>
        </div>

        {/* Filters + Search */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.type}
              onClick={() => toggleFilter(f.type)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                activeFilters.has(f.type)
                  ? 'bg-picc-ochre text-white border-picc-ochre'
                  : 'bg-white/60 text-picc-earth-300 border-warm-200 hover:border-picc-ochre'
              }`}
            >
              <BespokeIcon name={f.icon} size={18} />
              <span>{f.label}</span>
              <span className="text-xs opacity-70">
                {graphData.nodes.filter(n => n.type === f.type).length}
              </span>
            </button>
          ))}

          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="px-4 py-2 border border-warm-200 rounded-xl text-sm focus:ring-2 focus:ring-picc-ochre focus:border-picc-ochre outline-none text-picc-earth placeholder:text-picc-earth-200 bg-white/60"
          />
        </div>

        {/* Graph */}
        {loading ? (
          <div className="flex items-center justify-center h-96 bg-white/60 rounded-2xl border border-warm-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-picc-ochre mx-auto mb-4"></div>
              <p className="text-picc-earth-300">Building knowledge graph...</p>
            </div>
          </div>
        ) : (
          <KnowledgeGraph
            nodes={filteredData.nodes}
            edges={filteredData.edges}
            height={650}
            onNodeClick={(node) => {
              if (node.type === 'story') {
                window.location.href = `/stories/${node.id}`;
              } else if (node.type === 'person') {
                window.location.href = `/wiki/people/${node.id}`;
              } else if (node.type === 'knowledge') {
                window.location.href = `/wiki/${node.id}`;
              } else if (node.type === 'service') {
                window.location.href = `/services`;
              } else if (node.type === 'artifact') {
                window.location.href = `/wiki/artifact/${node.id}`;
              }
            }}
          />
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white/60 border border-warm-200 rounded-2xl p-6">
          <h3 className="font-semibold text-picc-earth mb-3">How to explore:</h3>
          <ul className="space-y-2 text-picc-earth-300">
            <li>• <strong className="text-picc-earth">Filter</strong> by type using the chips above</li>
            <li>• <strong className="text-picc-earth">Search</strong> to find and highlight specific nodes</li>
            <li>• <strong className="text-picc-earth">Click</strong> a node to see details and navigate to that page</li>
            <li>• <strong className="text-picc-earth">Zoom</strong> in/out using controls or mouse wheel</li>
            <li>• <strong className="text-picc-earth">Pan</strong> by dragging the canvas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
