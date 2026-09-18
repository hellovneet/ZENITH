# Qubit Lab

Qubit Lab is an interactive web platform for learning quantum computing by building and simulating circuits in the browser.

Instead of only reading about gates and quantum states, you can create a circuit, run it, inspect the result, and then test your understanding with quizzes.

## What you can do

- Explore a structured quantum-computing curriculum
- Build circuits with common single- and multi-qubit gates
- Simulate state vectors and measurement probabilities in the browser
- View amplitudes, probabilities, phases, Dirac notation, and Bloch-sphere data
- Try ready-made circuits such as Bell, GHZ, Grover, Deutsch, and teleportation
- Export circuits for Qiskit, PennyLane, Cirq, and OpenQASM
- Practice concepts with quizzes and track progress during a session
- Use the built-in learning guide without requiring an AI API key
- Optionally connect Gemini through the server-side `/api/chat` endpoint
- Optionally connect Supabase for the parts of the app that use it

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Three.js
- Lucide React
- Supabase (optional)
- Google Gemini (optional, server-side)

## Project structure

```text
.
├── api/
│   ├── chat.ts          # Optional server-side Gemini chat endpoint
│   └── health.ts        # Deployment/configuration health check
├── docs/                # Project documentation and assets
├── src/
│   ├── data/            # Curriculum, quizzes and adaptive-learning data
│   ├── i18n/             # Language support
│   ├── lib/              # External service clients
│   ├── utils/            # Quantum engine, tutor and progress logic
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

## Run locally

### 1. Install Node.js

Use a current LTS version of Node.js. Node 22 LTS is a good choice.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Vite will show the local URL in the terminal.

### 4. Check the project

```bash
npm run lint
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local` when you want to use optional services.

```env
# Optional: server-side Gemini API access
GEMINI_API_KEY=your_gemini_api_key

# Optional: Supabase browser configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Optional: choose a Gemini model supported by your Google AI account
GEMINI_MODEL=your_supported_gemini_model
```

### Important about API keys

`GEMINI_API_KEY` is intentionally **not** prefixed with `VITE_`. The browser should never receive this secret. The `/api/chat` endpoint reads it on the server.

The Supabase URL and publishable key use `VITE_` because those values are used by the browser. Do not put a Supabase service-role key in the frontend.

## Deploy to Vercel

Qubit Lab is configured for Vercel.

### Option A — GitHub

1. Push the project to GitHub.
2. Open Vercel and choose **Add New → Project**.
3. Import the repository.
4. Keep the detected Vite settings.
5. Add environment variables under **Project → Settings → Environment Variables**.
6. Deploy.

Recommended variables:

| Variable | Where it is used | Required? |
|---|---|---|
| `GEMINI_API_KEY` | `/api/chat` | Only for Gemini AI |
| `GEMINI_MODEL` | `/api/chat` | Optional |
| `VITE_SUPABASE_URL` | Frontend | Only if Supabase is used |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | Only if Supabase is used |

After changing environment variables, redeploy the project so the new values are picked up.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
```

For a production deployment:

```bash
vercel --prod
```

## API endpoints

### Health check

```text
GET /api/health
```

This reports whether the server-side Gemini configuration is present. It does not return the secret itself.

### Chat

```text
POST /api/chat
```

The endpoint accepts chat messages and can use Gemini when `GEMINI_API_KEY` is configured. If no AI credential is available, the app can fall back to its local learning guide.

## How the quantum simulator works

The simulator is implemented in `src/utils/quantumEngine.ts`.

At a high level it:

1. Creates the initial state vector.
2. Applies the gates in circuit order.
3. Keeps track of complex amplitudes.
4. Calculates measurement probabilities.
5. Samples measurement shots when requested.
6. Provides data used by the visualizations.

The simulator is intended for learning and experimentation, not as a replacement for large-scale quantum-computing platforms or real quantum hardware.

## Language support

The application includes its own language context and translation data under `src/i18n/`. Keep translated UI strings in the project translation files rather than hard-coding language-specific text into individual components.

## Security notes

- Never commit `.env.local` or real API keys.
- Keep `GEMINI_API_KEY` server-side.
- Use only a Supabase publishable/anon key in browser-exposed variables.
- Do not place service-role credentials in `VITE_*` variables.

## Troubleshooting

### Vercel build fails

Run the same checks locally:

```bash
npm install
npm run lint
npm run build
```

If the build succeeds locally but Vercel fails, check the Vercel build log and confirm the Node.js version and environment variables.

### Gemini is not responding

Check that `GEMINI_API_KEY` is added to the Vercel project's environment variables and that you redeployed after adding it. You can also check:

```text
/api/health
```

### Supabase is not connecting

Check the spelling of:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Then redeploy after changing them.

## License

See `LICENSE` for the project's license information.

---

Built as an educational quantum-computing project with a focus on making circuits and their results easier to understand through hands-on experimentation.
