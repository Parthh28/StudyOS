<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# StudyOS Agent Guidelines

Welcome! This file provides context and conventions for any AI agent working on this codebase. Please follow these guidelines carefully.

## 1. Project Context
StudyOS is a productivity and study management application featuring task tracking (todos), topic checklists, and study trend visualizations. 

## 2. Tech Stack & Library Conventions
- **Framework:** Next.js 16 (App Router) with React 19.
- **Styling:** Tailwind CSS v4. **Note:** Since this is v4, styling configuration is CSS-based. Do not try to create or modify `tailwind.config.js`. Use the `cn` utility (from `clsx` and `tailwind-merge`) for conditionally merging Tailwind classes.
- **UI Components:** We use **shadcn/ui** and **Lucide React** for icons. Before building custom UI from scratch, check if a shadcn component exists or can be adapted.
- **Charts:** Use **Recharts** for any data visualization (e.g., study trends).
- **Database & Auth:** **Supabase**. We use `@supabase/ssr` for server-side rendering support with Supabase.

## 3. Architecture & Code Style
- **Server Components by Default:** Assume all components in `app/` are Server Components unless they require state (`useState`), lifecycle hooks (`useEffect`), or DOM event listeners. Only then should you add the `"use client"` directive at the very top of the file.
- **File Naming:** Use `kebab-case` for all files and directories (e.g., `study-trends-chart.tsx`).
- **TypeScript:** Strict typing is enforced. Use interfaces for component props and data models. Avoid `any`.

## 4. Database & Migrations
- All database schema changes must be done via SQL migration files in `supabase/migrations/`.
- Use a sequential naming convention for new migrations (e.g., `004_feature_name.sql`).
- **Security:** Always include and enforce Row Level Security (RLS) policies for new tables so that users can only access their own data.

## 5. General Agent Rules
- Do not remove or alter existing comments or documentation unless explicitly asked to do so or if they become obsolete due to code changes.
- Focus on the aesthetic quality of the UI. Use sleek dark modes, subtle micro-animations (we have `tw-animate-css`), and clean layouts.
