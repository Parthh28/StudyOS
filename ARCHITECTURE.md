# StudyOS Clean Architecture Specification

StudyOS is structured around **Clean Architecture (Onion Architecture / Domain-Driven Design)** adapted for modern **Next.js 15 (App Router + React Server Components + Server Actions)**.

---

## 1. Architectural Layers & Separation of Concerns

```
+--------------------------------------------------------------------+
|               PRESENTATION & INTERFACE LAYER                       |
|   app/(dashboard)/*   |   components/features/*   |   UI System    |
+--------------------------------------------------------------------+
                                 |
                                 v
+--------------------------------------------------------------------+
|             APPLICATION & USE CASE LAYER                           |
|   lib/actions/* (Server Actions)  |   lib/services/*               |
+--------------------------------------------------------------------+
                                 |
                                 v
+--------------------------------------------------------------------+
|                  DOMAIN & BUSINESS RULES LAYER                     |
|   types/domain.ts (Entities)   |   lib/domain/mastery-engine.ts    |
+--------------------------------------------------------------------+
                                 |
                                 v
+--------------------------------------------------------------------+
|              INFRASTRUCTURE & DATA ACCESS LAYER                    |
|   lib/supabase/server.ts   |   Supabase Postgres   |   AI Gemini   |
+--------------------------------------------------------------------+
```

---

## 2. Layer Responsibilities

### 1. Domain Layer (`types/` & `lib/domain/`)
- **Pure Domain Entities**: Defined in `types/domain.ts` (`SubjectEntity`, `TopicEntity`, `DiagnosticSummary`, `MasteryLevel`).
- **Domain Rules & Heuristics**: Pure functional engines like `lib/domain/mastery-engine.ts` (`MasteryEngine`).
- **Zero Dependencies**: Doesn't import Next.js, Supabase, or React. Easily testable with pure unit tests.

### 2. Application & Use Case Layer (`lib/actions/` & `lib/services/`)
- **Server Actions (`lib/actions/data.ts`, `ai-extractor.ts`, `chat.ts`)**: Server-side controllers that handle user intentions (e.g. `updateTopicMasteryLevel`, `extractSyllabusFromImage`).
- **Orchestration**: Validates input, interacts with repositories, applies Domain Engine rules, and triggers path revalidation (`revalidatePath`).

### 3. Infrastructure & Data Access Layer (`lib/supabase/`, `supabase/migrations/`)
- **Database Abstraction**: Isolated client factories (`createClient`) in `lib/supabase/server.ts` and `lib/supabase/client.ts`.
- **Schema & Migrations**: SQL DDL stored deterministically under `supabase/migrations/`.

### 4. Presentation & Interface Layer (`app/` & `components/`)
- **Route Handlers (`app/(dashboard)/...`)**: Async Server Components that fetch domain data and pass props down to Client UI components.
- **Loading & Error Boundaries**: Modular Next.js `loading.tsx` shimmer skeletons and `error.tsx` fallbacks per route.
- **Atomic & Feature UI Components (`components/`)**:
  - `components/skeleton.tsx` & `components/spinner-loading-effect.tsx` (Atomic loading indicators).
  - `components/dashboard-mastery-summary.tsx` (Feature diagnostic panel).
  - `components/todo-list.tsx` (Interactive planning & AI task generation).

---

## 3. Data Flow Specification

1. **User Action**: User clicks `[Weak]` on a topic pill inside `TopicList`.
2. **Presentation -> Application**: Client component calls Server Action `updateTopicMasteryLevel(topicId, 'weak')`.
3. **Application -> Infrastructure**: Server Action executes parameterized update via Supabase Postgres driver.
4. **Application -> Presentation Revalidation**: Server Action calls `revalidatePath('/dashboard')` & `revalidatePath('/subjects/[id]')`.
5. **Presentation Render**: Next.js Server Components refetch updated Domain Entities, evaluate diagnostic summaries via `MasteryEngine`, and render crisp UI cards.
