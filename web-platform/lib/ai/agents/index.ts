/**
 * Agent Registry
 * Factory function to get agent instances by role.
 */

import { AgentCore } from './agent-core'
import { CMOAgent } from './cmo'
import type { AgentRole } from './types'

const agents: Partial<Record<AgentRole, () => AgentCore>> = {
  cmo: () => new CMOAgent(),
}

export function getAgent(role: AgentRole): AgentCore {
  const factory = agents[role]
  if (!factory) {
    throw new Error(`Unknown agent role: ${role}`)
  }
  return factory()
}

export function getAvailableRoles(): AgentRole[] {
  return Object.keys(agents) as AgentRole[]
}

export { AgentCore } from './agent-core'
export { CMOAgent } from './cmo'
export type * from './types'
