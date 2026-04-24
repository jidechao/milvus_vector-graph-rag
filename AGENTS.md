# AGENTS.md

This file provides practical guidance for coding agents working in this repository.
It focuses on reliable commands, expected coding style, and safe change patterns.

## Project Snapshot

- Project: `vector-graph-rag`
- Language: Python (`>=3.10`)
- Build backend: Hatchling
- Package source root: `src/vector_graph_rag`
- Main test directory: `tests`
- Lint tool: Ruff
- API stack: FastAPI + Uvicorn
- Optional frontend: `frontend` (Node-based)

## Environment Setup

### Using uv (recommended)

- Install core deps:
  - `uv sync`
- Install dev deps:
  - `uv sync --extra dev`
- Install API deps:
  - `uv sync --extra api`
- Install everything:
  - `uv sync --extra dev --extra api`

### Using pip

- Core install:
  - `pip install -e .`
- With dev tools:
  - `pip install -e ".[dev]"`
- With API:
  - `pip install -e ".[api]"`
- With all extras:
  - `pip install -e ".[dev,api,loaders]"`

## Build / Run / Lint / Test Commands

### Run Python examples

- Demo script:
  - `python demo.py`

### Run API server

- With uv:
  - `uv run uvicorn vector_graph_rag.api.app:app --host 0.0.0.0 --port 8000`
- With venv/python:
  - `python -m uvicorn vector_graph_rag.api.app:app --host 0.0.0.0 --port 8000`

### Lint

- Run Ruff:
  - `ruff check .`
- Optional auto-fix:
  - `ruff check . --fix`

### Tests

- Run all tests:
  - `pytest`
- Verbose:
  - `pytest -v`
- Stop on first failure:
  - `pytest -x`

### Run a single test file

- `pytest tests/test_graph.py`
- `pytest tests/test_api.py`
- `pytest tests/test_milvus_store.py`

### Run a single test class

- `pytest tests/test_graph.py::TestGraphPassageCRUD`

### Run a single test function

- `pytest tests/test_graph.py::TestGraphPassageCRUD::test_create_passage_simple`

### Filter tests by keyword

- `pytest -k "passage and not api"`

## Repository Rules and Policy Files

- No `.cursor/rules/` directory detected.
- No `.cursorrules` file detected.
- No `.github/copilot-instructions.md` detected.
- Therefore, follow this `AGENTS.md` and existing code conventions in `src/` and `tests/`.

## Code Style Conventions

### Formatting and line length

- Ruff is configured with `line-length = 100`.
- Prefer readable wrapped calls over long inline expressions.
- Keep docstrings concise and behavior-oriented.

### Imports

- Group imports in this order:
  1. Standard library
  2. Third-party packages
  3. Local package imports (`vector_graph_rag...`)
- Use absolute imports from `vector_graph_rag`.
- Remove unused imports.

### Typing

- Use explicit type hints for public functions/methods.
- Use `Optional[T]`, `List[T]`, `Dict[K, V]`, `Tuple[...]` consistently.
- Keep return types accurate; avoid ambiguous `Any` unless required.

### Naming

- Classes: `PascalCase`
- Functions/variables: `snake_case`
- Constants: `UPPER_SNAKE_CASE`
- Private/internal methods: leading underscore (for internal APIs)

### Error handling

- Raise precise exceptions with actionable messages.
- Validate required configuration at boundaries.
- Do not swallow exceptions silently unless fallback behavior is intentional and documented.
- Preserve retry semantics where currently used (e.g., tenacity-wrapped LLM calls).

### Logging

- Use module logger (`logger = logging.getLogger(__name__)`) for runtime diagnostics.
- Avoid logging secrets (API keys, tokens, raw credentials).

### Data models

- Prefer Pydantic models for structured payloads.
- Preserve backwards-compatible fields when extending API responses.

## Testing Expectations for Changes

- Any functional change should include or update tests when feasible.
- At minimum, run targeted tests for touched modules.
- Prefer deterministic tests:
  - Mock embedding/LLM calls in unit tests.
  - Avoid network-dependent behavior in CI-oriented tests.

## Common Change Patterns

### Config-related changes

- Keep env var behavior aligned with `Settings` in `config.py`.
- If adding settings, include:
  - Default value
  - Description
  - Runtime validation if required

### Retrieval / RAG pipeline changes

- Keep flow coherent:
  - retrieval -> rerank -> passage selection -> answer generation
- Add safe fallback behavior only when it improves robustness and preserves expected outputs.
- Ensure changes do not break `QueryResult` structure.

### Milvus / vector changes

- Ensure vector dimensions stay consistent across:
  - embedding outputs
  - collection schema
  - inserted vector lengths
- Prefer early validation and clear errors for dimension mismatches.

## Frontend Notes (if touched)

- Frontend lives under `frontend/`.
- Typical local flow:
  - `cd frontend`
  - `npm install`
  - `npm run dev`
- Keep backend API contract stable when making server-side changes.

## Safety Checklist Before Finishing

- Lint passes (`ruff check .`).
- Relevant tests pass (at least targeted test path).
- No debug instrumentation left unintentionally.
- No secrets introduced into tracked files.
- Public behavior changes are reflected in docs or examples where relevant.
