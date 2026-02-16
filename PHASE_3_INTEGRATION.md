# Phase 3 Integration Guide

**Purpose:** How to integrate Phase 3 services into the existing chat system  
**Status:** Ready for implementation  
**Estimated Integration Time:** 2-3 hours  

---

## 🔗 Integration Overview

```
┌─────────────────────────────────────────────────────┐
│            WebSocket Chat Handler                  │
└─────────────────────────────────────────────────────┘
            │
            ├─→ EmotionService (Phase 2 - Keyword)
            │
            ├─→ EmotionAIService (Phase 3 - LLM) ⭐ NEW
            │   ├─ Analyzes with context
            │   ├─ Generates insights
            │   └─ Assesses crisis risk
            │
            ├─→ CrisisService (Phase 3) ⭐ NEW
            │   ├─ Detects crisis indicators
            │   ├─ Returns resources
            │   └─ Generates safety plan
            │
            ├─→ MemoryService (Phase 3) ⭐ NEW
            │   ├─ Builds user profile
            │   ├─ Gets conversation context
            │   └─ Extracts themes
            │
            ├─→ TherapyService (Phase 3) ⭐ NEW
            │   ├─ Determines conversation mode
            │   ├─ Generates therapy response
            │   └─ Provides exercises
            │
            ├─→ AIService (Phase 1-2)
            │   └─ Generates final response
            │
            └─→ Database
                └─ Saves message with enhanced data
```

---

## 📋 Step-by-Step Integration

### Step 1: Update Imports in chat.handler.ts

```typescript
// Add these imports at the top of chat.handler.ts
import emotionAIService from '../services/emotion-ai.service';
import crisisDetectionService from '../services/crisis.service';
import memoryService from '../services/memory.service';
import therapyService from '../services/therapy.service';
```

### Step 2: Create Helper Function

Add this function to chat.handler.ts:

```typescript
/**
 * Process message with Phase 3 advanced analysis
 */
async function processMessageWithAdvancedAnalysis(
  userId: string,
  messageContent: string,
  conversationHistory: any[]
) {
  // 1. Quick emotion check (Phase 2 - fast)
  const quickAnalysis = emotionService.detectEmotion(messageContent);
  
  // 2. Advanced LLM analysis (Phase 3 - context-aware)
  const advancedAnalysis = await emotionAIService.analyzeEmotion(
    messageContent,
    conversationHistory
  );
  
  // 3. Crisis detection (critical)
  const crisisCheck = crisisDetectionService.detectCrisis(messageContent);
  if (crisisCheck.is_crisis) {
    return {
      type: 'crisis',
      severity: crisisCheck.severity,
      message: crisisCheck.message,
      resources: crisisCheck.resources,
      actions: crisisCheck.immediate_actions
    };
  }
  
  // 4. Get user memory and context
  const userMemory = memoryService.buildUserMemory(userId, conversationHistory);
  const context = memoryService.getConversationContext(conversationHistory, 5);
  
  // 5. Generate therapeutic response
  const therapyContext = {
    userEmotion: advancedAnalysis.emotion,
    emotionIntensity: advancedAnalysis.intensity,
    cognitiveDistortions: advancedAnalysis.cognitiveDistortions || [],
    triggers: advancedAnalysis.triggers || [],
    previousGoals: userMemory.effectiveCopingStrategies,
    conversationHistory
  };
  
  const therapyResponse = await therapyService.generateTherapyResponse(therapyContext);
  
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
```

### Step 3: Update Chat Message Handler

Find the message handler in `chat.handler.ts` and update it:

```typescript
// In the handleChatMessage function
async function handleChatMessage(message: string, userId: string) {
  try {
    // Get conversation history
    const conversationHistory = await getConversationHistory(userId, 10);
    
    // Process with Phase 3 analysis ⭐ NEW
    const analysis = await processMessageWithAdvancedAnalysis(
      userId,
      message,
      conversationHistory
    );
    
    // If crisis detected, return resources immediately
    if (analysis.type === 'crisis') {
      await socket.emit('crisis_alert', {
        message: analysis.message,
        resources: analysis.resources,
        actions: analysis.actions,
        severity: analysis.severity
      });
      
      // Log crisis incident
      await logCrisisIncident(userId, message, analysis.severity);
      return;
    }
    
    // Normal flow - generate AI response with therapy context
    const systemPrompt = buildSystemPrompt(
      analysis.therapy.mode,
      analysis.memory
    );
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(h => ({ 
        role: h.role, 
        content: h.content 
      })),
      { role: 'user', content: message }
    ];
    
    // Stream response
    const stream = await aiService.getResponseStream(messages);
    let fullResponse = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        socket.emit('response_chunk', { content });
      }
    }
    
    // Save message with enhanced data ⭐ NEW
    await saveEnhancedMessage(userId, {
      userMessage: message,
      aiResponse: fullResponse,
      emotion: analysis.emotion,
      intensity: analysis.intensity,
      confidence: analysis.confidence,
      method: analysis.method,
      valence: analysis.valence,
      arousal: analysis.arousal,
      triggers: analysis.triggers,
      distortions: analysis.distortions,
      therapy_mode: analysis.therapy.mode,
      therapy_technique: analysis.therapy.technique,
      exercise: analysis.therapy.exercise
    });
    
    // Send completion
    socket.emit('response_complete', {
      emotion: analysis.emotion,
      intensity: analysis.intensity,
      therapy_mode: analysis.therapy.mode
    });
    
  } catch (error) {
    console.error('Error in chat handler:', error);
    socket.emit('error', { message: 'Error processing message' });
  }
}
```

### Step 4: Create Helper: Build System Prompt

```typescript
function buildSystemPrompt(therapyMode: string, userMemory: any): string {
  const modeInstructions = {
    crisis: 'Focus on immediate safety and support. Provide crisis resources.',
    exploration: 'Use Socratic questioning to help user explore their feelings.',
    support: 'Validate their emotions and provide empathy and support.',
    skills: 'Teach practical coping skills and psychological techniques.'
  };
  
  const basePrompt = `You are a compassionate AI mental health companion. Your role is to provide supportive, evidence-based responses using psychological principles.

${modeInstructions[therapyMode] || modeInstructions.support}

User Context:
- Most common emotions: ${Object.keys(userMemory.frequentEmotions).join(', ')}
- Frequent triggers: ${Object.keys(userMemory.commonTriggers).join(', ')}
- Effective strategies: ${userMemory.effectiveCopingStrategies.join(', ')}

Important:
- Be warm, empathetic, and non-judgmental
- Use evidence-based techniques (CBT, DBT, MI)
- Validate their feelings
- Never promise to replace professional help
- If crisis language detected, prioritize safety
- Keep responses concise (2-3 paragraphs max)
- Ask thoughtful follow-up questions`;

  return basePrompt;
}
```

### Step 5: Create Helper: Save Enhanced Message

```typescript
async function saveEnhancedMessage(userId: string, data: any) {
  const message = await prisma.message.create({
    data: {
      userId,
      content: data.userMessage,
      emotion: data.emotion,
      intensity: data.intensity,
      confidence: data.confidence,
      method: data.method,
      valence: data.valence,
      arousal: data.arousal,
      triggers: JSON.stringify(data.triggers || []),
      cognitive_distortions: JSON.stringify(data.distortions || []),
      crisis_detected: false,
      // Add fields for therapy info if needed
    }
  });
  
  // Also save AI response
  const response = await prisma.message.create({
    data: {
      userId,
      content: data.aiResponse,
      role: 'assistant',
      emotion: data.therapyMode,
      // Add other AI response data
    }
  });
  
  return { message, response };
}
```

---

## 🧪 Testing Integration

### Test 1: Verify Services Load

```typescript
// In a test file
import emotionAIService from './src/services/emotion-ai.service';
import crisisDetectionService from './src/services/crisis.service';
import memoryService from './src/services/memory.service';
import therapyService from './src/services/therapy.service';

test('services initialize correctly', () => {
  expect(emotionAIService).toBeDefined();
  expect(crisisDetectionService).toBeDefined();
  expect(memoryService).toBeDefined();
  expect(therapyService).toBeDefined();
});
```

### Test 2: End-to-End Message Flow

```typescript
test('message flows through all services', async () => {
  const userId = 'test-user';
  const message = 'I\'m feeling anxious about work';
  
  const analysis = await processMessageWithAdvancedAnalysis(
    userId,
    message,
    []
  );
  
  expect(analysis.type).toBe('normal');
  expect(analysis.emotion).toBe('anxious');
  expect(analysis.therapy.mode).toMatch(/support|exploration|skills/);
  expect(analysis.therapy.technique).toBeDefined();
});
```

### Test 3: Crisis Detection

```typescript
test('crisis message triggers proper response', async () => {
  const analysis = await processMessageWithAdvancedAnalysis(
    'test-user',
    'I want to kill myself',
    []
  );
  
  expect(analysis.type).toBe('crisis');
  expect(analysis.severity).toBe('critical');
  expect(analysis.resources.length).toBeGreaterThan(0);
});
```

---

## 📊 Database Migration

### Prisma Schema Update

```prisma
// In prisma/schema.prisma
model Message {
  id            String    @id @default(cuid())
  content       String
  role          String    @default("user") // "user" or "assistant"
  userId        String
  
  // Phase 2: Emotion
  emotion       String    @default("neutral")
  intensity     Float     @default(0.5)
  valence       String?
  arousal       String?
  
  // Phase 3: Advanced Analysis
  confidence    Float?    // LLM confidence 0-1
  method        String?   // "llm" or "keyword"
  triggers      String?   // JSON: ["Work", "Health"]
  cognitive_distortions String? // JSON array
  secondary_emotions String? // JSON array
  psychological_state String?
  
  // Phase 3: Therapy
  therapy_mode      String? // "crisis", "exploration", "support", "skills"
  therapy_technique String?
  exercise          String? // JSON with exercise data
  
  // Phase 3: Crisis
  crisis_detected       Boolean @default(false)
  crisis_severity       String? // "low", "medium", "high", "critical"
  safety_plan_offered   Boolean @default(false)
  
  // Metadata
  createdAt     DateTime  @default(now())
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
}
```

### Run Migration

```bash
npx prisma migrate dev --name add_phase3_fields
```

---

## 🔄 Error Handling

The services include built-in error handling:

```typescript
// LLM fails → falls back to keyword
try {
  return await analyzeWithLLM(...);
} catch (error) {
  console.warn('LLM failed, using keyword analysis');
  return analyzeWithKeywords(...);
}

// If memory service fails, continue without context
try {
  const memory = memoryService.buildUserMemory(...);
  // Use memory...
} catch (error) {
  console.warn('Memory service error, continuing without context');
  // Continue with default values
}
```

---

## 🚀 Deployment Checklist

Before deploying Phase 3:

- [ ] All 4 services compile without errors
- [ ] Database migrations created
- [ ] Schema updates tested
- [ ] Integration tests pass
- [ ] Error handling verified
- [ ] Groq API key configured
- [ ] WebSocket handler updated
- [ ] Message saving logic updated
- [ ] Logging set up
- [ ] Rate limiting configured
- [ ] Crisis resources reviewed
- [ ] Load testing completed

---

## 📈 Performance Considerations

### Optimization Tips

1. **Cache user memory** - Don't rebuild on every message
2. **Limit LLM calls** - Use keyword analysis when fast enough
3. **Batch database writes** - Combine multiple saves
4. **Rate limit LLM** - Prevent API costs from exploding
5. **Monitor response times** - LLM analysis may take 2-3 seconds

### Example Caching

```typescript
const userMemoryCache = new Map();

async function getCachedMemory(userId: string) {
  if (userMemoryCache.has(userId)) {
    const cached = userMemoryCache.get(userId);
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 min cache
      return cached.memory;
    }
  }
  
  const memory = memoryService.buildUserMemory(userId, messages);
  userMemoryCache.set(userId, { memory, timestamp: Date.now() });
  return memory;
}
```

---

## 🐛 Common Issues & Solutions

### Issue: "Module has no default export"
**Solution:** Import using destructuring: `import { service } from './service'`

### Issue: LLM taking too long
**Solution:** Add timeout fallback to keyword analysis

```typescript
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('LLM timeout')), 5000)
);

try {
  return await Promise.race([analyzeLLM(), timeout]);
} catch {
  return analyzeKeywords();
}
```

### Issue: Database mutation too slow
**Solution:** Use batch operations or async queues

---

## 📚 Additional Resources

- `PHASE_3_COMPLETE.md` - Full Phase 3 documentation
- `EMOTION_DETECTION_GUIDE.md` - Enhanced emotion detection
- `IMPLEMENTATION_CHECKLIST.md` - Overall roadmap
- PRD.md` - Product requirements

---

**Status:** Ready for Integration  
**Estimated Time:** 2-3 hours  
**Difficulty:** Medium  
**Priority:** High (core to platform)

🔗 Let's integrate Phase 3!
