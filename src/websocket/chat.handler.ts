import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import { aiService } from '../services/ai.service';
import { emotionService } from '../services/emotion.service';

const prisma = new PrismaClient();

interface ChatMessage {
    type: 'text' | 'audio' | 'audio_end' | 'error' | 'history' | 'ping';
    content?: any;
    timestamp?: string;
    emotion?: string;
    emotion_intensity?: number;
    error?: string;
}

export const setupWebSocket = (wss: WebSocketServer) => {
    wss.on('connection', async (ws: WebSocket) => {
        console.log('Client connected');

        // Simple user ID for now (monodb assumption: single user or fixed ID 1)
        const userId = 1;

        // Ensure user exists
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    username: `user_${userId}`,
                }
            });
        }

        // Load History
        const history = await prisma.conversation.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: 50,
        });

        const formattedHistory = history.reverse().map((msg: any) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            emotion: msg.emotion,
            timestamp: msg.timestamp.toISOString()
        }));

        // Send History
        ws.send(JSON.stringify({
            type: 'history',
            content: formattedHistory
        }));

        ws.on('message', async (message: string) => {
            try {
                let text = '';
                let voiceEnabled = true; // Default to true

                try {
                    // Try parsing as JSON first
                    const parsed = JSON.parse(message.toString());
                    text = parsed.content || '';
                    if (parsed.voiceEnabled !== undefined) {
                        voiceEnabled = parsed.voiceEnabled;
                    }
                } catch (e) {
                    // Fallback to raw string if not JSON
                    text = message.toString().trim();
                }

                if (!text) return;

                console.log(`Received: ${text} (Voice: ${voiceEnabled})`);

                // 1. Save User Message
                await prisma.conversation.create({
                    data: {
                        userId,
                        role: 'user',
                        content: text,
                    }
                });

                // 2. Detect Emotion
                const { emotion, intensity } = emotionService.detectEmotion(text);

                // 3. Get AI Response
                // Construct context from history + new message
                const context = formattedHistory.map((h: any) => ({ role: h.role, content: h.content }));
                context.push({ role: 'user', content: text });

                // System Prompt
                const systemPrompt = `You are Mind Matrix, an empathetic AI assistant. 
                The user is feeling ${emotion} (intensity: ${intensity}). 
                Respond warmly and helpfully.`;

                const stream = await aiService.getResponseStream([
                    { role: 'system', content: systemPrompt },
                    ...context.slice(-10) // Limit context window
                ]);

                let fullResponse = '';

                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        fullResponse += content;
                    }
                }

                // 4. Save Assistant Response
                await prisma.conversation.create({
                    data: {
                        userId,
                        role: 'assistant',
                        content: fullResponse,
                        emotion,
                        emotionIntensity: intensity
                    }
                });

                // 5. Send Text Response
                ws.send(JSON.stringify({
                    type: 'text',
                    content: fullResponse,
                    emotion,
                    emotion_intensity: intensity,
                    timestamp: new Date().toISOString()
                }));

                // 6. Generate & Stream Audio (ONLY if voice enabled)
                if (voiceEnabled) {
                    const audioStream = await aiService.textToSpeechStream(fullResponse, emotion, intensity);

                    audioStream.on('data', (chunk: Buffer) => {
                        ws.send(JSON.stringify({
                            type: 'audio',
                            content: chunk.toString('base64')
                        }));
                    });

                    audioStream.on('end', () => {
                        ws.send(JSON.stringify({ type: 'audio_end' }));
                    });
                } else {
                    console.log('Voice disabled by client. Skipping TTS.');
                }

            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({ type: 'error', error: 'Internal Server Error' }));
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
};
