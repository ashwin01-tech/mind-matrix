import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { config } from './config/env';
import { setupWebSocket } from './websocket/chat.handler';
import path from 'path';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
const clientBuildPath = path.join(__dirname, '../client/dist');
console.log(`Serving static files from: ${clientBuildPath}`);
app.use(express.static(clientBuildPath));

// API Routes (Placeholders for now)
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// WebSocket Setup
const wss = new WebSocketServer({ server, path: '/ws/chat' });
setupWebSocket(wss);

// Catch-all handler for React
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start Server
const PORT = config.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`ws://localhost:${PORT}/ws/chat`);
});
