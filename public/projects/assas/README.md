# assas — Modular SIEM / SOC Platform

![School](https://img.shields.io/badge/School-42-000000?style=flat)
![Backend](https://img.shields.io/badge/Backend-NestJS%2011-E0234E?style=flat&logo=nestjs&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-000000?style=flat&logo=nextdotjs&logoColor=white)
![Agent](https://img.shields.io/badge/Agent-Go-00ADD8?style=flat&logo=go&logoColor=white)
![Status](https://img.shields.io/badge/Status-In%20Progress-yellow?style=flat)

**assas** is my **ft_transcendence** project: a modular security operations center (SOC) platform — in essence, a small SIEM built from scratch. Lightweight **Go agents** run on monitored hosts, collect and classify logs with **Vector**, and stream structured events in real time over **Socket.IO** to a **NestJS** backend. Events are persisted in **PostgreSQL**, evaluated against **Sigma** detection rules by an **rsigma** sidecar, and explored on a real-time **Next.js** dashboard.

---

## Overview

The platform is designed as five buildable parts, each owning a slice of the data model:

1. **Auth & Core** — admin-provisioned accounts, RBAC, teams, immutable audit logs, WAF middleware, Redis rate limiting.
2. **Event Stream & Device Management** — agent registration, token authentication, event ingestion, real-time broadcast, heartbeat monitoring. *(implemented)*
3. **Alert Engine & Incident Management** — 5-stage alert lifecycle, correlation rules, 6-stage ticket kanban, war rooms.
4. **Threat Intelligence & Chat** — IoC database, feed ingestion (MISP / OTX / STIX-TAXII), real-time team chat and war rooms.
5. **Dashboards, Reports & Agent** — widget-based dashboards, scheduled PDF/CSV reports, file handling, monitoring stack.

Part 2 (the event pipeline) is the foundation that is running today; the remaining parts build on top of it.

---

## Features

### Working today
- **Agent lifecycle management** — agents authenticate once over REST (`POST /api/agent/auth`), then upgrade to a persistent Socket.IO connection guarded by a `token` + `agentID` handshake.
- **Remote agent control** — start / stop / restart the Vector pipeline on any host from the backend (`vstart`, `vstop`, `vrestart`, `astop` commands pushed into per-agent rooms).
- **Log collection pipelines** — Vector sources for **docker container logs**, **nginx access/error logs** and **unix logs**, parsed and normalized with VRL into a single event shape.
- **Event ingestion** — events stream in over the gateway, are stored in PostgreSQL **and** enqueued to BullMQ in parallel for detection evaluation.
- **Sigma-based detection** — an rsigma sidecar evaluates every event against 23 web-attack rules (SQLi, XSS, LFI/RFI, path traversal, webshells, JNDI, suspicious user-agents, CVE-2013-4547, CVE-2017-7529…) through an nginx field-mapping pipeline.
- **Operational event dashboard** — server-rendered Next.js 16 page with **URL-driven, shareable filters** (time range, agent, service, category, type, success, free text), infinite scroll, a slide-out detail panel with JSON tree + raw log, and a deterministic demo dataset when the API is unreachable.
- **Platform conventions** — global response envelope (interceptor + exception filter with Prisma error mapping), Swagger UI at `/api`, argon2 token hashing, Docker Compose for the full stack.

### In progress / planned
- Cursor pagination hardening, real-time push of events to the dashboard.
- Alert ingestion from rsigma rule matches (Part 3), then incidents, threat intel, chat and dashboards (Parts 3–5).

---

## Architecture

### System overview

```mermaid
flowchart LR
  subgraph HOSTS["Monitored hosts"]
    direction TB
    subgraph HA["Host A"]
      LA["nginx · docker · unix logs"] --> VECA["Vector"]
      VECA -->|"unix socket"| AVA["agentv (Go)"]
    end
    subgraph HB["Host B"]
      LB["nginx · docker · unix logs"] --> VECB["Vector"]
      VECB -->|"unix socket"| AVB["agentv (Go)"]
    end
  end

  subgraph SRV["assas platform"]
    GW["Socket.IO gateway<br/>namespace /agents"]
    SVC["Event service"]
    QUEUE[["BullMQ queue 'event'"]]
    WRK["Event worker"]
    API["REST API<br/>GET /api/events"]
    PG[("PostgreSQL")]
    RD[("Redis")]
    SIG["rsigma sidecar<br/>Sigma rules engine"]
  end

  AVA -->|"REST auth, then Socket.IO stream"| GW
  AVB -->|"REST auth, then Socket.IO stream"| GW
  GW --> SVC
  SVC --> QUEUE --> WRK -->|"POST /api/v1/events"| SIG
  SVC --> PG
  QUEUE -.-> RD
  API --> PG
  FE["Next.js dashboard"] -->|"URL-driven queries"| API
```

### End-to-end event pipeline

Every log line travels the same path: parse on the host, stream to the platform, store **and** evaluate in parallel.

```mermaid
sequenceDiagram
  autonumber
  participant V as Vector (host)
  participant A as agentv (host)
  participant G as Gateway /agents
  participant E as Event service
  participant Q as BullMQ (Redis)
  participant W as Event worker
  participant R as rsigma
  participant D as PostgreSQL

  V->>A: parsed logs as JSON lines (unix socket)
  A->>G: emit "agent:data"
  G->>E: processEvent(rawEvent, agentId)
  E->>D: prisma.event.create
  E->>Q: enqueue "process-event"
  Q->>W: dispatch (concurrency 100, max 500 jobs/s)
  W->>R: POST /api/v1/events
  R->>R: match Sigma rules (nginx pipeline)
  Note over R,D: turning rule matches into alerts is Part 3
```

### Agent (agentv) lifecycle

The agent boot sequence — from config file to a running Vector pipeline:

```mermaid
flowchart TD
  START(["agentv start"]) --> CFG["Load YAML config<br/>-config flag (default /etc/agentv/agentv.yml)"]
  CFG --> TOK["Read AGENT_TOKEN from env<br/>(never from the yaml file)"]
  TOK --> VAL{"config valid?"}
  VAL -- "no" --> EXIT(["exit non-zero"])
  VAL -- "yes" --> DISC["Discover system info<br/>hostname · platform · arch"]
  DISC --> AUTH["POST /api/agent/auth<br/>retry with backoff 2s → 60s"]
  AUTH --> WS["Connect Socket.IO /agents<br/>handshake: token + agentID"]
  WS --> SOCK["Open unix socket server<br/>/tmp/agentv/agentv.sock"]
  SOCK --> VVAL["vector validate"]
  VVAL --> RUN["Spawn Vector process"]
  RUN --> PIPE["Forward events:<br/>socket → emit agent:data"]
  RUN --> HB["Emit agent:heartbeat every 30s"]
  RUN --> CTRL["Listen for remote commands<br/>vector:start · stop · restart · agent:stop"]
```

### Heartbeat & offline detection

Agents prove liveness every 30 seconds; the gateway keeps the freshest state in cache and only writes through to the database when the status actually changes. A watchdog job (designed on the project board) marks silent agents as stopped.

```mermaid
flowchart TD
  HB["agentv: agent:heartbeat every 30s"] --> TS["Gateway: update last-seen in cache"]
  TS --> SUB{"subagent status changed?"}
  SUB -- "yes" --> DBW["Write through to PostgreSQL"]
  SUB -- "no" --> SKIP(["cache only"])
  DISC(["socket disconnected"]) --> STOP1["agent + subagent → stopped<br/>(cache + DB)"]
  WD["Watchdog: runs every 30s"] --> CHK{"now − last_seen > 60s?"}
  CHK -- "no" --> OK(["agent stays active"])
  CHK -- "yes" --> STOP2["Mark agent as stopped"] --> DBW2["Update cache + DB"]
```

### Data model

The schema is intentionally small right now — one row per agent, one row per event, indexed for the dashboard's query patterns:

```mermaid
erDiagram
  AGENT ||--o{ EVENT : reports
  AGENT {
    int id PK
    string name UK
    string token UK
    string agentStatus
    string subagentStatus
    string hostname
    string platform
    string architecture
  }
  EVENT {
    int id PK
    int agentId FK
    datetime timestamp
    string service
    string sourceType
    string stream
    string type
    string category
    bool success
    string clientIp
    string hostIp
    string message
    string rawEvent
    json metadata
  }
```

---

## Repository layout

| Path | Stack | Role |
| :--- | :--- | :--- |
| `backend/` | NestJS 11 · Prisma 7 · Socket.IO · BullMQ | REST API + `/agents` gateway, event ingestion, detection worker |
| `frontend/` | Next.js 16 · React 19 · Tailwind v4 | `/events` operational dashboard ("Atlas Night" design system) |
| `agentv/` | Go 1.26 · Vector | Host agent: auth, socket bridge, Vector process manager |
| `rsigma/` | Sigma rules + pipelines | Detection content mounted into the rsigma sidecar |
| `docker-compose.yml` | — | Postgres 17 · Redis 7 · backend · nginx (log fixture) · rsigma |

## Build & Run

### Prerequisites
- Docker & Docker Compose
- Node.js (backend + frontend), Go 1.26+ (agent)
- [Vector](https://vector.dev) installed on hosts running the agent

### 1. Infrastructure
```bash
docker compose up postgres redis   # or the full stack: docker compose up
```

### 2. Backend
```bash
cd backend
npm install
npx prisma migrate dev      # schema → PostgreSQL
npx prisma db seed          # seeds agent-batista (token "hello") & agent-sphynx ("world")
npm run start:dev           # http://localhost:4567 — Swagger at /api
```

### 3. Agent (on each monitored host)
```bash
cd agentv
AGENT_TOKEN=hello go run cmd/agentv/main.go -config agentv-1.dev.yaml
```

### 4. Frontend
```bash
cd frontend
npm install && npm run dev  # http://localhost:3000 → /events
```

### Ports
| Port | Service |
| :--- | :--- |
| `4567` | Backend REST + Socket.IO `/agents` |
| `3000` | Frontend dashboard |
| `5432` | PostgreSQL |
| `6379` | Redis (BullMQ) |
| `8080` | nginx log fixture |
| `9090` | rsigma HTTP input / API |

---

## Branching & workflow

`main` and `dev` are protected (PR + squash merge, CI must pass); work happens on `feat/*`, `fix/*`, `chore/*` branches with conventional commits.

| Branch | Contents |
| :--- | :--- |
| `main` | Initial NestJS scaffold |
| `dev` | Integration branch: agent backend, gateway, BullMQ, event module |
| `feat/agent` | Agent CRUD/auth + nginx event pipelines |
| `feat/event` | Event table rework, rsigma connection, worker logs |
| `feat/event-frontend` | Events dashboard, `GET /api/events` implementation *(current)* |

## Roadmap

```mermaid
flowchart LR
  P1["Part 1<br/>Auth & Core<br/>RBAC · teams · audit"]:::planned
  P2["Part 2<br/>Event stream & devices<br/>agents · ingestion · rsigma"]:::done
  P3["Part 3<br/>Alerts & incidents<br/>lifecycle · kanban · war rooms"]:::planned
  P4["Part 4<br/>Threat intel & chat<br/>IoC · feeds · messaging"]:::planned
  P5["Part 5<br/>Dashboards & reports<br/>widgets · files · PDF/CSV"]:::planned
  P1 --> P3
  P2 --> P3
  P4 --> P3
  P3 --> P5
  P4 --> P5
  classDef done fill:#1a7f37,stroke:#2ea043,color:#ffffff;
  classDef planned fill:#1c2333,stroke:#30363d,color:#8b949e;
```

The dependency order comes from the foreign keys between tables: alerts need agents, events, users and chat rooms; reports need alerts; files need reports and messages.

---

## What I Learned

- Designing an **agent protocol**: one-shot REST bootstrap → authenticated WebSocket upgrade → local IPC over a unix socket, with heartbeats and remote control.
- **Process supervision in Go**: spawning, monitoring and gracefully stopping Vector (SIGINT → Kill escalation), ordered shutdown on SIGINT/SIGTERM.
- **Real-time backend patterns** with Socket.IO namespaces: handshake middleware auth, per-agent rooms, cache write-through status tracking.
- **High-throughput ingestion** with BullMQ: decoupling storage from detection via a queue with concurrency limits, rate limiting and retries.
- **Detection engineering**: Sigma rules, field-mapping pipelines, and running rsigma as a hardened, read-only sidecar.
- **Log pipeline design** with Vector/VRL: parsing nginx combined/error formats into one normalized, classified event shape.
- **Prisma 7** specifics: the `prisma-client` generator, mandatory driver adapters, seed wiring through `prisma.config.ts`.
- **URL-driven UI state** in Next.js server components: every filter is a shareable query param, with a deterministic in-memory fallback dataset.
- Building a **dark design system** ("Atlas Night") with Tailwind v4 tokens, and enforcing accessibility (severity = icon + label, never color alone).

---

## Author

- [Zakaria Jaddad](https://github.com/zakaria-jaddad)
