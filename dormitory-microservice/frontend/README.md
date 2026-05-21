# Dormitory Frontend (React + Vite + TypeScript)

This is a Vite + React + TypeScript scaffold using Tailwind CSS. It is a replacement for the previous Next.js frontend.

Quick start:

1. Install dependencies

```bash
cd frontend-react
npm install
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
npm run preview
```

Environment variables (create `.env` or `.env.local`):

```
VITE_AUTH_URL=http://localhost:3001
VITE_STUDENT_URL=http://localhost:3002
# ... other services
```

Next steps:
- Migrate pages and components from the Next.js `frontend` into `src/pages` and components.
- Wire protected routes and layouts (`/admin`, `/student`).
