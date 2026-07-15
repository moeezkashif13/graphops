# GraphOps

**An autonomous AI support agent with a human safety net — built on LangGraph, NestJS, and pgvector.**

GraphOps watches an inbound support queue, reads and understands each customer message, researches the answer from a real knowledge base, drafts a reply — and knows when to stop and ask a human before it hits send.

> 🖼️ *Architecture diagrams and product walkthrough GIFs go here.*
> `![Architecture Overview](docs/images/architecture-overview.png)`

---

## Why this project exists

Most "AI agent" demos are a single prompt wrapped in a chat box. GraphOps is different: it's a **stateful, resumable, multi-step workflow** that mirrors how a real support automation system would actually need to behave in production — including the part most demos skip, which is knowing when *not* to trust the AI.

I built this to explore a question I kept running into as a full-stack engineer: **how do you let an AI agent act autonomously without letting it act recklessly?** The answer here is a graph-based workflow with a built-in pause button, backed by a database, so the agent's "thinking" survives a server restart and a human can intervene at exactly the right moment.

---

## What it actually does

1. A support ticket comes in (via API or the built-in simulator).
2. The agent **classifies** it — what's it about, how urgent, how upset is the customer.
3. The agent **researches** it — running a real vector similarity search against a knowledge base stored in PostgreSQL, plus pulling live billing context when relevant.
4. The agent **drafts a reply** using everything it just gathered.
5. The workflow checks a condition: is this an angry or churn-risk customer?
   - **No** → the ticket resolves automatically.
   - **Yes** → the entire workflow **freezes mid-execution**, the draft is handed to a human reviewer, and the agent waits — indefinitely, even across a server restart — until someone approves, edits, or rejects it.
6. Once approved, the workflow **resumes exactly where it paused** and completes.

Every step streams to the frontend in real time over WebSockets, so you can watch the agent's reasoning unfold ticket by ticket.

---

## The part built specifically so anyone can understand it

Most internal tooling like this is written for engineers, by engineers, and it shows. GraphOps has a **"Plain English" mode** that translates every technical log line — `Condition Target Met: [requiresHumanReview = true] -> Graph Execution Interrupted` — into something like *"⚠️ This looks like a high-priority issue! The AI paused itself and is waiting for you to double-check its work."*

The idea: a hiring manager, recruiter, or non-technical stakeholder can open the app, flip one toggle, and actually follow what the AI is doing — no LangGraph knowledge required. Flip it back to **Technical** mode and you get the real orchestration trace.

There's also a live "Behind the Scenes" view with three interactive diagrams (infrastructure topology, the LangGraph state machine, and the human-in-the-loop sequence) so anyone can inspect how the system is wired without reading a line of code.

---

## Key engineering decisions worth knowing about

- **Durable, resumable agent state.** The workflow doesn't just "pause" in memory — it's checkpointed to PostgreSQL via LangGraph's Postgres checkpointer. If the server restarts while a ticket is sitting in human review, nothing is lost; the graph resumes from the exact same node.
- **Real retrieval, not a hardcoded fake.** The knowledge base uses `pgvector` inside Postgres to run genuine cosine-distance similarity search against embedded documents — not a keyword match dressed up as "AI."
- **A real interrupt, not a fake loading state.** The graph uses LangGraph's `interruptBefore` to structurally halt execution at a named node. The pause is a first-class part of the state machine, not a UI trick layered on top.
- **Live updates over polling.** Ticket status changes are pushed to the frontend via a Socket.IO gateway the moment they happen, and merged directly into the Redux Toolkit Query cache.
- **Type-safe state across the whole graph.** The agent's state schema is defined once (`AgentStateAnnotation`) with explicit reducers per field, so every node knows exactly how its output merges into the shared state.

---

## Tech stack

| Layer | Technology |
|---|---|
| Agent orchestration | LangGraph (`StateGraph`, conditional edges, `interruptBefore`, Postgres checkpointing) |
| LLM & embeddings | Google Gemini (`gemini-3.1-flash-lite` for generation, `gemini-embedding-2` for embeddings) |
| Backend | NestJS (TypeScript), TypeORM |
| Database | PostgreSQL + `pgvector` for semantic search |
| Realtime | Socket.IO (NestJS WebSocket Gateway) |
| Frontend | React, TypeScript, Redux Toolkit + RTK Query |
| Frontend visualization | React Flow (`@xyflow/react`) for live and static workflow diagrams |
| Styling | Tailwind CSS |

---

## Project structure

```
GraphOps/
├── backend/
│   └── src/
│       ├── agent/          # LangGraph workflow: nodes, state schema, checkpointing service
│       ├── knowledge/       # pgvector-backed RAG knowledge base
│       ├── tickets/         # REST API, WebSocket gateway, ticket persistence
│       └── main.ts
└── frontend/
    ├── components/          # Ticket queue, agent workspace, live graph visualizer,
    │                          simulator, "Behind the Scenes" architecture explorer
    └── src/
        ├── redux/           # RTK Query API slice + WebSocket cache sync
        └── utils/           # ELI5 log translator, diagram data
```

---

## How the agent workflow is wired

```
__start__ → classifier → researcher → composer → (conditional) → __end__
                                                        │
                                                        ▼
                                              requires human review?
                                                        │
                                              yes ──► human_review ──► __end__
```

> 🖼️ *Placeholder: LangGraph state diagram (exported from the in-app "Behind the Scenes" viewer)*
> `![State Graph](docs/images/state-graph.png)`

> 🖼️ *Placeholder: End-to-end infrastructure topology*
> `![Infrastructure Topology](docs/images/infra-topology.png)`

> 🖼️ *Placeholder: Human-in-the-loop pause/resume sequence*
> `![HITL Sequence](docs/images/hitl-sequence.png)`

---

## About the author

Built by **Abdul Moeez** — Full Stack Engineer with hands on experience in real-time systems, GPS tracking platforms, collaborative tooling, and AI/LLM integrations.

- Portfolio: [abdulmoeez.online](https://abdulmoeez.online)
- GraphOps Live: [graphops.abdulmoeez.online](https://graphops.abdulmoeez.online)
- LinkedIn: [linkedin.com/in/abdulmoeez19](https://linkedin.com/in/abdulmoeez19)