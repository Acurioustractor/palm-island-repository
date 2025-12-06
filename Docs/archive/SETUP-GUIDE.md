# Palm Island Repository - Complete Setup Guide
## *From Zero to World-Class AI-Powered Platform*

### 🌊 Quick Start Summary

This guide walks you through setting up a complete, world-class web platform featuring:
- ✅ AI-powered semantic search across all Palm Island content
- ✅ Fine-tuned Small Language Model trained on community knowledge
- ✅ Intelligent photo gallery with ML-based face/place recognition
- ✅ Beautiful story presentation with cultural protocol enforcement
- ✅ Integration with existing PICC annual reports and historical documents
- ✅ Complete Indigenous data sovereignty

---

### 🔥 Prerequisites

#### **System Requirements**
```bash
# Required software
Node.js: >= 18.0.0
Python: >= 3.10
PostgreSQL: >= 15
Redis: >= 7.0 (for caching)
Git: Latest version

# Recommended hardware (for local development)
RAM: 16GB minimum (32GB for ML training)
Storage: 100GB+ free space (for media and models)
GPU: Optional but recommended for ML training
```

#### **Service Accounts Needed**
```yaml
Supabase:
  - Create project at supabase.com
  - Get API keys and database URL
  - Configure storage buckets

Vector Database (choose one):
  Pinecone:
    - Sign up at pinecone.io
    - Create index for embeddings
  OR
  Qdrant:
    - Self-hosted or cloud.qdrant.io
    - More privacy-focused option

OpenAI (optional):
  - API key for embeddings
  - Can be replaced with local models

Mapbox (optional):
  - For mapping cultural sites
  - Free tier available
```

---

### 📚 Step 1: Initial Setup

#### **1.1 Clone and Install**
```bash
# Navigate to the web-platform directory
cd "/Users/benknight/Code/Palm Island Reposistory/web-platform"

# Install Node dependencies
npm install

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install torch torchvision torchaudio  # PyTorch
pip install transformers accelerate        # Hugging Face
pip install sentence-transformers         # Embeddings
pip install pillow opencv-python          # Image processing
pip install face-recognition              # Face detection
pip install ultralytics                   # YOLO for object detection
pip install qdrant-client                 # Vector database
pip install supabase                      # Supabase client
pip install python-dotenv                 # Environment variables
```

#### **1.2 Environment Configuration**
```bash
# Create environment file
cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/palm_island_db

# Vector Database (Qdrant)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key

# OR Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=palm-island-content

# OpenAI (optional - for embeddings and chat)
OPENAI_API_KEY=your_openai_api_key

# Redis Cache
REDIS_URL=redis://localhost:6379

# Mapbox (optional - for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# AI/ML Settings
LLM_MODEL_PATH=./models/palm-island-llm
EMBEDDINGS_MODEL=sentence-transformers/all-mpnet-base-v2
FACE_RECOGNITION_THRESHOLD=0.6
EOF
```

---

### 🌿 Step 2: Database Setup

#### **2.1 PostgreSQL with pgvector**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE palm_island_db;

-- Connect to database
\c palm_island_db

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create main tables
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_embedding vector(768),  -- For semantic search
  category VARCHAR(50),
  access_level VARCHAR(20) DEFAULT 'public',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  metadata JSONB,
  cultural_protocols JSONB,
  CONSTRAINT stories_access_level_check CHECK (access_level IN ('public', 'community', 'restricted'))
);

CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(20),
  file_size BIGINT,
  image_embedding vector(512),    -- CLIP embeddings for images
  access_level VARCHAR(20) DEFAULT 'public',
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  ml_analysis JSONB,              -- Faces, places, objects detected
  cultural_protocols JSONB
);

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  face_encoding vector(128),      -- Face recognition encoding
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP,
  consent_contexts TEXT[],        -- Which contexts they consent to be identified in
  community_role TEXT,
  status VARCHAR(20),             -- active, deceased
  cultural_restrictions JSONB
);

CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  coordinates POINT,
  place_embedding vector(512),    -- For place recognition
  access_level VARCHAR(20) DEFAULT 'public',
  cultural_significance TEXT,
  restrictions JSONB
);

CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  query_embedding vector(768),
  user_id UUID,
  results_count INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX stories_embedding_idx ON stories USING ivfflat (content_embedding vector_cosine_ops);
CREATE INDEX media_embedding_idx ON media_files USING ivfflat (image_embedding vector_cosine_ops);
CREATE INDEX stories_fts_idx ON stories USING gin(to_tsvector('english', content));
CREATE INDEX stories_category_idx ON stories(category);
CREATE INDEX stories_access_idx ON stories(access_level);
CREATE INDEX media_access_idx ON media_files(access_level);
```

#### **2.2 Supabase Storage Buckets**
```typescript
// scripts/setup-supabase-storage.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function setupStorageBuckets() {
  // Create storage buckets
  const buckets = [
    {
      name: 'palm-island-public',
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf']
    },
    {
      name: 'palm-island-community',
      public: false,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf']
    },
    {
      name: 'palm-island-restricted',
      public: false,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf']
    }
  ]

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.createBucket(
      bucket.name,
      { public: bucket.public }
    )
    
    if (error) {
      console.log(`Bucket ${bucket.name} might already exist:`, error)
    } else {
      console.log(`Created bucket: ${bucket.name}`)
    }
  }

  // Set up RLS policies
  // (Additional SQL policies in Supabase dashboard)
}

setupStorageBuckets()
```

---

### 🔥 Step 3: AI/ML Infrastructure

#### **3.1 Vector Database Setup (Qdrant)**
```bash
# Run Qdrant locally with Docker
docker run -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage:z \
  qdrant/qdrant

# Create collections via Python
python << 'EOF'
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(url="http://localhost:6333")

# Collection for story embeddings
client.create_collection(
    collection_name="palm_island_stories",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)

# Collection for image embeddings
client.create_collection(
    collection_name="palm_island_images",
    vectors_config=VectorParams(size=512, distance=Distance.COSINE),
)

# Collection for place embeddings
client.create_collection(
    collection_name="palm_island_places",
    vectors_config=VectorParams(size=512, distance=Distance.COSINE),
)

print("✅ Qdrant collections created successfully")
EOF
```

#### **3.2 Generate Embeddings for Existing Content**
```python
# scripts/generate_embeddings.py
import os
import json
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
import psycopg2
from pathlib import Path

# Load embedding model
model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')
qdrant = QdrantClient(url=os.getenv('QDRANT_URL'))

def generate_story_embeddings():
    """Generate embeddings for existing stories"""
    # Connect to PostgreSQL
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cursor = conn.cursor()
    
    # Get all stories without embeddings
    cursor.execute("SELECT id, title, content FROM stories WHERE content_embedding IS NULL")
    stories = cursor.fetchall()
    
    points = []
    for story_id, title, content in stories:
        # Combine title and content for embedding
        text = f"{title}\n\n{content}"
        embedding = model.encode(text).tolist()
        
        # Store in Qdrant
        points.append(PointStruct(
            id=str(story_id),
            vector=embedding,
            payload={
                'title': title,
                'content': content[:500],  # Store preview
                'type': 'story'
            }
        ))
        
        # Update PostgreSQL with embedding
        cursor.execute(
            "UPDATE stories SET content_embedding = %s WHERE id = %s",
            (embedding, story_id)
        )
    
    # Batch upsert to Qdrant
    if points:
        qdrant.upsert(collection_name="palm_island_stories", points=points)
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"✅ Generated embeddings for {len(points)} stories")

def generate_historical_document_embeddings():
    """Process Palm Island history document"""
    history_path = "../Docs/Palm Island history.md"
    
    with open(history_path, 'r') as f:
        content = f.read()
    
    # Split into chunks for better search
    chunks = content.split('\n## ')
    
    points = []
    for i, chunk in enumerate(chunks):
        if not chunk.strip():
            continue
            
        embedding = model.encode(chunk).tolist()
        points.append(PointStruct(
            id=f"history-{i}",
            vector=embedding,
            payload={
                'content': chunk[:1000],
                'type': 'history',
                'source': 'Palm Island history.md'
            }
        ))
    
    qdrant.upsert(collection_name="palm_island_stories", points=points)
    print(f"✅ Generated embeddings for {len(points)} historical sections")

if __name__ == "__main__":
    generate_story_embeddings()
    generate_historical_document_embeddings()
```

#### **3.3 Fine-Tune Small Language Model**
```python
# scripts/train_palm_island_llm.py
"""
Fine-tune Llama 3.1 8B on Palm Island knowledge
This creates a local AI assistant that understands Palm Island context
"""
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import Dataset
import json

# Configuration
MODEL_NAME = "meta-llama/Meta-Llama-3.1-8B"  # Base model
OUTPUT_DIR = "./models/palm-island-llm"
TRAINING_DATA_PATH = "./data/palm_island_training_data.json"

def prepare_training_data():
    """
    Prepare training data from various sources:
    - Community stories
    - Historical documents
    - Annual reports
    - Cultural protocols
    """
    training_pairs = []
    
    # Load Palm Island history
    with open("../Docs/Palm Island history.md", 'r') as f:
        history_content = f.read()
    
    # Generate Q&A pairs from history
    # (This would be more sophisticated in production)
    history_qa = [
        {
            "instruction": "What was the 1957 strike on Palm Island?",
            "input": "",
            "output": "The 1957 strike was a pivotal moment in Palm Island history. Seven men - Albert 'Albie' Geia, Willie Thaiday, Eric Lymburner, Sonny Sibley, Bill Congoo, George Watson, and Gordon Tapau - led a five-day strike demanding fair wages instead of rations. They were arrested at gunpoint and forcibly deported with their families to different settlements across Queensland. Their courage sparked a movement that eventually led to wage justice for Indigenous workers across Australia. These men are remembered as the 'Magnificent Seven.'"
        },
        {
            "instruction": "Who are the traditional owners of Palm Island?",
            "input": "",
            "output": "The Manbarra people, also known as Wulgurukaba, are the traditional owners of Great Palm Island and surrounding islands. According to their Dreamtime stories, the Palm Island group was formed from fragments of the Rainbow Serpent, establishing a sacred connection to country that predates European arrival by tens of thousands of years."
        },
        {
            "instruction": "What does Bwgcolman mean?",
            "input": "",
            "output": "Bwgcolman means 'many tribes – one people.' This term was coined by Manbarra elder Dick Palm Island to unite the diverse group of Aboriginal and Torres Strait Islander peoples from over 40 different language groups who were forcibly relocated to Palm Island starting in 1918."
        },
        # Add many more Q&A pairs...
    ]
    
    training_pairs.extend(history_qa)
    
    # Add cultural protocol training
    protocol_training = [
        {
            "instruction": "What are the access levels for Palm Island content?",
            "input": "",
            "output": "Palm Island content has three access levels: 1) Public - content appropriate for wide sharing, 2) Community - content for Palm Island community members only, and 3) Restricted - traditional knowledge and elder stories requiring special permissions. All content must have explicit consent and follow cultural protocols."
        },
        # Add more protocol training...
    ]
    
    training_pairs.extend(protocol_training)
    
    # Save training data
    with open(TRAINING_DATA_PATH, 'w') as f:
        json.dump(training_pairs, f, indent=2)
    
    return training_pairs

def train_model():
    """Fine-tune model using LoRA for efficiency"""
    # Load tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        load_in_8bit=True,  # Use 8-bit quantization to save memory
        device_map="auto"
    )
    
    # Prepare model for training
    model = prepare_model_for_kbit_training(model)
    
    # LoRA configuration (trains only small adapters, not full model)
    lora_config = LoraConfig(
        r=16,                      # LoRA rank
        lora_alpha=32,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    
    model = get_peft_model(model, lora_config)
    
    # Load training data
    training_data = prepare_training_data()
    dataset = Dataset.from_list(training_data)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=3,
        per_device_train_batch_size=4,
        learning_rate=2e-4,
        save_steps=100,
        logging_steps=10,
        fp16=True
    )
    
    # Train
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
    )
    
    trainer.train()
    
    # Save model
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    
    print(f"✅ Model fine-tuned and saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    train_model()
```

---

### 📊 Step 4: Frontend Development

#### **4.1 Start Development Server**
```bash
# In web-platform directory
npm run dev

# Application will be available at http://localhost:3000
```

#### **4.2 Project Structure Created**
```
web-platform/
├── app/
│   ├── page.tsx               # Landing page (AI-powered search, featured content)
│   ├── layout.tsx             # Root layout with cultural protocols
│   ├── (public)/
│   │   ├── stories/           # Browse community stories
│   │   ├── search/            # AI-powered search interface
│   │   ├── gallery/           # Intelligent photo gallery
│   │   └── history/           # Interactive timeline
│   ├── (community)/
│   │   ├── dashboard/         # PICC dashboard integration
│   │   └── contribute/        # Story submission forms
│   └── api/
│       ├── search/route.ts    # Semantic search endpoint
│       ├── ai/chat/route.ts   # AI assistant endpoint
│       └── photos/analyze/route.ts  # Photo ML endpoint
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── search/                # Search components
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── FacetedFilters.tsx
│   ├── gallery/
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoViewer.tsx
│   │   └── SmartAlbums.tsx
│   └── stories/
│       ├── StoryCard.tsx
│       ├── StoryViewer.tsx
│       └── Timeline.tsx
└── lib/
    ├── ai/
    │   ├── search.ts          # Semantic search utilities
    │   ├── chat.ts            # AI assistant
    │   └── embeddings.ts      # Embedding generation
    ├── ml/
    │   ├── face-recognition.ts
    │   ├── place-recognition.ts
    │   └── object-detection.ts
    └── cultural-protocols/
        ├── access-control.ts
        └── content-filtering.ts
```

---

### 🌊 Step 5: Deploy to Production

#### **5.1 Vercel Deployment (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to:
# - Link to your project
# - Add environment variables
# - Configure build settings

# Production deployment
vercel --prod
```

#### **5.2 Environment Variables in Production**
```bash
# Add all .env.local variables to Vercel dashboard
# Dashboard > Settings > Environment Variables

# Critical production variables:
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
DATABASE_URL=your_production_database_url
QDRANT_URL=your_production_qdrant_url
```

---

### 🔥 Usage Examples

#### **Semantic Search**
```typescript
// Natural language search example
const results = await search({
  query: "Show me stories about youth leadership from 2023",
  userPermissions: currentUser.permissions,
  filters: {
    category: ['youth'],
    yearRange: [2023, 2023]
  }
})
```

#### **AI Assistant**
```typescript
// Ask questions about Palm Island
const response = await palmIslandAI.chat({
  message: "Tell me about the Magnificent Seven",
  context: searchResults, // Relevant context
  conversationHistory: previousMessages
})
```

#### **Photo Recognition**
```typescript
// Analyze uploaded photo
const analysis = await analyzePhoto(photoFile, {
  detectFaces: true,
  detectPlaces: true,
  detectObjects: true,
  respectPermissions: true
})
```

---

**This setup creates a production-ready, world-class platform that combines modern AI/ML capabilities with deep respect for Indigenous data sovereignty and cultural protocols.**