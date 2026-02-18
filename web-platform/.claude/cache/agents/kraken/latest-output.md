# Implementation Report: Service Admin Team Members & Conversation People Links
Generated: 2026-02-19

## Task
Enhanced the PICC service admin to show team members linked via profile metadata, and connected the conversations tab author field to those team profiles.

## Changes Made

### 1. New API: `/api/services/[id]/team/route.ts`
**File:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/app/api/services/[id]/team/route.ts`

- **GET**: Fetches all profiles, filters to those whose `metadata.linked_services` array contains the service_id. Returns `{ team }` with profile info plus role/title from the linked_services entry. Supports `?allProfiles=true` query param to also return all profiles for the search picker.
- **POST**: Links a profile to the service by appending to the profile's `metadata.linked_services` JSONB array. Body: `{ profile_id, role, title }`. Also fetches the service slug for the link entry. Returns 409 if already linked.
- **DELETE**: Removes a service link from a profile's `metadata.linked_services` array. Query param: `profileId`.

### 2. Enhanced PeoplePartnersTab.tsx
**File:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/components/service-admin/PeoplePartnersTab.tsx`

- Added a "Team Members" section ABOVE the existing Partners section
- Team members displayed in a 2-column grid with avatar (or initials), full_name, role badge, title
- "Add Team Member" button opens a modal with:
  - Searchable profile dropdown (fetches all profiles via `?allProfiles=true`)
  - Role selector (team_member, manager, coordinator, volunteer, community_contact, elder_advisor)
  - Optional title text field
- Each team member card has a remove button
- All existing partner functionality preserved unchanged

### 3. Enhanced ConversationsTab.tsx
**File:** `/Users/benknight/Code/Palm Island Reposistory/web-platform/components/service-admin/ConversationsTab.tsx`

- Added "Service Team" chip bar at the top showing all linked profiles as avatar+name chips
- Replaced the free-text "Your name" author field with a profile dropdown when team members exist
- "Other" button to switch to custom text input (fallback for non-team authors)
- "Team" button to switch back to profile dropdown
- All existing note CRUD functionality preserved unchanged

## Build Results
- `tsc --noEmit`: Clean (no errors)
- `next build`: Clean (successful build)

## Notes
- The team API fetches all profiles and filters in the route handler (not via SQL JSONB query) since supabase-js `.contains()` doesn't reliably handle arrays inside JSONB. With 60 profiles this is efficient enough.
- Profile avatars use `avatar_url` with `profile_image_url` as fallback.
- The `metadata.linked_services` array structure: `{ service_id, slug, role, title }`.
