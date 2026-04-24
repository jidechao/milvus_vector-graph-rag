# Vector Graph RAG — Frontend

React 19 + TypeScript + Vite 7 + Tailwind CSS v4. Multi-page UI for the Vector Graph RAG FastAPI backend: dashboards, ingestion, document CRUD, and a query workbench with graph visualization (React Flow).

## Scripts

```bash
npm install
npm run dev          # http://localhost:5173 (default Vite)
npm run build
npm run lint
```

## API proxy (development)

`vite.config.ts` proxies `/api` to the FastAPI server and strips the `/api` prefix. Backend port defaults to `8000` or repo-root `VGRAG_API_PORT` (loaded from the parent directory). The Axios client in `src/api/client.ts` uses `baseURL: '/api'`.

## Stack highlights

- **Routing:** `react-router-dom` — `/dashboard`, `/query`, `/knowledge-bases`, `/documents`, `/ingestion`
- **Data:** `@tanstack/react-query`, `axios`
- **State:** `zustand` (persisted dataset id under key `vgrag-dataset`; invalid ids reset when `/graphs` loads)
- **Graph:** `@xyflow/react`
- **Answers:** `react-markdown` + `remark-gfm`, Tailwind Typography (`@tailwindcss/typography` via `@plugin` in `src/index.css`)
- **Graph labels:** API id `unprefixed` is shown in Chinese in the UI (`src/utils/graphDisplayName.ts`); path segments for `/graph/{name}/…` are URL-encoded.

For project-wide documentation (graph naming, stats, `.env` vs ingestion target), see the [root README](../README.md).
