# AI-Powered Research Tools - Implementation Plan

## Overview
Transform the Palm Island Story Server into an intelligent research platform using AI to enable semantic search, thematic analysis, quote discovery, and conversational research assistance.

---

## Core AI Features

### 1. Semantic Search
**Goal**: Search stories and documents by meaning, not just keywords

**Features**:
- Natural language queries ("stories about housing challenges")
- Similarity search (find similar stories)
- Cross-content search (stories + documents together)
- Relevance ranking
- Context-aware results
- Search history and saved searches

**Technical Approach**:
- OpenAI Embeddings (text-embedding-3-small or text-embedding-ada-002)
- PostgreSQL with pgvector extension
- Store embeddings for stories, documents, profiles
- Cosine similarity for relevance ranking

---

### 2. Thematic Analysis
**Goal**: Automatically identify and analyze themes across stories

**Features**:
- Automatic theme extraction from stories
- Theme clustering and categorization
- Theme evolution over time
- Cross-storyteller theme connections
- Visual theme maps/networks
- Theme-based story recommendations

**Technical Approach**:
- GPT-4 for theme extraction
- Clustering algorithms (K-means, DBSCAN)
- Topic modeling (LDA) as alternative/supplement
- Store themes in database with relationships

**Example Themes**:
- Housing & Infrastructure
- Cultural Heritage & Language
- Health & Wellbeing
- Community Leadership
- Environmental Challenges
- Family & Kinship
- Education & Youth

---

### 3. Quote Finder
**Goal**: Discover powerful quotes and key passages

**Features**:
- Search for quotes by topic or theme
- Automatic quote extraction from stories
- Quote categorization
- Most impactful quotes ranking
- Quote context viewer
- Shareable quote cards with attribution

**Technical Approach**:
- GPT-4 for quote extraction and analysis
- Sentiment analysis for impact scoring
- Entity extraction for proper attribution
- Store quotes with metadata

---

### 4. Research Assistant Chat
**Goal**: Conversational AI interface for researching the archive

**Features**:
- Ask questions about the archive
- Get summaries of multiple stories
- Compare storyteller perspectives
- Timeline generation
- Fact-checking and source verification
- Export research notes/summaries
- Cite sources with story links

**Technical Approach**:
- RAG (Retrieval Augmented Generation)
- GPT-4 for conversation and synthesis
- Vector search for context retrieval
- Chat history storage
- Streaming responses

**Example Queries**:
- "What do elders say about traditional fishing practices?"
- "Summarize all stories about Cyclone 2019"
- "How has housing changed over time according to the stories?"
- "What connections exist between health and housing themes?"

---

## Database Schema

```sql
-- ============================================================================
-- AI Features Database Schema
-- ============================================================================

-- Story embeddings for semantic search
CREATE TABLE IF NOT EXISTS story_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  embedding vector(1536), -- OpenAI embedding dimension
  model_version TEXT DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_story_embeddings_vector
ON story_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_story_embeddings_story ON story_embeddings(story_id);

-- Document embeddings for semantic search
CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  embedding vector(1536),
  model_version TEXT DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector
ON document_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_document ON document_embeddings(document_id);

-- Themes extracted from stories
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_theme_id UUID REFERENCES themes(id), -- For hierarchical themes
  color TEXT, -- For visualization
  icon TEXT, -- Icon name for UI
  embedding vector(1536), -- Semantic representation
  story_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_themes_parent ON themes(parent_theme_id);
CREATE INDEX IF NOT EXISTS idx_themes_embedding
ON themes USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 20);

-- Story-theme relationships
CREATE TABLE IF NOT EXISTS story_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  confidence REAL DEFAULT 0.0, -- 0.0 to 1.0, AI confidence score
  relevance_score REAL DEFAULT 0.0, -- How central is this theme to the story
  extracted_by TEXT, -- 'ai' or 'manual'
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_story_theme UNIQUE(story_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_story_themes_story ON story_themes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_themes_theme ON story_themes(theme_id);
CREATE INDEX IF NOT EXISTS idx_story_themes_confidence ON story_themes(confidence DESC);

-- Extracted quotes from stories
CREATE TABLE IF NOT EXISTS story_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  context_before TEXT, -- Text before the quote for context
  context_after TEXT, -- Text after the quote for context
  position_in_story INTEGER, -- Character position in original story
  themes TEXT[], -- Associated themes
  sentiment REAL, -- -1.0 (negative) to 1.0 (positive)
  impact_score REAL, -- How impactful/memorable (0.0 to 1.0)
  embedding vector(1536), -- For semantic search
  extracted_by TEXT DEFAULT 'ai',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_story_quotes_story ON story_quotes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_quotes_impact ON story_quotes(impact_score DESC);
CREATE INDEX IF NOT EXISTS idx_story_quotes_embedding
ON story_quotes USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);
CREATE INDEX IF NOT EXISTS idx_story_quotes_themes ON story_quotes USING GIN(themes);

-- Research assistant chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON chat_sessions(updated_at DESC);

-- Chat messages with context
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Context used for RAG
  context_stories UUID[], -- Story IDs used as context
  context_documents UUID[], -- Document IDs used as context
  context_quotes UUID[], -- Quote IDs referenced

  -- Metadata
  model_used TEXT, -- e.g., 'gpt-4'
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- Search history for users
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('semantic', 'keyword', 'theme', 'quote')),
  results_count INTEGER,
  clicked_results UUID[], -- IDs of stories/docs clicked
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);

-- Saved searches (bookmarks)
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT,
  filters JSONB, -- Store filter parameters
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to find similar stories using vector similarity
CREATE OR REPLACE FUNCTION find_similar_stories(
  query_embedding vector(1536),
  match_threshold REAL DEFAULT 0.7,
  match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  story_id UUID,
  title TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    1 - (se.embedding <=> query_embedding) AS similarity
  FROM story_embeddings se
  JOIN stories s ON s.id = se.story_id
  WHERE 1 - (se.embedding <=> query_embedding) > match_threshold
    AND s.is_published = true
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get theme statistics
CREATE OR REPLACE FUNCTION get_theme_stats(p_theme_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'story_count', COUNT(DISTINCT st.story_id),
    'avg_confidence', AVG(st.confidence),
    'top_storytellers', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT p.full_name, COUNT(*) as story_count
        FROM story_themes st2
        JOIN stories s ON s.id = st2.story_id
        JOIN profiles p ON p.id = s.storyteller_id
        WHERE st2.theme_id = p_theme_id
        GROUP BY p.id, p.full_name
        ORDER BY story_count DESC
        LIMIT 5
      ) t
    )
  )
  INTO result
  FROM story_themes st
  WHERE st.theme_id = p_theme_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update theme story counts
CREATE OR REPLACE FUNCTION update_theme_story_counts()
RETURNS VOID AS $$
BEGIN
  UPDATE themes t
  SET story_count = (
    SELECT COUNT(*)
    FROM story_themes st
    WHERE st.theme_id = t.id
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update theme counts
CREATE OR REPLACE FUNCTION trigger_update_theme_count()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_theme_story_counts();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_theme_counts_trigger
AFTER INSERT OR DELETE ON story_themes
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_update_theme_count();
```

---

## API Architecture

### API Routes Needed:

```
/api/ai/
├── embeddings/
│   ├── generate-story      # Generate embedding for a story
│   ├── generate-document   # Generate embedding for a document
│   └── batch-generate      # Batch generate embeddings
├── search/
│   ├── semantic           # Semantic search across stories/docs
│   ├── similar            # Find similar content
│   └── hybrid             # Combine semantic + keyword search
├── themes/
│   ├── extract            # Extract themes from a story
│   ├── analyze            # Analyze themes across stories
│   └── connections        # Find theme connections
├── quotes/
│   ├── extract            # Extract quotes from a story
│   ├── search             # Search quotes by theme/topic
│   └── featured           # Get featured/impactful quotes
└── chat/
    ├── create-session     # Start new chat session
    ├── send-message       # Send message to assistant
    └── get-history        # Get chat history
```

---

## Component Structure

```
components/
├── ai/
│   ├── SemanticSearch.tsx           # Semantic search interface
│   ├── SearchResults.tsx            # Display search results
│   ├── ThemeExplorer.tsx            # Browse and explore themes
│   ├── ThemeNetwork.tsx             # Visual theme network
│   ├── ThemeCard.tsx                # Individual theme display
│   ├── QuoteFinder.tsx              # Quote search interface
│   ├── QuoteCard.tsx                # Quote display card
│   ├── ResearchAssistant.tsx        # Chat interface
│   ├── ChatMessage.tsx              # Individual message
│   ├── ChatSuggestions.tsx          # Suggested queries
│   └── ContextViewer.tsx            # View sources used in chat
```

---

## Pages to Create

### New Pages:

1. **`/research`** - Main research hub
2. **`/research/semantic-search`** - Advanced semantic search
3. **`/research/themes`** - Theme explorer
4. **`/research/quotes`** - Quote finder
5. **`/research/assistant`** - AI research assistant chat
6. **`/research/assistant/[sessionId]`** - Individual chat session

---

## Implementation Steps

### Phase 1: Foundation (2-3 hours)

1. **Set up OpenAI Integration**
   - [ ] Install OpenAI SDK
   - [ ] Create API route handlers
   - [ ] Set up environment variables
   - [ ] Test API connection

2. **Database Setup**
   - [ ] Install pgvector extension in Supabase
   - [ ] Run AI features migration
   - [ ] Create indexes
   - [ ] Test vector operations

3. **Embeddings Pipeline**
   - [ ] Create embedding generation function
   - [ ] Build batch processing for existing stories
   - [ ] Add embedding generation on new story creation
   - [ ] Test embedding storage and retrieval

### Phase 2: Semantic Search (3-4 hours)

1. **Backend**
   - [ ] Create semantic search API endpoint
   - [ ] Implement vector similarity search
   - [ ] Add relevance ranking
   - [ ] Test with various queries

2. **Frontend**
   - [ ] Build SemanticSearch component
   - [ ] Create search results display
   - [ ] Add filters and sorting
   - [ ] Implement search history

### Phase 3: Theme Analysis (3-4 hours)

1. **Theme Extraction**
   - [ ] Create theme extraction API with GPT-4
   - [ ] Build batch theme extraction for existing stories
   - [ ] Store themes and relationships
   - [ ] Calculate theme embeddings

2. **Theme Explorer**
   - [ ] Build ThemeExplorer component
   - [ ] Create theme cards with statistics
   - [ ] Add theme network visualization
   - [ ] Implement theme-based filtering

### Phase 4: Quote Finder (2-3 hours)

1. **Quote Extraction**
   - [ ] Create quote extraction API
   - [ ] Batch extract quotes from stories
   - [ ] Calculate impact scores
   - [ ] Store quotes with context

2. **Quote Interface**
   - [ ] Build QuoteFinder component
   - [ ] Create quote cards
   - [ ] Add quote search and filtering
   - [ ] Implement shareable quote cards

### Phase 5: Research Assistant (4-5 hours)

1. **RAG Implementation**
   - [ ] Build context retrieval system
   - [ ] Create chat API with streaming
   - [ ] Implement conversation memory
   - [ ] Add source citation

2. **Chat Interface**
   - [ ] Build ResearchAssistant component
   - [ ] Create chat message display
   - [ ] Add streaming response handling
   - [ ] Implement context viewer
   - [ ] Add suggested queries

### Phase 6: Integration & Polish (2-3 hours)

- [ ] Create research hub page
- [ ] Add AI features to navigation
- [ ] Integrate with existing pages
- [ ] Add loading states and error handling
- [ ] Test all features end-to-end
- [ ] Optimize performance
- [ ] Deploy

**Total Estimated Time: 16-22 hours**

---

## Environment Variables Needed

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Feature Flags
ENABLE_SEMANTIC_SEARCH=true
ENABLE_THEME_ANALYSIS=true
ENABLE_QUOTE_FINDER=true
ENABLE_RESEARCH_ASSISTANT=true

# Rate Limiting
AI_REQUESTS_PER_HOUR=100
```

---

## Cost Considerations

### OpenAI Pricing (as of 2024):
- **GPT-4 Turbo**: $0.01/1K input tokens, $0.03/1K output tokens
- **text-embedding-3-small**: $0.00002/1K tokens

### Estimated Costs:
- **Initial embedding generation** (1000 stories @ 500 tokens each): ~$0.01
- **Theme extraction** (1000 stories): ~$10-20
- **Quote extraction** (1000 stories): ~$10-20
- **Chat conversations** (100 queries/day): ~$5-10/day

### Cost Optimization:
- Cache embeddings (don't regenerate)
- Batch processing when possible
- Use smaller models for simple tasks
- Implement rate limiting
- Monitor usage with OpenAI dashboard

---

## Success Criteria

- [ ] Users can search stories using natural language
- [ ] Semantic search returns relevant results
- [ ] Themes are automatically extracted and accurate
- [ ] Theme explorer shows connections and statistics
- [ ] Quotes are extracted with proper attribution
- [ ] Quote finder returns relevant quotes
- [ ] Research assistant provides helpful answers
- [ ] Chat assistant cites sources correctly
- [ ] All features work on mobile
- [ ] Response times < 3 seconds
- [ ] Cost per query < $0.10

---

## Future Enhancements

- Multi-language support (Manbarra language)
- Voice input for search
- Audio transcription and analysis
- Video analysis and indexing
- Automatic story summarization
- Trend analysis over time
- Collaboration features (shared research)
- Export research reports as PDFs
- Integration with external archives
- Custom AI models fine-tuned on Palm Island content

---

Ready to start implementation!
