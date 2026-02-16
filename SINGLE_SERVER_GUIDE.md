# Single Server Setup Guide

## Overview

Mind Matrix can run in **two modes**:

### 1. Development Mode (Two Servers) - **Current Default**
- **Frontend**: Vite dev server on `http://localhost:5173` (hot reload, fast refresh)
- **Backend**: Express server on `http://localhost:3000` (API & WebSocket)
- **Best for**: Active development with instant updates

### 2. Production Mode (Single Server) - **Deployment Ready**
- **Everything**: Single Express server on `http://localhost:3000`
- **Frontend**: Served as static files from `/client/dist`
- **Backend**: API & WebSocket on same server
- **Best for**: Production, testing final build, deployment

---

## Quick Start

### Development Mode (Recommended for coding)
```bash
npm run dev
```
- Open `http://localhost:5173`
- Hot reload on file changes
- Vite dev features (instant HMR)
- Two terminal outputs (frontend + backend)

### Single Server Mode (Production-like)
```bash
npm run dev:single
```
- Builds frontend first
- Starts single server on `http://localhost:3000`
- Serves built React app + API + WebSocket
- Use this to test production behavior

### Production Mode
```bash
npm run build
npm start
```
- Optimized build
- Single server ready for deployment
- Open `http://localhost:3000`

---

## Detailed Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run dev` | Two servers (Vite + Express) | Active development |
| `npm run dev:single` | Build then start single server | Test production build locally |
| `npm run dev:watch` | Auto-rebuild and restart on changes | Development with production mode |
| `npm run build` | Build frontend + backend | Prepare for deployment |
| `npm start` | Start production server | Run after build |
| `npm run server` | Backend only | Test API separately |
| `npm run client` | Frontend only | Test UI separately |

---

## How Single Server Works

### Build Process
```bash
npm run build
```
1. **TypeScript Compilation**: `tsc` compiles `src/**/*.ts` → `dist/`
2. **Frontend Build**: `cd client && npm run build` creates optimized bundle
3. **Output**: `client/dist/` contains production-ready static files

### Server Behavior
```typescript
// Server serves static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// API routes
app.get('/api/health', ...);

// WebSocket
const wss = new WebSocketServer({ server, path: '/ws/chat' });

// Catch-all for React Router
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

### Client Behavior
The client automatically detects the mode:
```javascript
// In Dashboard.jsx and NetworkVisualization.jsx
const isDevelopment = window.location.port === '5173';
const host = isDevelopment ? 'localhost:3000' : window.location.host;
const wsUrl = `${protocol}//${host}/ws/chat`;
```

- **Port 5173** = Development mode → Connect to `ws://localhost:3000`
- **Port 3000** = Production mode → Connect to `ws://localhost:3000`
- **Other ports** = Uses same host → `ws://your-domain.com`

---

## Why Two Modes?

### Development Mode Advantages
✅ **Instant Hot Module Replacement (HMR)**
- Change React code → See updates in < 1 second
- No full page reload needed
- Preserves component state

✅ **Better Error Messages**
- Vite shows detailed error overlays
- Stack traces point to original source
- Source maps for debugging

✅ **Faster Iteration**
- No build step required
- CSS changes apply instantly
- Great developer experience

### Single Server Advantages
✅ **Production Parity**
- Test exactly what users will see
- Verify optimized bundle works
- Catch build-time issues

✅ **Deployment Ready**
- One server to deploy
- Simplified hosting (Heroku, Railway, AWS, etc.)
- Same port for everything

✅ **Performance Testing**
- Test minified/optimized code
- Measure real load times
- Verify lazy loading

---

## Deployment

### Heroku
```bash
# Heroku automatically runs npm start
git push heroku main
```

### Railway
```bash
# Railway detects Node.js and runs npm start
railway up
```

### Docker
```dockerfile
FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Server
```bash
# On your server
git clone <repo>
cd mind-matrix
npm install
npm run build
npm start

# Or use PM2 for process management
pm2 start npm --name mind-matrix -- start
```

---

## Environment Variables

Same `.env` file works for both modes:

```env
# Server Configuration
PORT=3000
NODE_ENV=production  # or development

# Database
DATABASE_URL="file:../mindmatrix.db"

# AI Services
GROQ_API_KEY=your_groq_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# AI Configuration
AI_BASE_URL="https://api.groq.com/openai/v1"
AI_MODEL="llama-3.3-70b-versatile"
VOICE_ID="21m00Tcm4TlvDq8ikWAM"
AUDIO_MODEL="eleven_monolingual_v1"
```

---

## Common Issues

### Issue: "Cannot GET /" after building
**Solution**: Make sure you ran `npm run build` first
```bash
npm run build
npm start
```

### Issue: WebSocket connection failed in production
**Solution**: Client auto-detects the correct URL, but verify:
- Server is running on port 3000
- No firewall blocking WebSocket
- Using correct protocol (ws:// vs wss://)

### Issue: Hot reload not working
**Solution**: Use development mode
```bash
npm run dev  # Not npm run dev:single
```

### Issue: Build fails
**Solution**: Check both root and client dependencies
```bash
npm install
cd client && npm install
cd ..
npm run build
```

---

## Recommendation

**For active development**: Use `npm run dev`
- Best developer experience
- Fastest feedback loop
- All modern tooling enabled

**Before committing/deploying**: Test with `npm run dev:single`
- Verify build works
- Test production behavior
- Catch integration issues

**For production**: Use `npm run build && npm start`
- Optimized performance
- Single process
- Ready for users

---

## File Structure

```
mind-matrix/
├── src/                    # Backend TypeScript source
│   ├── server.ts          # Main server file
│   ├── config/
│   ├── services/
│   └── websocket/
├── dist/                   # Compiled backend (after build)
│   └── server.js
├── client/
│   ├── src/               # Frontend React source
│   ├── dist/              # Built frontend (after build)
│   │   ├── index.html
│   │   └── assets/
│   └── package.json
├── .env                   # Environment variables
└── package.json           # Root package.json
```

---

## Quick Reference

```bash
# Development (two servers, hot reload)
npm run dev

# Production test (one server, no hot reload)
npm run dev:single

# Production deploy
npm run build && npm start

# Check health
curl http://localhost:3000/api/health
```

That's it! You now have a flexible setup that works great for both development and production. 🚀
