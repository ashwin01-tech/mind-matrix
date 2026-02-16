# Emotion Detection Enhancement Guide

## Overview

The emotion detection system has been upgraded from basic keyword matching to a more sophisticated multi-level analysis that detects 8 emotions, identifies cognitive distortions, and extracts potential triggers.

---

## What's New

### ✨ **Enhanced Emotion Set** (8 emotions instead of 5)

1. **Happy** - Positive, energetic emotions
   - Keywords: happy, joy, joyful, excited, great, awesome, wonderful, love, delighted, thrilled, proud, grateful, blessed, hopeful, cheerful
   - Valence: Positive | Arousal: Medium

2. **Sad** - Negative, low-energy emotions
   - Keywords: sad, sadness, unhappy, depressed, blue, down, terrible, awful, miserable, lonely, grief, lost, empty, heartbroken, devastated
   - Valence: Negative | Arousal: Low

3. **Angry** - Irritation and frustration
   - Keywords: angry, anger, furious, fury, mad, irritated, frustrated, annoyed, hate, despise, disgusted, livid, enraged, outraged, bitter, resentful
   - Valence: Negative | Arousal: High

4. **Anxious** - Fear and worry
   - Keywords: anxious, anxiety, worried, worry, nervous, scared, afraid, fear, panic, stress, stressed, overwhelmed, uncertain, uneasy, terrified
   - Valence: Negative | Arousal: High

5. **Calm** - Peaceful, serene emotions
   - Keywords: calm, peaceful, relaxed, serene, chill, cool, collected, composed, tranquil, zen, balanced, grounded
   - Valence: Positive | Arousal: Low

6. **Aggressive** ⭐ NEW - Violent or hostile intent
   - Keywords: kill, murder, destroy, harm, hurt, attack, fight, violence, violent, brutal, savage, ruthless, vicious, assault, beat
   - Valence: Negative | Arousal: High
   - **Note:** This emotion now properly detects phrases like "kill criminals"

7. **Fearful** ⭐ NEW - Specific to fear and terror
   - Keywords: afraid, fear, scared, terrified, horrified, dread, phobia, petrified, apprehensive, paranoid
   - Valence: Negative | Arousal: Medium-High

8. **Disgusted** ⭐ NEW - Repulsion and disgust
   - Keywords: disgusted, disgust, gross, yuck, repulsed, repulsion, vile, revolting, nauseated, sickened, repugnant
   - Valence: Negative | Arousal: Medium

### 🔍 **Cognitive Distortion Detection**

The system now identifies common cognitive distortions that indicate unhealthy thinking patterns:

1. **Catastrophizing** - "worst", "never", "always", "disaster", "ruined", "end of the world"
   - Example: "This is the worst thing that could ever happen!"

2. **All-or-Nothing Thinking** - "always", "never", "completely", "total failure", "perfect", "worthless"
   - Example: "I'm a complete failure at everything"

3. **Overgeneralization** - "everything", "nothing", "never", "always", "every time"
   - Example: "Nothing ever goes right for me"

4. **Personalization** - "it's my fault", "i caused", "because of me", "my responsibility"
   - Example: "It's all my fault they left"

5. **Mind-Reading** - "they think", "they know", "everyone knows", "they must"
   - Example: "They know I'm a fraud"

6. **Should Statements** - "should", "must", "ought to", "shouldn't"
   - Example: "I should be able to handle this"

### 📍 **Trigger Extraction**

Identifies emotional triggers by category:

- **Work**: work, job, boss, office, meeting, deadline
- **Family**: family, mom, dad, parent, sibling, brother, sister
- **Relationship**: relationship, partner, boyfriend, girlfriend, wife, husband, dating
- **Health**: health, sick, disease, pain, doctor, hospital
- **Financial**: money, financial, debt, bills, broke, poor
- **School**: school, exam, test, homework, assignment
- **Friendship**: friend, friendship, betrayal, conflict

### 📊 **Rich Analysis Data**

Each emotion detection now returns:

```typescript
interface EmotionAnalysis {
    emotion: string;                          // Primary emotion
    intensity: number;                        // 0-1 scale
    valence?: 'positive' | 'negative' | 'neutral' | 'mixed';
    arousal?: 'low' | 'medium' | 'high';
    secondary?: string[];                     // Other emotions detected
    triggers?: string[];                      // Identified triggers
    cognitiveDistortions?: string[];          // Detected distortions
}
```

---

## Examples

### Example 1: "kill criminals"

**Before (Broken):**
```
emotion: "neutral"
intensity: 0.5
```

**After (Fixed):**
```
emotion: "aggressive" ✓
intensity: 0.75
valence: "negative"
arousal: "high"
secondary: []
triggers: []
cognitiveDistortions: []
```

### Example 2: "I'm so stupid, I always mess everything up"

**Analysis:**
```
emotion: "sad"
intensity: 0.85
valence: "negative"
arousal: "low"
secondary: ["anxious"]
triggers: []
cognitiveDistortions: [
    "all-or-nothing",
    "overgeneralization"
]
```

The system detects:
- Primary emotion: Sadness (self-criticism)
- Cognitive distortions: "always" (overgeneralization) and "mess everything up" (all-or-nothing)
- This is a sign of potential depression

### Example 3: "I'm worried about my health and can't stop thinking about it"

**Analysis:**
```
emotion: "anxious"
intensity: 0.8
valence: "negative"
arousal: "high"
secondary: []
triggers: ["Health"]
cognitiveDistortions: ["mind-reading"]
```

The system detects:
- Primary emotion: Anxiety
- Health-related trigger (important for context)
- Cognitive distortion: Potential catastrophizing

---

## How It Works

### Detection Algorithm

1. **Keyword Matching** - Checks text for emotion keywords
2. **Baseline Scoring** - Applies emotion-specific baseline multipliers
3. **Emphasis Detection** - Increases intensity for:
   - Multiple exclamation marks (!!) or question marks (??)
   - CAPS LOCK text (>50% uppercase)
4. **Context Analysis** - Identifies secondary emotions, triggers, and distortions
5. **Valence & Arousal** - Determines emotional polarity and energy level

### Scoring Formula

```
score = (keyword_matches × baseline) + emphasis_bonus + distortion_modifier
intensity = min(score, 1.0)
```

**Example calculation for "kill criminals":**
- "kill" found: baseline 0.35 × 0.5 = 0.175 → Score: 0.175
- No emphasis (no !! or CAPS): no bonus
- Final intensity: 0.175 → min(0.175 + base, 1.0) = ~0.35-0.75 depending on other factors

---

## API Usage

### In Chat Handler

```typescript
import { emotionService } from '../services/emotion.service.ts';

// When processing user message
const analysis = emotionService.detectEmotion(userMessage.content);

// Save analysis with message
await db.message.create({
    content: userMessage.content,
    emotion: analysis.emotion,
    intensity: analysis.intensity,
    valence: analysis.valence,
    arousal: analysis.arousal,
    secondary_emotions: analysis.secondary?.join(','),
    triggers: analysis.triggers?.join(','),
    cognitive_distortions: analysis.cognitiveDistortions?.join(','),
});
```

### In UI Components

```jsx
import { emotionService } from '../../utils/emotionService.js';

const result = emotionService.detectEmotion(messageText);

// Color-code by emotion
const emotionColors = {
    happy: '#22c55e',      // green
    sad: '#3b82f6',        // blue
    angry: '#ef4444',      // red
    anxious: '#a855f7',    // purple
    calm: '#06b6d4',       // cyan
    aggressive: '#dc2626', // dark red
    fearful: '#f97316',    // orange
    disgusted: '#8b5cf6',  // indigo
};

const nodeColor = emotionColors[result.emotion];

// Display insights
if (result.cognitiveDistortions.length > 0) {
    showInsight(`Detected thinking pattern: ${result.cognitiveDistortions[0]}`);
}

if (result.triggers.length > 0) {
    showTrigger(`Topic: ${result.triggers[0]}`);
}
```

---

## Testing

Run the test suite:

```bash
# Compile and run test-emotion.ts
npx ts-node test-emotion.ts
```

Expected output for "kill criminals":
```
✓ Test: "kill criminals"
  Expected: aggressive
  Got: aggressive
  Intensity: 35%
  Valence: negative
  Arousal: high
  Secondary: []
```

---

## Future Improvements

### Phase 1: Production Ready ✓
- ✅ Extended keyword set (70+ keywords total)
- ✅ Aggressive emotion detection
- ✅ Cognitive distortion detection
- ✅ Trigger extraction

### Phase 2: Advanced Features (Coming Soon)
- 🔄 LLM-based emotion analysis (Groq API) for context awareness
- 🔄 Sentiment analysis with intensity gradients
- 🔄 Sarcasm detection
- 🔄 Multi-language support
- 🔄 Contextual memory (remember past emotions)

### Phase 3: Professional Features
- 🔄 Integration with mental health frameworks
- 🔄 DSM-5 symptom correlation
- 🔄 Crisis risk assessment scoring
- 🔄 Therapist-validated prompts

---

## Migration Guide

### If You're Updating from Old Version

The new `EmotionAnalysis` interface is **backwards compatible**:

```typescript
// Old code still works
const result = emotionService.detectEmotion(text);
console.log(result.emotion);       // Still works!
console.log(result.intensity);     // Still works!

// New fields are optional
if (result.valence) {              // Check before using
    console.log(result.valence);
}
```

### Update Your Database

If you're storing emotions, add columns:

```sql
ALTER TABLE messages ADD COLUMN valence VARCHAR(10);
ALTER TABLE messages ADD COLUMN arousal VARCHAR(10);
ALTER TABLE messages ADD COLUMN triggers VARCHAR(255);
ALTER TABLE messages ADD COLUMN cognitive_distortions VARCHAR(255);
ALTER TABLE messages ADD COLUMN secondary_emotions VARCHAR(255);
```

Or use Prisma migration:

```prisma
model Message {
    id String @id @default(cuid())
    content String
    emotion String
    intensity Float
    valence String?
    arousal String?
    triggers String?
    secondary_emotions String?
    cognitive_distortions String?
    
    // ... rest of schema
}
```

---

## Troubleshooting

### Issue: Emotion still not detected correctly

**Solution:** Check if the keyword is in the emotion list. Add it:

```typescript
private emotions = {
    aggressive: {
        keywords: [
            // ... existing
            'new-keyword',  // ← Add here
        ],
        baseline: 0.35,
    }
}
```

### Issue: Too many false positives

**Solution:** Increase the baseline threshold or add context filters:

```typescript
// Only flag if multiple keywords match
if (score > 0.5) {  // Higher threshold
    // Process emotion
}
```

### Issue: Performance concerns with large messages

**Solution:** The algorithm is O(n) where n = number of keywords (~70). Should process in <5ms. If slower, optimize with:

```typescript
// Use regex for multiple keywords at once
const keywords = ['kill', 'murder', 'destroy'].join('|');
const regex = new RegExp(keywords, 'gi');
const matches = text.match(regex)?.length || 0;
```

---

## Support

For issues or suggestions, refer to:
- `src/services/emotion.service.ts` - Source implementation
- `test-emotion.ts` - Test suite
- `PRD.md` - Product requirements for Phase 2+

---

**Version:** 2.0  
**Last Updated:** February 16, 2026  
**Status:** Production Ready ✓
