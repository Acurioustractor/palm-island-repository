-- Agent System Tables
-- Shared schema for CMO and future role agents (CEO, CFO, CDO, CPO, Cultural Officer)

-- Persistent knowledge per agent role
create table if not exists agent_knowledge (
  id uuid primary key default gen_random_uuid(),
  agent_role text not null,           -- 'cmo', 'ceo', 'cfo', etc.
  domain text not null,               -- e.g. 'campaigns', 'partnerships', 'brand'
  key text not null,                   -- e.g. 'q3_newsletter_open_rate'
  value jsonb not null,                -- flexible value
  source text,                         -- 'interview', 'import', 'observation'
  confidence text default 'medium',    -- 'low', 'medium', 'high'
  collected_at timestamptz default now(),
  expires_at timestamptz,              -- optional currency tracking
  session_id uuid,                     -- which session captured this
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(agent_role, domain, key)
);

-- Interview/chat sessions
create table if not exists agent_sessions (
  id uuid primary key default gen_random_uuid(),
  agent_role text not null,
  title text,
  template_id text,                    -- e.g. 'quarterly-review', 'quick-capture'
  status text default 'active',        -- 'active', 'completed', 'archived'
  messages jsonb default '[]'::jsonb,  -- array of {role, content, timestamp}
  summary text,
  metadata jsonb default '{}'::jsonb,
  user_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Action items surfaced by agents
create table if not exists agent_action_items (
  id uuid primary key default gen_random_uuid(),
  agent_role text not null,
  session_id uuid references agent_sessions(id) on delete set null,
  title text not null,
  description text,
  priority text default 'medium',      -- 'low', 'medium', 'high', 'urgent'
  status text default 'open',          -- 'open', 'in_progress', 'done', 'dismissed'
  due_date date,
  assigned_to text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_agent_knowledge_role_domain on agent_knowledge(agent_role, domain);
create index if not exists idx_agent_sessions_role on agent_sessions(agent_role);
create index if not exists idx_agent_sessions_status on agent_sessions(status);
create index if not exists idx_agent_action_items_role on agent_action_items(agent_role);
create index if not exists idx_agent_action_items_status on agent_action_items(status);

-- Updated_at triggers
create or replace function update_agent_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger agent_knowledge_updated_at
  before update on agent_knowledge
  for each row execute function update_agent_updated_at();

create trigger agent_sessions_updated_at
  before update on agent_sessions
  for each row execute function update_agent_updated_at();

create trigger agent_action_items_updated_at
  before update on agent_action_items
  for each row execute function update_agent_updated_at();
