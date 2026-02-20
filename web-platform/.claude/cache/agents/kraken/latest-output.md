# Implementation Report: About Page Hardcoded Values Audit
Generated: 2026-02-19

## Task
Audit hardcoded values on the About page and wire to live data sources where available.

## Analysis

### Already Using Live Stats (no action needed)
| Value | Source | Lines |
|-------|--------|-------|
| Staff total | `stats.staff.total` | 108, 391 |
| Indigenous % | `stats.staff.indigenousPct` | 110, 115 |
| Active services | `stats.services.active` | 138 |
| Years operating | `stats.milestones.yearsOperating` | 322 |

### Hardcoded Values -- NO Live Source Available
| Value | Why No Live Source |
|-------|-------------------|
| `$5.8M Annual Local Wages` | `getLiveStats()` has `financials.totalIncome` ($23.4M) but local wages is a different metric. Not tracked separately. |
| `$9.75M total economic output` | Not in any stats system. Different from total income. |
| `2,283 Health Clients Served` | Program-level health stat, not in `getLiveStats()` or `current-stats.ts` |
| `17,488 episodes of care` | Same -- program-level, no live source |
| `779 Health Checks` | Same -- program-level, no live source |
| 7 board members (names/bios) | No `team_members` or board table queried. Board data is content, not stats. |

### Decision
Keep all hardcoded values as-is. They are real data from the PICC Annual Report 2023-24, not fabricated. Per the principle "real data > hardcoded real data > hidden section", hardcoded real data is the correct tier when no live source exists.

## Changes Made
None. No code changes required.

## Recommendations for Future
1. **Health program stats**: Could add a `program_statistics` table to track health clients, episodes, health checks per fiscal year, then extend `getLiveStats()`.
2. **Local wages / economic output**: Could add fields to `annual_financials` table (e.g., `local_wages`, `economic_output`).
3. **Board members**: Could create a `board_members` table or use `team_members` with a `role_type = 'board'` filter, then query dynamically.

These would require database migrations and data entry -- not something to fabricate.

## Test Results
No code changes, no tests needed.
