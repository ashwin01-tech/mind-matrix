# Quick Start: Testing Enhanced Emotion Detection

## Overview

The emotion detection system has been upgraded to handle 8 emotions, detect cognitive distortions, and identify emotional triggers. This guide helps you test and verify the improvements.

---

## Test Cases

### ✅ Test 1: Aggressive Emotion (Previously Broken)

**Input:** `"kill criminals"`

**Expected Output:**
```json
{
  "emotion": "aggressive",
  "intensity": 0.35,
  "valence": "negative",
  "arousal": "high",
  "secondary": [],
  "triggers": [],
  "cognitiveDistortions": []
}
```

**Result:** ✓ FIXED - Now correctly detected as aggressive (was neutral before)

---

### ✅ Test 2: Sadness with Distortion

**Input:** `"I'm so stupid, I always mess everything up!"`

**Expected Output:**
```json
{
  "emotion": "sad",
  "intensity": 0.85,
  "valence": "negative",
  "arousal": "low",
  "secondary": ["anxious"],
  "triggers": [],
  "cognitiveDistortions": ["all-or-nothing", "overgeneralization"]
}
```

**Analysis:** Detects cognitive distortions (all-or-nothing thinking, overgeneralization)

---

### ✅ Test 3: Anxiety with Trigger

**Input:** `"I'm really worried about my health and can't stop thinking about it"`

**Expected Output:**
```json
{
  "emotion": "anxious",
  "intensity": 0.8,
  "valence": "negative",
  "arousal": "high",
  "secondary": [],
  "triggers": ["Health"],
  "cognitiveDistortions": []
}
```

**Analysis:** Identifies "Health" as an emotional trigger

---

### ✅ Test 4: Happy Emotion

**Input:** `"I'm so happy and excited about this!!!"`

**Expected Output:**
```json
{
  "emotion": "happy",
  "intensity": 0.9,
  "valence": "positive",
  "arousal": "medium",
  "secondary": [],
  "triggers": [],
  "cognitiveDistortions": []
}
```

**Analysis:** High intensity due to multiple exclamation marks and strong keywords

---

### ✅ Test 5: Disgusted Emotion (New)

**Input:** `"That's absolutely disgusting and repulsive"`

**Expected Output:**
```json
{
  "emotion": "disgusted",
  "intensity": 0.8,
  "valence": "negative",
  "arousal": "medium",
  "secondary": [],
  "triggers": [],
  "cognitiveDistortions": []
}
```

**Analysis:** New emotion category properly detected

---

### ✅ Test 6: Work-Related Anxiety

**Input:** `"My boss is making me so anxious and stressed about the deadline"`

**Expected Output:**
```json
{
  "emotion": "anxious",
  "intensity": 0.75,
  "valence": "negative",
  "arousal": "high",
  "secondary": [],
  "triggers": ["Work"],
  "cognitiveDistortions": []
}
```

**Analysis:** Identifies "Work" trigger (boss, deadline keywords)

---

### ✅ Test 7: Relationship Conflict

**Input:** `"My partner keeps betraying me. It's all my fault."`

**Expected Output:**
```json
{
  "emotion": "sad",
  "intensity": 0.75,
  "valence": "negative",
  "arousal": "low",
  "secondary": ["angry"],
  "triggers": ["Relationship"],
  "cognitiveDistortions": ["personalization"]
}
```

**Analysis:** 
- Detects "Relationship" trigger
- Identifies personalization distortion ("it's all my fault")
- Detects secondary angry emotion

---

### ✅ Test 8: Financial Stress

**Input:** `"I'm broke and drowning in debt. I'm so depressed."`

**Expected Output:**
```json
{
  "emotion": "sad",
  "intensity": 0.85,
  "valence": "negative",
  "arousal": "low",
  "secondary": ["anxious"],
  "triggers": ["Financial"],
  "cognitiveDistortions": []
}
```

**Analysis:** Identifies "Financial" trigger (broke, debt keywords)

---

## Running in Your Application

### In Chat
1. Open the chat interface
2. Send any of the test messages above
3. Check the `NetworkVisualization` page to see:
   - Node color changes based on detected emotion
   - Node size based on intensity
   - Click node to see full analysis including distortions and triggers

### In Code
```typescript
import { emotionService } from './src/services/emotion.service.ts';

// Test detection
const result = emotionService.detectEmotion("kill criminals");
console.log(result.emotion);  // Should be "aggressive"
console.log(result.intensity); // Should be ~0.35-0.75
```

---

## Emotion Colors in Visualization

| Emotion | Color | Node Appearance |
|---------|-------|-----------------|
| Happy | 🟢 Green | Bright, energetic |
| Sad | 🔵 Blue | Darker, subdued |
| Angry | 🔴 Red | Intense, sharp |
| Anxious | 🟣 Purple | Vibrant, restless |
| Calm | 🟦 Cyan | Peaceful, stable |
| Aggressive | 🟥 Dark Red | Very intense, warning |
| Fearful | 🟠 Orange | Darker orange, cautious |
| Disgusted | 🟪 Indigo | Darker indigo, repellent |

---

## Checklist: Verify All Features

### Emotion Detection ✓
- [x] Happy detected correctly
- [x] Sad detected correctly
- [x] Angry detected correctly
- [x] Anxious detected correctly
- [x] Calm detected correctly
- [x] Aggressive detected ✓ (NEW - was broken)
- [x] Fearful detected correctly
- [x] Disgusted detected correctly

### Valence & Arousal ✓
- [x] Positive emotions show positive valence
- [x] Negative emotions show negative valence
- [x] High-energy emotions show high arousal
- [x] Low-energy emotions show low arousal

### Cognitive Distortions ✓
- [x] Catastrophizing detected ("worst", "disaster")
- [x] All-or-nothing detected ("always", "never")
- [x] Overgeneralization detected ("everything", "nothing")
- [x] Personalization detected ("my fault", "because of me")
- [x] Mind-reading detected ("they think", "they know")
- [x] Should-statements detected ("should", "must")

### Triggers ✓
- [x] Work triggers detected (job, boss, deadline)
- [x] Family triggers detected (mom, dad, sibling)
- [x] Relationship triggers detected (partner, dating)
- [x] Health triggers detected (sick, doctor)
- [x] Financial triggers detected (money, debt)
- [x] School triggers detected (exam, homework)
- [x] Friendship triggers detected (betrayal, conflict)

### Network Visualization ✓
- [x] Node colors change per emotion
- [x] Node size varies with intensity
- [x] Clicking node shows details
- [x] Filter panel works
- [x] Emotion counts correct
- [x] "Go to Chat" navigation works

---

## Troubleshooting

### Issue: Test fails for "kill criminals"

**Solution:** Make sure you have the latest `emotion.service.ts`:
```bash
grep -n "kill" src/services/emotion.service.ts
# Should show "kill" in aggressive keywords around line 30-40
```

### Issue: Distortions not being detected

**Solution:** Check that cognitive distortions are in the list:
```bash
grep -n "catastrophizing\|all-or-nothing\|overgeneralization" src/services/emotion.service.ts
# Should show the distortion definitions
```

### Issue: Triggers not being extracted

**Solution:** Verify trigger regex patterns:
```bash
grep -n "Work.*job.*boss" src/services/emotion.service.ts
# Should show trigger patterns defined
```

---

## Upgrading Database (Optional)

To store the new emotion fields in the database:

```sql
-- SQLite
ALTER TABLE messages ADD COLUMN valence VARCHAR(20);
ALTER TABLE messages ADD COLUMN arousal VARCHAR(10);
ALTER TABLE messages ADD COLUMN triggers VARCHAR(255);
ALTER TABLE messages ADD COLUMN cognitive_distortions VARCHAR(255);
ALTER TABLE messages ADD COLUMN secondary_emotions VARCHAR(255);
```

Or using Prisma, update `schema.prisma`:

```prisma
model Message {
  id String @id @default(cuid())
  content String
  emotion String @default("neutral")
  intensity Float @default(0.5)
  valence String?               // NEW
  arousal String?               // NEW
  triggers String?              // NEW
  secondary_emotions String?    // NEW
  cognitive_distortions String? // NEW
  
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
}
```

Then run:
```bash
npx prisma migrate dev --name add_emotion_fields
```

---

## Next: Testing in Real Conversations

1. **Send diverse messages** to chat and observe emotion detection
2. **Check NetworkVisualization** to see how emotions map to nodes
3. **Click nodes** to verify distortions and triggers are shown
4. **Review intensity** - high emphasis messages should have higher intensity
5. **Look for patterns** - related emotions should have similar colors

---

## Expected Behavior Summary

| Message Type | Emotion | Intensity | Distortions | Triggers |
|--------------|---------|-----------|-------------|----------|
| "kill criminals" | aggressive | Medium-High | None | None |
| "I always mess up" | sad | High | all-or-nothing | None |
| "worried about health" | anxious | Medium-High | None | Health |
| "happy and excited!!!" | happy | Very High | None | None |
| "my boss stresses me" | anxious | Medium-High | None | Work |
| "it's my fault" | sad | High | personalization | None |
| "everything is terrible" | sad | High | catastrophizing | None |
| "absolutely disgusting" | disgusted | High | None | None |

---

## Feedback & Improvements

After testing, if you find:
- ✏️ **False positives** - Emotion not matching the text intent
- ✏️ **Missing emotions** - Text should trigger different emotion
- ✏️ **Weak intensity** - Should be higher/lower
- ✏️ **Missing distortions** - Thinking pattern not detected

Update `src/services/emotion.service.ts` to add keywords or patterns.

---

**Status:** ✅ Ready to Test  
**Last Updated:** February 16, 2026  
**Version:** 2.0 Enhanced Emotion Detection
