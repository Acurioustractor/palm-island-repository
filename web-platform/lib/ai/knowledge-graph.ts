/**
 * Knowledge Graph Service
 *
 * Builds and queries a knowledge graph of relationships
 * between stories, people, places, and concepts.
 */

import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export interface GraphNode {
  id: string
  label: string
  type: 'story' | 'person' | 'place' | 'concept' | 'event' | 'knowledge'
  group: number
  size?: number
  metadata?: Record<string, any>
}

export interface GraphEdge {
  source: string
  target: string
  relationship: string
  weight: number
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: {
    totalNodes: number
    totalEdges: number
    generatedAt: string
  }
}

// Group colors for D3 visualization
const TYPE_GROUPS: Record<string, number> = {
  story: 1,
  person: 2,
  place: 3,
  concept: 4,
  event: 5,
  knowledge: 6
}

/**
 * Build a knowledge graph from the database
 */
export async function buildKnowledgeGraph(options: {
  limit?: number
  types?: string[]
  centeredOn?: { id: string; type: string }
} = {}): Promise<KnowledgeGraph> {
  const supabase = getSupabase()
  const { limit = 100, types, centeredOn } = options

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const nodeIds = new Set<string>()

  // Fetch stories
  if (!types || types.includes('story')) {
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, story_category, storyteller_id')
      .eq('is_public', true)
      .limit(limit)

    if (stories) {
      for (const story of stories) {
        const nodeId = `story:${story.id}`
        if (!nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            label: story.title,
            type: 'story',
            group: TYPE_GROUPS.story,
            size: 15,
            metadata: { category: story.story_category }
          })
          nodeIds.add(nodeId)
        }

        // Link to storyteller
        if (story.storyteller_id) {
          const personId = `person:${story.storyteller_id}`
          edges.push({
            source: nodeId,
            target: personId,
            relationship: 'told by',
            weight: 1
          })
        }

        // Link to category concept
        if (story.story_category) {
          const categoryId = `concept:${story.story_category}`
          if (!nodeIds.has(categoryId)) {
            nodes.push({
              id: categoryId,
              label: story.story_category.replace('_', ' '),
              type: 'concept',
              group: TYPE_GROUPS.concept,
              size: 20
            })
            nodeIds.add(categoryId)
          }
          edges.push({
            source: nodeId,
            target: categoryId,
            relationship: 'category',
            weight: 0.5
          })
        }
      }
    }
  }

  // Fetch people
  if (!types || types.includes('person')) {
    const { data: people } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_name, storyteller_type, is_elder')
      .eq('show_in_directory', true)
      .limit(limit)

    if (people) {
      for (const person of people) {
        const nodeId = `person:${person.id}`
        if (!nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            label: person.preferred_name || person.full_name,
            type: 'person',
            group: TYPE_GROUPS.person,
            size: person.is_elder ? 25 : 18,
            metadata: {
              type: person.storyteller_type,
              isElder: person.is_elder
            }
          })
          nodeIds.add(nodeId)
        }

        // Link elders to elder concept
        if (person.is_elder) {
          const elderId = 'concept:elders'
          if (!nodeIds.has(elderId)) {
            nodes.push({
              id: elderId,
              label: 'Elders',
              type: 'concept',
              group: TYPE_GROUPS.concept,
              size: 25
            })
            nodeIds.add(elderId)
          }
          edges.push({
            source: nodeId,
            target: elderId,
            relationship: 'is elder',
            weight: 0.8
          })
        }
      }
    }
  }

  // Fetch knowledge entries
  if (!types || types.includes('knowledge')) {
    const { data: knowledge } = await supabase
      .from('knowledge_entries')
      .select('id, title, category, entry_type')
      .eq('is_public', true)
      .limit(limit)

    if (knowledge) {
      for (const entry of knowledge) {
        const nodeId = `knowledge:${entry.id}`
        if (!nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            label: entry.title,
            type: 'knowledge',
            group: TYPE_GROUPS.knowledge,
            size: 15,
            metadata: {
              category: entry.category,
              entryType: entry.entry_type
            }
          })
          nodeIds.add(nodeId)
        }

        // Link to category
        if (entry.category) {
          const categoryId = `concept:${entry.category}`
          if (!nodeIds.has(categoryId)) {
            nodes.push({
              id: categoryId,
              label: entry.category,
              type: 'concept',
              group: TYPE_GROUPS.concept,
              size: 18
            })
            nodeIds.add(categoryId)
          }
          edges.push({
            source: nodeId,
            target: categoryId,
            relationship: 'category',
            weight: 0.5
          })
        }
      }
    }
  }

  // Add Palm Island as central place node
  const placeId = 'place:palm-island'
  if (!nodeIds.has(placeId)) {
    nodes.push({
      id: placeId,
      label: 'Palm Island',
      type: 'place',
      group: TYPE_GROUPS.place,
      size: 35
    })
    nodeIds.add(placeId)

    // Connect all people to Palm Island
    for (const node of nodes) {
      if (node.type === 'person') {
        edges.push({
          source: node.id,
          target: placeId,
          relationship: 'from',
          weight: 0.3
        })
      }
    }
  }

  return {
    nodes,
    edges,
    metadata: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      generatedAt: new Date().toISOString()
    }
  }
}

/**
 * Get subgraph centered on a specific node
 */
export async function getNodeNeighborhood(
  nodeId: string,
  depth: number = 1
): Promise<KnowledgeGraph> {
  const fullGraph = await buildKnowledgeGraph({ limit: 200 })

  const includedNodes = new Set<string>([nodeId])
  const includedEdges: GraphEdge[] = []

  // BFS to find neighbors
  let currentLevel = [nodeId]
  for (let d = 0; d < depth; d++) {
    const nextLevel: string[] = []

    for (const edge of fullGraph.edges) {
      if (currentLevel.includes(edge.source) && !includedNodes.has(edge.target)) {
        includedNodes.add(edge.target)
        nextLevel.push(edge.target)
        includedEdges.push(edge)
      }
      if (currentLevel.includes(edge.target) && !includedNodes.has(edge.source)) {
        includedNodes.add(edge.source)
        nextLevel.push(edge.source)
        includedEdges.push(edge)
      }
    }

    currentLevel = nextLevel
  }

  // Include edges between included nodes
  for (const edge of fullGraph.edges) {
    if (includedNodes.has(edge.source) && includedNodes.has(edge.target)) {
      if (!includedEdges.includes(edge)) {
        includedEdges.push(edge)
      }
    }
  }

  const nodes = fullGraph.nodes.filter(n => includedNodes.has(n.id))

  return {
    nodes,
    edges: includedEdges,
    metadata: {
      totalNodes: nodes.length,
      totalEdges: includedEdges.length,
      generatedAt: new Date().toISOString()
    }
  }
}

/**
 * Get graph statistics
 */
export async function getGraphStats(): Promise<{
  totalNodes: number
  nodesByType: Record<string, number>
  totalEdges: number
  mostConnected: Array<{ id: string; label: string; connections: number }>
}> {
  const graph = await buildKnowledgeGraph({ limit: 500 })

  const nodesByType: Record<string, number> = {}
  for (const node of graph.nodes) {
    nodesByType[node.type] = (nodesByType[node.type] || 0) + 1
  }

  // Count connections per node
  const connectionCount: Record<string, number> = {}
  for (const edge of graph.edges) {
    connectionCount[edge.source] = (connectionCount[edge.source] || 0) + 1
    connectionCount[edge.target] = (connectionCount[edge.target] || 0) + 1
  }

  const mostConnected = Object.entries(connectionCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id, connections]) => {
      const node = graph.nodes.find(n => n.id === id)
      return {
        id,
        label: node?.label || id,
        connections
      }
    })

  return {
    totalNodes: graph.nodes.length,
    nodesByType,
    totalEdges: graph.edges.length,
    mostConnected
  }
}
