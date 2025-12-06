# Content Studio AI Setup Guide

The Content Studio supports **two AI providers**:
1. **Ollama (Local)** - Free, runs on your machine, great for testing
2. **Anthropic Claude (Cloud)** - Paid API, better quality, use for production

## Current Setup: Ollama (Local Testing)

Your system is configured to use **Ollama** by default for cost-free testing.

### Step 1: Make sure Ollama is running

Check if Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

If you get an error, start Ollama:
```bash
# On macOS/Linux
ollama serve

# Or if you have it as a system service
systemctl start ollama
```

### Step 2: Check which models you have

```bash
ollama list
```

### Step 3: Recommended models for Content Studio

For best results with PICC brand voice, use one of these models:

**Best for writing (recommended):**
```bash
# Llama 3.1 8B (good balance of speed and quality)
ollama pull llama3.1:8b

# Or Llama 3.3 70B (much better quality, slower, needs more RAM)
ollama pull llama3.3:70b
```

**Alternative options:**
```bash
# Mistral (good for creative writing)
ollama pull mistral:7b

# Qwen2.5 (excellent for nuanced writing)
ollama pull qwen2.5:14b
```

### Step 4: Configure your .env.local file

Copy the example file if you haven't already:
```bash
cd /home/user/palm-island-repository/web-platform
cp .env.local.example .env.local
```

Edit `.env.local` and set:
```bash
# Use Ollama for local testing
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b  # or whichever model you prefer

# Keep your Anthropic key for later (when you go to production)
ANTHROPIC_API_KEY=your_key_here
```

### Step 5: Test the Content Studio

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/picc/content-studio

3. You should see "Ollama (Local)" badge in the header

4. Select a story and click "Generate with AI" on any platform

5. The AI will generate content using your local Ollama model - completely free!

## Switching to Anthropic Claude (Production)

When you're ready to use the cloud-based Claude API for better quality:

### Step 1: Update .env.local

Change the provider:
```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

### Step 2: Restart your server

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 3: Verify

You should now see "Claude Sonnet 4.5 (Cloud)" in the Content Studio header.

## Cost Comparison

### Ollama (Current Setup)
- **Cost:** $0 (completely free)
- **Speed:** Fast (runs locally)
- **Quality:** Good (depends on model)
- **Privacy:** 100% (never leaves your machine)
- **Limitation:** Needs Ollama running locally

### Anthropic Claude Sonnet 4.5
- **Cost:** ~$3 per million input tokens, ~$15 per million output tokens
- **Example:** Generating 100 social posts ≈ $0.50-$1.00
- **Speed:** Fast (cloud API)
- **Quality:** Excellent (best-in-class)
- **Privacy:** Data sent to Anthropic (GDPR compliant)
- **Limitation:** Costs money, requires internet

## Recommended Workflow

1. **Development/Testing:** Use Ollama (free, local)
   - Refine your prompts
   - Test different story types
   - Experiment with different platforms

2. **Production/Live:** Switch to Anthropic Claude
   - When you're ready to generate final content
   - When you need highest quality
   - When stories will be published publicly

## Troubleshooting

### "Failed to generate content" with Ollama

**Check if Ollama is running:**
```bash
curl http://localhost:11434/api/tags
```

**Check if your model is available:**
```bash
ollama list
```

**Pull the model if missing:**
```bash
ollama pull llama3.1:8b
```

**Check Ollama logs:**
```bash
journalctl -u ollama -f  # Linux
# or check Docker logs if running in container
```

### "Failed to generate content" with Anthropic

**Check your API key:**
```bash
# Test the key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-5","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}'
```

**Verify you have credits:**
- Go to: https://console.anthropic.com/settings/credits
- Check your usage and limits

## Model Recommendations by Use Case

### Best Overall (Your Current Setup)
- **Model:** `llama3.1:8b`
- **RAM needed:** ~8GB
- **Speed:** Fast
- **Quality:** Very good

### Best Quality (Slower, needs more RAM)
- **Model:** `llama3.3:70b`
- **RAM needed:** ~40GB
- **Speed:** Slower
- **Quality:** Excellent (close to Claude)

### Best Speed (Lower quality)
- **Model:** `llama3.1:8b` or `mistral:7b`
- **RAM needed:** ~6-8GB
- **Speed:** Very fast
- **Quality:** Good enough for drafts

## Next Steps

1. **Test Ollama first** - Make sure it's working
2. **Try different models** - See which gives best PICC voice
3. **Generate 10-20 posts** - Test quality
4. **Switch to Claude** - Only when you need production quality

---

**Current Status:** ✅ Configured for Ollama (free local testing)

To switch to production mode, just change `LLM_PROVIDER=anthropic` in `.env.local` and restart your server.
