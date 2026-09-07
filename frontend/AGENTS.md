# Frontend Agent Rules

These rules apply to `frontend/`. Also follow the root `AGENTS.md`.

## Goals

Keep the frontend small, responsive, understandable, and focused on product flows.

## Structure

Prefer feature-oriented organization. Avoid large global state unless concrete complexity requires it.

## Clean Code

- Components should have one clear responsibility.
- Extract hooks/services for reusable behavior, not merely to reduce line count.
- Keep API transport details out of presentational components.
- Model loading, empty, success, and error states explicitly.
- Avoid duplicated API calls and unnecessary effects.
- Keep TypeScript types explicit at API boundaries.

## Testing

For non-trivial behavior:

```text
RED → GREEN → REFACTOR
```

Prioritize user-visible behavior, API-state transitions, validation, error states, and authentication-sensitive flows.

Do not over-test visual implementation details.

## UX

- Required flows must work at desktop and mobile widths.
- Surface backend validation errors clearly.
- Avoid browser console warnings.
- Prefer accessible semantic HTML.
