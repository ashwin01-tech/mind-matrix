# Mind Matrix Architecture

## Current Setup: Development Mode (Two Servers)

```
┌─────────────────────────────────────────────────────────────────┐
│                         npm run dev                             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │  Vite Dev Server │      │  Express Server  │
        │   Port: 5173     │      │   Port: 3000     │
        │                  │      │                  │
        │  • Hot Reload    │      │  • REST API      │
        │  • Fast Refresh  │      │  • WebSocket     │
        │  • Source Maps   │      │  • Business Logic│
        └──────────────────┘      └──────────────────┘
                │                         │
                │                         │
        Browser connects to:      Browser connects to:
        http://localhost:5173     ws://localhost:3000/ws/chat
        (Frontend UI)             (API & WebSocket)
                │                         │
                └────────────┬────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Your Browser   │
                    │                  │
                    │  React App loads │
                    │  from 5173, but  │
                    │  connects to 3000│
                    │  for data        │
                    └──────────────────┘
```

## Production Mode: Single Server

```
┌─────────────────────────────────────────────────────────────────┐
│                    npm run dev:single                           │
│                         or                                      │
│                npm run build && npm start                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │    Express Server        │
                    │    Port: 3000            │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  Static Files      │  │
                    │  │  (client/dist/)    │  │
                    │  │                    │  │
                    │  │  • index.html      │  │
                    │  │  • bundled JS      │  │
                    │  │  • CSS, images     │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  REST API          │  │
                    │  │  /api/health       │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  WebSocket         │  │
                    │  │  /ws/chat          │  │
                    │  └────────────────────┘  │
                    │                          │
                    │  ┌────────────────────┐  │
                    │  │  Catch-all Route   │  │
                    │  │  → index.html      │  │
                    │  └────────────────────┘  │
                    └──────────────────────────┘
                                 │
                    Browser connects to:
                    http://localhost:3000
                    (Everything from one server)
                                 │
                    ┌────────────▼─────────────┐
                    │      Your Browser        │
                    │                          │
                    │  All requests go to 3000 │
                    │  - HTML from static      │
                    │  - API from /api         │
                    │  - WebSocket from /ws    │
                    └──────────────────────────┘
```

## Request Flow in Single Server Mode

```
Browser Request: http://localhost:3000/
                        │
                        ▼
            ┌───────────────────────┐
            │   Express Middleware  │
            └───────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   /api/health    /ws/chat       Other paths
        │               │               │
        │               │               │
        ▼               ▼               ▼
    JSON API      WebSocket       Static Files
    Response      Handler         (index.html)
        │               │               │
        └───────────────┴───────────────┘
                        │
                        ▼
                Browser Receives Response
```

## File Structure

```
mind-matrix/
│
├── package.json (root)          # Scripts: dev, dev:single, build, start
│   └── dependencies             # Backend: express, ws, prisma, etc.
│
├── src/                         # Backend Source (TypeScript)
│   ├── server.ts               # Main server file
│   ├── config/
│   ├── services/
│   ├── websocket/
│   └── ...
│
├── dist/                        # Backend Build Output (after tsc)
│   └── server.js               # Compiled server (runs in production)
│
├── client/
│   ├── package.json            # Frontend dependencies (React, Vite)
│   │
│   ├── src/                    # Frontend Source
│   │   ├── App.jsx
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   │
│   └── dist/                   # Frontend Build Output (after vite build)
│       ├── index.html          # Entry point
│       └── assets/             # Bundled JS, CSS, images
│           ├── index-*.js      # Minified React bundle
│           └── index-*.css     # Minified CSS
│
├── .env                        # Environment variables
├── prisma/
│   └── schema.prisma
└── mindmatrix.db               # SQLite database
```

## Development Workflow

### Two-Server Mode (Development)
```bash
npm run dev
```
1. Concurrently starts both servers
2. Vite watches `client/src/` → hot reload
3. Nodemon watches `src/` → auto-restart
4. Open http://localhost:5173

### Single-Server Mode (Production Testing)
```bash
npm run dev:single
```
1. Runs `npm run build`:
   - `tsc` compiles src/ → dist/
   - Vite builds client/src/ → client/dist/
2. Runs `npm start`:
   - Starts Express server
   - Serves client/dist/ as static files
3. Open http://localhost:3000

### Production Deployment
```bash
npm run build    # One-time build
npm start        # Start server
```
Or use the convenience script:
```bash
./start-single-server.sh
```

## Advantages of Each Mode

### Two-Server Mode
✅ Instant hot module replacement
✅ Fast development feedback
✅ Better error messages from Vite
✅ Source maps for debugging
✅ Best developer experience

❌ Two processes to manage
❌ More memory usage
❌ Not production-like

### Single-Server Mode
✅ Production parity
✅ One process
✅ Optimized bundle
✅ Ready for deployment
✅ Lower memory usage

❌ No hot reload (must rebuild)
❌ Slower iteration
❌ Build step required

## When to Use Each

| Task | Recommended Mode |
|------|------------------|
| Writing new features | `npm run dev` |
| Fixing bugs | `npm run dev` |
| Testing before commit | `npm run dev:single` |
| Checking build works | `npm run dev:single` |
| Preparing for deploy | `npm run build && npm start` |
| Production deployment | `npm start` (after build) |

## Smart WebSocket Connection

The client automatically detects which mode it's running in:

```javascript
// client/src/pages/Dashboard.jsx
const isDevelopment = window.location.port === '5173';
const host = isDevelopment ? 'localhost:3000' : window.location.host;
const wsUrl = `${protocol}//${host}/ws/chat`;
```

This means:
- **Port 5173**: Connects to `ws://localhost:3000/ws/chat`
- **Port 3000**: Connects to `ws://localhost:3000/ws/chat`
- **Other**: Connects to `ws://your-domain.com/ws/chat`

No configuration needed! 🎉
