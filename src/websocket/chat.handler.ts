import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import { aiService } from '../services/ai.service';
import { emotionService } from '../services/emotion.service';
import emotionAIService from '../services/emotion-ai.service';
import crisisDetectionService from '../services/crisis.service';
import memoryService from '../services/memory.service';
import therapyService from '../services/therapy.service';

const prisma = new PrismaClient();

/**
 * Process message with Phase 3 advanced analysis
 */
async function processMessageWithAdvancedAnalysis(
    userId: number,
    messageContent: string,
    conversationHistory: any[],
    sessionId: number
) {
    // 1. Quick emotion check (Phase 2 - fast)
    const quickAnalysis = emotionService.detectEmotion(messageContent);
    
    // 2. Advanced LLM analysis (Phase 3 - context-aware)
    let advancedAnalysis;
    try {
        advancedAnalysis = await emotionAIService.analyzeEmotion(messageContent, conversationHistory);
    } catch (error) {
        console.warn('Advanced emotion analysis failed, using quick analysis:', error);
        advancedAnalysis = {
            emotion: quickAnalysis.emotion,
            intensity: quickAnalysis.intensity,
            confidence: 0.7,
            method: 'keyword',
            valence: 'neutral',
            arousal: 'calm',
            triggers: [],
            cognitiveDistortions: [],
            psychological_state: 'baseline'
        };
    }
    
    // 3. Crisis detection (critical)
    let crisisCheck;
    try {
        crisisCheck = crisisDetectionService.detectCrisis(messageContent);
    } catch (error) {
        console.warn('Crisis detection failed:', error);
        crisisCheck = { is_crisis: false, severity: 'low' };
    }
    
    if (crisisCheck.is_crisis) {
        return {
            type: 'crisis',
            severity: crisisCheck.severity,
            message: crisisCheck.message || 'Crisis detected',
            resources: (crisisCheck as any).resources || [],
            actions: (crisisCheck as any).immediate_actions || []
        };
    }
    
    // 4. Get user memory and context
    let userMemory;
    let context;
    try {
        userMemory = memoryService.buildUserMemory(userId.toString(), conversationHistory);
        context = memoryService.getConversationContext(conversationHistory, 5);
    } catch (error) {
        console.warn('Memory service error:', error);
        userMemory = {
            frequentEmotions: {},
            commonTriggers: {},
            effectiveCopingStrategies: [],
            emotionalBaseline: 'neutral',
            concerningPatterns: []
        };
        context = {
            recentEmotions: [],
            identifiedTriggers: [],
            emotionalTrend: 'stable',
            recommendations: []
        };
    }
    
    // 5. Generate therapeutic response
    let therapyResponse;
    try {
        const therapyContext = {
            userEmotion: advancedAnalysis.emotion,
            emotionIntensity: advancedAnalysis.intensity,
            cognitiveDistortions: advancedAnalysis.cognitiveDistortions || [],
            triggers: advancedAnalysis.triggers || [],
            previousGoals: userMemory.effectiveCopingStrategies,
            conversationHistory
        };
        
        therapyResponse = await therapyService.generateTherapyResponse(therapyContext);
    } catch (error) {
        console.warn('Therapy response generation failed:', error);
        therapyResponse = {
            mode: 'support',
            technique: 'validation',
            response: 'I hear you. Let\'s work through this together.',
            exercise: undefined
        };
    }
    
    return {
        type: 'normal',
        emotion: advancedAnalysis.emotion,
        intensity: advancedAnalysis.intensity,
        confidence: advancedAnalysis.confidence,
        method: advancedAnalysis.method,
        valence: advancedAnalysis.valence,
        arousal: advancedAnalysis.arousal,
        triggers: advancedAnalysis.triggers,
        distortions: advancedAnalysis.cognitiveDistortions,
        psychology: advancedAnalysis.psychological_state,
        therapy: therapyResponse,
        context: context,
        memory: userMemory
    };
}

/**
 * Build system prompt based on therapy mode and user memory
 */
function buildSystemPrompt(therapyMode: string, userMemory: any): string {
    const modeInstructions: Record<string, string> = {
        crisis: 'Focus on immediate safety and support. Prioritize crisis resources and safety planning.',
        exploration: 'Use Socratic questioning to help the user explore their feelings and thoughts.',
        support: 'Validate their emotions and provide warm, empathetic support.',
        skills: 'Teach practical coping skills and evidence-based techniques.'
    };
    
    const basePrompt = `You are Mind Matrix, a compassionate AI mental health companion. Your role is to provide supportive, evidence-based responses using psychological principles.

${modeInstructions[therapyMode] || modeInstructions.support}

User Context:
- Most common emotions: ${Object.keys(userMemory.frequentEmotions || {}).slice(0, 3).join(', ') || 'varied'}
- Frequent triggers: ${Object.keys(userMemory.commonTriggers || {}).slice(0, 3).join(', ') || 'not yet identified'}
- Coping strategies that work: ${(userMemory.effectiveCopingStrategies || []).slice(0, 3).join(', ') || 'being explored'}

IMPORTANT - RESPONSE FORMATTING INSTRUCTIONS:
You MUST format your responses with clear structure using markdown:
1. Use ## for main sections/headings
2. Use bullet points (- or •) for lists and key points
3. Use **bold** for important concepts
4. Use numbered lists (1. 2. 3.) for steps or sequential ideas
5. Add blank lines between sections for readability
6. Keep each section concise and focused
7. Use short paragraphs (2-3 sentences max)
8. End with a clear call-to-action or follow-up question

Example structure:
## Understanding Your Situation
- Key point 1
- Key point 2

## Suggestions
1. First suggestion
2. Second suggestion

## Next Steps
- Action 1
- Action 2

Guidelines:
- Be warm, empathetic, and genuinely supportive
- Use evidence-based techniques (CBT, DBT, Motivational Interviewing)
- Validate their feelings without judgment
- Never promise to replace professional mental health care
- Always structure responses clearly with sections and bullet points
- Ask thoughtful, open-ended follow-up questions when appropriate`;

    return basePrompt;
}

/**
 * Save enhanced message with Phase 3 analysis data
 */
async function saveEnhancedMessage(
    userId: number,
    sessionId: number,
    data: {
        userMessage: string;
        emotion: string;
        intensity: number;
        confidence?: number;
        method?: string;
        valence?: string;
        arousal?: string;
        triggers?: string[];
        distortions?: string[];
        therapyMode?: string;
        therapyTechnique?: string;
        exercise?: any;
    }
) {
    const userMsg = await prisma.conversation.create({
        data: {
            userId,
            sessionId,
            role: 'user',
            content: data.userMessage,
            emotion: data.emotion,
            emotionIntensity: data.intensity,
            method: data.method,
            valence: data.valence,
            arousal: data.arousal,
            triggers: data.triggers ? JSON.stringify(data.triggers) : undefined,
            cognitive_distortions: data.distortions ? JSON.stringify(data.distortions) : undefined
        } as any
    });

    // Also log emotion for analytics
    if (data.emotion && data.emotion !== 'neutral') {
        await prisma.emotionLog.create({
            data: {
                userId,
                emotion: data.emotion,
                intensity: data.intensity,
                trigger: data.triggers ? data.triggers[0] : undefined,
                conversationId: userMsg.id
            }
        }).catch(err => console.warn('Failed to log emotion:', err));
    }

    return userMsg;
}

/**
 * Save AI response with therapy data
 */
async function saveAIResponse(
    userId: number,
    sessionId: number,
    data: {
        aiResponse: string;
        therapyMode?: string;
        therapyTechnique?: string;
        exercise?: any;
    }
) {
    return prisma.conversation.create({
        data: {
            userId,
            sessionId,
            role: 'assistant',
            content: data.aiResponse,
            therapy_mode: data.therapyMode,
            therapy_technique: data.therapyTechnique,
            exercise: data.exercise ? JSON.stringify(data.exercise) : undefined
        } as any
    });
}

export const setupWebSocket = (wss: WebSocketServer) => {
    wss.on('connection', async (ws: WebSocket) => {
        console.log('Client connected');

        // Simple user ID for now (monodb assumption: single user or fixed ID 1)
        const userId = 1;
        let currentSessionId: number | null = null;

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

        // --- Helper: Send Sessions List ---
        const sendSessions = async () => {
            const sessions = await prisma.chatSession.findMany({
                where: { userId },
                orderBy: { updatedAt: 'desc' },
                include: {
                    _count: { select: { messages: true } }
                }
            });
            ws.send(JSON.stringify({ type: 'sessions', content: sessions }));
        };

        // --- Helper: Load Session History ---
        const loadSession = async (sessionId: number) => {
            const history = await prisma.conversation.findMany({
                where: { userId, sessionId },
                orderBy: { timestamp: 'asc' }, // Send in chronological order
            });

            const formattedHistory = history.map((msg: any) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                emotion: msg.emotion,
                timestamp: msg.timestamp.toISOString()
            }));

            ws.send(JSON.stringify({
                type: 'history',
                content: formattedHistory,
                sessionId
            }));

            currentSessionId = sessionId;
        };

        // Initial Load: Send sessions
        await sendSessions();

        // If no sessions, create one automatically
        const count = await prisma.chatSession.count({ where: { userId } });
        if (count === 0) {
            const newSession = await prisma.chatSession.create({
                data: { userId, title: 'New Chat' }
            });
            await sendSessions();
            await loadSession(newSession.id);
        } else {
            // Load most recent session
            const lastSession = await prisma.chatSession.findFirst({
                where: { userId },
                orderBy: { updatedAt: 'desc' }
            });
            if (lastSession) {
                await loadSession(lastSession.id);
            }
        }

        ws.on('message', async (message: string) => {
            try {
                const parsed = JSON.parse(message.toString());

                // --- Handle System Events ---
                if (parsed.type === 'create_session') {
                    const newSession = await prisma.chatSession.create({
                        data: { userId, title: 'New Chat' }
                    });
                    await sendSessions();
                    await loadSession(newSession.id);
                    return;
                }

                if (parsed.type === 'switch_session') {
                    if (parsed.sessionId) {
                        await loadSession(parsed.sessionId);
                    }
                    return;
                }

                if (parsed.type === 'delete_session') {
                    if (parsed.sessionId) {
                        await prisma.chatSession.delete({
                            where: { id: parsed.sessionId }
                        });
                        // If deleted current session, switch to another or create new
                        if (currentSessionId === parsed.sessionId) {
                            const lastSession = await prisma.chatSession.findFirst({
                                where: { userId },
                                orderBy: { updatedAt: 'desc' }
                            });
                            if (lastSession) {
                                await loadSession(lastSession.id);
                            } else {
                                const newSession = await prisma.chatSession.create({
                                    data: { userId, title: 'New Chat' }
                                });
                                await loadSession(newSession.id);
                            }
                        }
                        await sendSessions();
                    }
                    return;
                }

                if (parsed.type === 'get_analytics') {
                    // Import dynamically to avoid circular dependency issues if any, 
                    // though services are usually fine. 
                    // Better validation: ensure user exists? we did that connection start.
                    try {
                        const { analyticsService } = await import('../services/analytics.service');

                        const stats = await analyticsService.getOverviewStats(userId);
                        const trends = await analyticsService.getEmotionTrends(userId);
                        // const recent = await analyticsService.getRecentConversations(userId);

                        // Generate AI Profile (heavy operation, maybe trigger separately?)
                        // Let's get last 20 messages for context
                        const historyForProfile = await prisma.conversation.findMany({
                            where: { userId, role: 'user' },
                            orderBy: { timestamp: 'desc' },
                            take: 20,
                            select: { content: true, emotion: true }
                        });

                        const insights = await aiService.generatePsychologicalProfile(historyForProfile);

                        ws.send(JSON.stringify({
                            type: 'analytics_update',
                            stats,
                            trends,
                            insights
                        }));
                    } catch (err) {
                        console.error('Analytics Error:', err);
                        ws.send(JSON.stringify({ type: 'error', error: 'Failed to fetch analytics' }));
                    }
                    return;
                }

                if (parsed.type === 'get_network_data') {
                    try {
                        const { analyticsService } = await import('../services/analytics.service');
                        const graphData = await analyticsService.getNetworkGraphData(userId);

                        ws.send(JSON.stringify({
                            type: 'network_data',
                            data: graphData
                        }));
                    } catch (err) {
                        console.error('Network Graph Error:', err);
                        ws.send(JSON.stringify({ type: 'error', error: 'Failed to fetch network data' }));
                    }
                    return;
                }

                if (parsed.type === 'get_advanced_analytics') {
                    try {
                        const { analyticsService } = await import('../services/analytics.service');
                        const advancedData = await analyticsService.getAdvancedAnalytics(userId);

                        ws.send(JSON.stringify({
                            type: 'advanced_analytics',
                            data: advancedData
                        }));
                    } catch (err) {
                        console.error('Advanced Analytics Error:', err);
                        ws.send(JSON.stringify({ type: 'error', error: 'Failed to fetch advanced analytics' }));
                    }
                    return;
                }

                // --- Handle Chat Messages ---
                // Expecting type: 'text' (or default)
                // If message content is present, process it
                const text = parsed.content || '';
                const voiceEnabled = parsed.voiceEnabled !== undefined ? parsed.voiceEnabled : true;

                if (!text) return;
                if (!currentSessionId) {
                    // Fail-safe: create session if missing
                    const newSession = await prisma.chatSession.create({
                        data: { userId, title: text.substring(0, 30) }
                    });
                    currentSessionId = newSession.id;
                    await sendSessions();
                }

                console.log(`Received: ${text} (Session: ${currentSessionId})`);

                // Save user message with Phase 2 emotion detection (quick)
                const quickEmotionAnalysis = emotionService.detectEmotion(text);
                const userMessageRecord = await saveEnhancedMessage(userId, currentSessionId, {
                    userMessage: text,
                    emotion: quickEmotionAnalysis.emotion,
                    intensity: quickEmotionAnalysis.intensity
                });

                // Update Session Title if it's the first message and title is "New Chat"
                const session = await prisma.chatSession.findUnique({ where: { id: currentSessionId } });
                if (session && session.title === 'New Chat') {
                    await prisma.chatSession.update({
                        where: { id: currentSessionId },
                        data: { title: text.substring(0, 20) + (text.length > 20 ? '...' : '') }
                    });
                    await sendSessions();
                }

                // Update session timestamp
                await prisma.chatSession.update({
                    where: { id: currentSessionId },
                    data: { updatedAt: new Date() }
                });

                // Get conversation history for Phase 3 analysis
                const history = await prisma.conversation.findMany({
                    where: { userId, sessionId: currentSessionId },
                    orderBy: { timestamp: 'asc' },
                    take: 20
                });

                const formattedContext = history.map((h: any) => ({ 
                    role: h.role, 
                    content: h.content,
                    emotion: h.emotion,
                    intensity: h.emotionIntensity
                }));

                // === PHASE 3: Advanced Analysis ===
                const analysis = await processMessageWithAdvancedAnalysis(
                    userId,
                    text,
                    formattedContext,
                    currentSessionId
                );

                // Handle Crisis Response
                if (analysis.type === 'crisis') {
                    console.warn(`CRISIS DETECTED: Severity ${analysis.severity}`);
                    
                    // Save crisis incident to database
                    await prisma.conversation.create({
                        data: {
                            userId,
                            sessionId: currentSessionId,
                            role: 'system',
                            content: `CRISIS_ALERT: ${analysis.severity}`,
                            crisis_detected: true,
                            crisis_severity: analysis.severity
                        } as any
                    }).catch(err => console.warn('Failed to log crisis:', err));

                    ws.send(JSON.stringify({
                        type: 'crisis_alert',
                        severity: analysis.severity,
                        message: analysis.message,
                        resources: analysis.resources,
                        actions: analysis.actions,
                        timestamp: new Date().toISOString()
                    }));
                    return;
                }

                // === Normal Flow: Generate AI Response with Therapy Context ===
                const systemPrompt = buildSystemPrompt(
                    analysis.therapy?.mode || 'support',
                    analysis.memory
                );

                const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
                    { role: 'system', content: systemPrompt },
                    ...formattedContext.map(ctx => ({
                        role: (ctx.role === 'user' || ctx.role === 'assistant' ? ctx.role : 'user') as 'user' | 'assistant',
                        content: ctx.content || ''
                    })),
                    { role: 'user', content: text }
                ];

                let fullResponse = '';

                try {
                    const stream = await aiService.getResponseStream(messages);

                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            fullResponse += content;
                            // Send streaming chunk to client in real-time
                            ws.send(JSON.stringify({
                                type: 'stream',
                                content: content,
                                timestamp: new Date().toISOString()
                            }));
                        }
                    }
                } catch (error) {
                    console.error('AI response error:', error);
                    fullResponse = analysis.therapy?.response || 'I appreciate you sharing that with me. Let\'s continue our conversation.';
                }

                // Save AI response with Phase 3 therapy data
                await saveAIResponse(userId, currentSessionId, {
                    aiResponse: fullResponse,
                    therapyMode: analysis.therapy?.mode,
                    therapyTechnique: analysis.therapy?.technique,
                    exercise: analysis.therapy?.exercise
                });

                // Update user message with advanced analysis results
                await prisma.conversation.update({
                    where: { id: userMessageRecord.id },
                    data: {
                        emotion: analysis.emotion,
                        emotionIntensity: analysis.intensity,
                        method: analysis.method,
                        valence: analysis.valence,
                        arousal: analysis.arousal,
                        triggers: analysis.triggers ? JSON.stringify(analysis.triggers) : undefined,
                        cognitive_distortions: analysis.distortions ? JSON.stringify(analysis.distortions) : undefined
                    } as any
                }).catch(err => console.warn('Failed to update message with analysis:', err));

                // Send response with Phase 3 enriched data
                ws.send(JSON.stringify({
                    type: 'text',
                    content: fullResponse,
                    emotion: analysis.emotion,
                    emotion_intensity: analysis.intensity,
                    confidence: analysis.confidence,
                    method: analysis.method,
                    valence: analysis.valence,
                    arousal: analysis.arousal,
                    triggers: analysis.triggers,
                    distortions: analysis.distortions,
                    therapy_mode: analysis.therapy?.mode,
                    therapy_technique: analysis.therapy?.technique,
                    exercise: analysis.therapy?.exercise,
                    timestamp: new Date().toISOString(),
                    sessionId: currentSessionId
                }));

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
