# Smart AI Finance

The project is organized into two independent applications:

- `client/` contains the React and Vite frontend.
- `server/` contains the Express API and database integration.

Run the applications from their respective folders:

```bash
cd client
npm install
npm run dev
```

In a second terminal:

```bash
cd server
npm install
npm start
```

Configure the backend before starting it by copying `server/.env.example` to
`server/.env` and setting `MONGODB_URI` to a MongoDB connection string and
`JWT_SECRET` to a private signing secret. `OPENAI_API_KEY` is optional; without
it, the assistant uses its built-in contextual responses. The database-backed
API health check is available at `http://localhost:5000/api/health`. For
MongoDB Atlas, allowlist the machine's public IP address so the local server can
reach the cluster. `MONGO_URI` is also accepted as a compatibility alias for
`MONGODB_URI`.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
