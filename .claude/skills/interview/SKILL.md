# /interview — Agent Interview Skill

## Usage
- `/interview cmo` — Start a free-form CMO interview
- `/interview cmo quarterly` — Start a Quarterly Marketing Review
- `/interview cmo capture` — Quick Content Capture
- `/interview cmo media` — Media Captioning Session

## How It Works

This skill runs an interactive interview loop with a PICC role agent:

1. **Check knowledge gaps** — Query `/api/agents/{role}/knowledge?gaps=true` to see what the agent needs to learn
2. **Create a session** — POST to `/api/agents/{role}/sessions` with the chosen template
3. **Interview loop** — The agent asks questions one at a time. After each user answer, POST to `/api/agents/{role}/chat` with the message and sessionId
4. **Knowledge extraction** — The agent automatically extracts facts and stores them in the knowledge base
5. **Action items** — The agent surfaces tasks during the interview
6. **Summary** — When the interview is complete, display a summary of knowledge captured and action items created

## Interview Flow

```
Claude: "Starting CMO Quarterly Review. Let me check what knowledge gaps exist..."
[Fetch gaps from API]
Claude: "I see gaps in: campaigns, partnerships. Let's focus there."
Claude: [Asks first question from template]
User: [Answers]
Claude: [Acknowledges, extracts knowledge, asks next question]
...
Claude: "Interview complete. Here's what I captured:
  - 5 new facts stored
  - 3 action items created
  - Gaps filled: campaigns, partnerships"
```

## Templates

| Template ID | Short Name | Description |
|------------|------------|-------------|
| `quarterly-review` | `quarterly` | 6-question marketing review |
| `quick-capture` | `capture` | 4-question content capture |
| `media-captioning` | `media` | Photo/media captioning session |

## API Endpoints Used

All endpoints use dynamic `[role]` parameter — same routes serve all agents:

- `GET /api/agents/{role}/knowledge?gaps=true` — Knowledge + gaps
- `POST /api/agents/{role}/sessions` — Create session
- `POST /api/agents/{role}/chat` — Send message, get response
- `GET /api/agents/{role}/actions` — List action items

## Adding New Agents

When a new agent is added (e.g., CEO), this skill works automatically:
- `/interview ceo` — just change the role parameter
