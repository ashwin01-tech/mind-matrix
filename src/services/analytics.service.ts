import { PrismaClient, ChatSession } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {

    async getOverviewStats(userId: number) {
        const totalMessages = await prisma.conversation.count({ where: { userId } });
        const userMessages = await prisma.conversation.count({ where: { userId, role: 'user' } });
        const aiMessages = await prisma.conversation.count({ where: { userId, role: 'assistant' } });

        // Simple sentiment check (assuming emotion is stored)
        const positiveEmotions = ['happy', 'calm', 'excited'];
        const positiveCount = await prisma.conversation.count({
            where: {
                userId,
                role: 'user',
                emotion: { in: positiveEmotions }
            }
        });

        const sentimentScore = userMessages > 0 ? (positiveCount / userMessages) * 100 : 0;

        return {
            totalMessages,
            userMessages,
            aiMessages,
            sentimentScore: Math.round(sentimentScore)
        };
    }

    async getEmotionTrends(userId: number) {
        // Get last 50 user messages with timestamps
        const logs = await prisma.conversation.findMany({
            where: { userId, role: 'user' },
            orderBy: { timestamp: 'desc' },
            take: 50,
            select: { timestamp: true, emotion: true, emotionIntensity: true }
        });

        // Aggregate by date (simple approach) or return raw points for frontend
        return logs.reverse().map(log => ({
            time: log.timestamp.toISOString(),
            emotion: log.emotion || 'neutral',
            intensity: log.emotionIntensity
        }));
    }

    async getRecentConversations(userId: number) {
        // Get sessions with metrics
        const sessions = await prisma.chatSession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            include: {
                _count: { select: { messages: true } }
            }
        });

        return sessions.map((session: ChatSession & { _count: { messages: number } }) => ({
            id: session.id,
            title: session.title,
            date: session.updatedAt.toISOString(),
            messageCount: session._count.messages
        }));
    }
    async getNetworkGraphData(userId: number) {
        // Fetch recent messages for the network
        const messages = await prisma.conversation.findMany({
            where: { userId },
            orderBy: { timestamp: 'asc' }, // Chronological order for linking
            take: 200, // Limit to reasonable size for visualization
            select: {
                id: true,
                role: true,
                emotion: true,
                emotionIntensity: true,
                timestamp: true,
                content: true,
                sessionId: true
            }
        });

        const nodes: any[] = [];
        const links: any[] = [];
        const messageIds = new Set<number>();
        const sessionGroups: Record<number, any[]> = {};

        messages.forEach((msg, index) => {
            messageIds.add(msg.id);

            // Create Node with enhanced data
            const node = {
                id: msg.id,
                group: msg.role === 'user' ? 1 : 2,
                emotion: msg.emotion || 'neutral',
                intensity: msg.emotionIntensity,
                val: 1 + (msg.emotionIntensity * 2), // Size based on intensity
                name: msg.role === 'user' ? 'User' : 'AI',
                content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
                fullContent: msg.content,
                timestamp: msg.timestamp.toISOString(),
                sessionId: msg.sessionId
            };
            
            nodes.push(node);

            // Group by session for better connectivity
            if (msg.sessionId) {
                if (!sessionGroups[msg.sessionId]) {
                    sessionGroups[msg.sessionId] = [];
                }
                sessionGroups[msg.sessionId].push(node);
            }
        });

        // Create intelligent links based on context and patterns
        messages.forEach((msg, index) => {
            // 1. Temporal link to previous message (conversation flow)
            if (index > 0) {
                links.push({
                    source: messages[index - 1].id,
                    target: msg.id,
                    value: 2,
                    type: 'temporal'
                });
            }

            // 2. Conversational pairs (User -> AI)
            if (msg.role === 'user' && index < messages.length - 1 && messages[index + 1].role === 'assistant') {
                links.push({
                    source: msg.id,
                    target: messages[index + 1].id,
                    value: 3,
                    type: 'conversational'
                });
            }

            // 3. Emotional connections (same emotion within nearby messages)
            const lookBack = Math.min(10, index);
            for (let j = index - lookBack; j < index; j++) {
                if (j >= 0 && messages[j].emotion === msg.emotion && msg.emotion !== 'neutral') {
                    // Add emotional link with some randomness to avoid clutter
                    if (Math.random() > 0.7) {
                        links.push({
                            source: messages[j].id,
                            target: msg.id,
                            value: 1,
                            type: 'emotional'
                        });
                    }
                }
            }

            // 4. Session-based clustering (connect messages within same session)
            if (msg.sessionId && sessionGroups[msg.sessionId]) {
                const sessionMsgs = sessionGroups[msg.sessionId];
                const currentIdx = sessionMsgs.findIndex(n => n.id === msg.id);
                
                // Connect to other messages in same session (skip immediate neighbors to avoid redundancy)
                if (currentIdx > 1) {
                    links.push({
                        source: sessionMsgs[currentIdx - 2].id,
                        target: msg.id,
                        value: 1.5,
                        type: 'session'
                    });
                }
            }
        });

        return { nodes, links };
    }

    async getAdvancedAnalytics(userId: number) {
        const messages = await prisma.conversation.findMany({
            where: { userId, role: 'user' },
            orderBy: { timestamp: 'asc' },
            take: 100, // Analyze last 100 user messages
            select: { content: true, emotion: true, emotionIntensity: true, timestamp: true }
        });

        // 1. Emotional Balance (Radar Chart)
        const emotionCounts: Record<string, number> = {
            happy: 0, sad: 0, angry: 0, anxious: 0, calm: 0, neutral: 0
        };
        messages.forEach(msg => {
            const emotion = msg.emotion || 'neutral';
            if (emotionCounts[emotion] !== undefined) {
                emotionCounts[emotion]++;
            }
        });
        const emotionalBalance = Object.keys(emotionCounts).map(key => ({
            emotion: key.charAt(0).toUpperCase() + key.slice(1),
            value: emotionCounts[key],
            fullMark: messages.length
        }));

        // 2. Mood Prediction (Linear Regression on Intensity)
        // We'll use the last 10 messages to predict the trend
        const recentMsgs = messages.slice(-10);
        let moodTrend = 'Stable';
        let forecast = 'Holding steady';

        if (recentMsgs.length >= 2) {
            const x = recentMsgs.map((_, i) => i);
            const y = recentMsgs.map(m => m.emotionIntensity);

            const meanX = x.reduce((a, b) => a + b, 0) / x.length;
            const meanY = y.reduce((a, b) => a + b, 0) / y.length;

            const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
            const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);

            const slope = denominator !== 0 ? numerator / denominator : 0;

            if (slope > 0.05) {
                moodTrend = 'Intensifying';
                forecast = 'Emotions are becoming more intense.';
            } else if (slope < -0.05) {
                moodTrend = 'Cooling Down';
                forecast = 'Emotional intensity is decreasing.';
            }
        }

        // 3. Word Cloud (Keyword Extraction)
        const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'of', 'for', 'it', 'that', 'with', 'as', 'but', 'or', 'my', 'i', 'me', 'you', 'this']);
        const wordCounts: Record<string, number> = {};

        messages.forEach(msg => {
            const words = msg.content.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
            words.forEach(word => {
                if (word.length > 3 && !stopWords.has(word)) {
                    wordCounts[word] = (wordCounts[word] || 0) + 1;
                }
            });
        });

        const wordCloud = Object.entries(wordCounts)
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 50); // Top 50 words

        return {
            emotionalBalance,
            moodPrediction: { trend: moodTrend, forecast },
            wordCloud
        };
    }
}

export const analyticsService = new AnalyticsService();
