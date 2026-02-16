# Phase 4: Dashboard & Advanced Features 📊

**Status:** Planning  
**Estimated Timeline:** 2-3 weeks  
**Priority:** High (enables user insights and self-tracking)  
**Date Started:** February 16, 2026

---

## 🎯 Phase 4 Overview

Phase 4 focuses on building user-facing features that leverage the Phase 3 backend intelligence. Users will have visibility into their emotional patterns, tools for self-reflection, and guided interventions.

### Core Components

1. **Enhanced Analytics Dashboard** - Visual representation of emotional patterns
2. **Smart Journaling System** - Guided reflection with prompt suggestions
3. **Guided Exercises Library** - Interactive coping skill practice
4. **Goal Tracking System** - SMART goal management with progress monitoring

---

## 📋 Feature Breakdown

### 1. Enhanced Analytics Dashboard

**Purpose:** Give users insights into their emotional patterns and progress

**Key Metrics:**
- Emotion timeline (last 7/30 days)
- Emotion distribution (pie chart)
- Intensity trends
- Trigger patterns (word cloud)
- Coping strategy effectiveness
- Conversation frequency
- Crisis incidents (if any)
- Session duration trends

**Components to Build:**

```typescript
// New Component: EmotionTimelineChart.jsx
// Props: emotionData, dateRange, onDateRangeChange
// Displays: Line chart of emotion intensity over time

// New Component: EmotionDistributionPie.jsx
// Props: emotionCounts, onEmotionClick
// Displays: Pie chart of emotion frequency

// New Component: TriggersWordCloud.jsx
// Props: triggerData, onTriggerClick
// Displays: Interactive word cloud of common triggers

// New Component: CopingStrategyRanking.jsx
// Props: strategies
// Displays: Ranking of which coping strategies work best

// Enhanced Component: AnalyticsDashboard.jsx
// Integrate all sub-components with filtering options
```

**Database Queries Needed:**
- Get emotion history with timestamps
- Aggregate trigger data
- Calculate coping strategy effectiveness
- Get session statistics

**Implementation Steps:**
1. Add emotion history queries to `analyticsService`
2. Create Chart.js or Recharts components
3. Add date range filtering
4. Implement data export functionality

---

### 2. Smart Journaling System

**Purpose:** Help users reflect on their experiences with guided prompts

**Features:**
- Guided prompts based on emotion and time of day
- CBT worksheet templates
- Prompt suggestions from emotional triggers
- Journal entry tagging
- Full-text search
- Timeline view

**Prompt Templates by Emotion:**

```typescript
// For Anxiety
prompts: [
  "What are you worried about?",
  "What's the worst that could happen? How likely is that?",
  "What would you tell a friend in this situation?",
  "What coping strategies have helped before?"
]

// For Sadness
prompts: [
  "What triggered this feeling?",
  "What do you need right now?",
  "Who can you reach out to?",
  "What small thing could help today?"
]

// For Anger
prompts: [
  "What boundary feels violated?",
  "What need isn't being met?",
  "How can you communicate this?",
  "What would help you feel heard?"
]
```

**Components to Build:**

```typescript
// New Component: JournalPrompt.jsx
// Props: emotion, time, onSubmit
// Displays: Guided prompt with text input

// New Component: CBTWorksheet.jsx
// Props: situation
// Displays: Thought record template
//   - Situation
//   - Automatic thoughts
//   - Evidence for/against
//   - Alternative thoughts
//   - Outcome

// New Component: JournalEntry.jsx
// Props: entry, onDelete, onEdit
// Displays: Journal entry with date, emotion, tags

// New Component: JournalTimeline.jsx
// Props: entries, onEntryClick
// Displays: Timeline of journal entries

// New Component: JournalSearch.jsx
// Props: onSearch
// Displays: Search bar with emotion/tag filters
```

**Database Schema Addition:**

```prisma
model JournalEntry {
  id              Int       @id @default(autoincrement())
  userId          Int
  timestamp       DateTime  @default(now())
  
  content         String    // Main entry text
  emotion         String    // Primary emotion
  intensity       Float     // 0-1
  
  // Optional: CBT Worksheet data
  situation       String?
  automaticThoughts String?
  evidence_for    String?
  evidence_against String?
  alternative_thoughts String?
  outcome         String?
  
  // Tagging and organization
  tags            String    @default("{}") // JSON array
  isPrivate       Boolean   @default(true)
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([timestamp])
  @@index([emotion])
}
```

**Implementation Steps:**
1. Create JournalEntry model in Prisma
2. Add journal endpoints to API
3. Build React components
4. Implement prompt suggestion logic
5. Add full-text search

---

### 3. Guided Exercises Library

**Purpose:** Teach and facilitate coping skills practice

**Exercise Categories:**

| Category | Examples | Duration |
|----------|----------|----------|
| **Breathing** | Box breathing, 4-7-8 technique, diaphragmatic | 2-5 min |
| **Grounding** | 5-4-3-2-1, TIPP technique, body scan | 3-10 min |
| **Mindfulness** | Body scan, loving-kindness, awareness | 5-20 min |
| **Movement** | Stretching, progressive muscle relaxation, tai chi | 5-15 min |
| **Cognitive** | Thought challenging, perspective taking | 5-10 min |
| **Behavioral** | Activity scheduling, behavioral activation | 10-30 min |

**Exercise Template:**

```typescript
interface ExerciseGuide {
  id: string;
  title: string;
  category: 'breathing' | 'grounding' | 'mindfulness' | 'movement' | 'cognitive' | 'behavioral';
  duration: number; // in seconds
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bestFor: string[]; // emotions it helps
  instructions: Step[];
  timer?: boolean;
  audio?: string; // URL to guided audio
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Step {
  order: number;
  instruction: string;
  duration?: number; // in seconds
  cue?: string; // audio cue or notification
}
```

**Components to Build:**

```typescript
// New Component: ExerciseLibrary.jsx
// Props: emotion (optional filter)
// Displays: Grid/list of available exercises

// New Component: ExerciseGuide.jsx
// Props: exercise, onComplete
// Displays: Step-by-step guided exercise with timer

// New Component: BreathingVisualizer.jsx
// Props: pattern (box, 4-7-8, etc)
// Displays: Animated circle for breath pacing

// New Component: BodyScanGuide.jsx
// Props: onComplete
// Displays: Progressive body scan with audio guidance

// New Component: ExerciseProgress.jsx
// Props: userId
// Displays: Which exercises user has completed
```

**Database Schema Addition:**

```prisma
model ExerciseCompletion {
  id              Int       @id @default(autoincrement())
  userId          Int
  exerciseId      String
  timestamp       DateTime  @default(now())
  
  durationCompleted Int     // How much they completed (seconds)
  feedback        String?   // How helpful was it? 1-5
  notes           String?
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([exerciseId])
  @@index([timestamp])
}
```

**Implementation Steps:**
1. Create exercise library data structure
2. Build guided exercise components
3. Add timer and animation logic
4. Implement exercise tracking
5. Add progress dashboard

---

### 4. Goal Tracking System

**Purpose:** Help users set and achieve meaningful goals

**Goal Types:**
- **Emotion Goals:** "Reduce anxiety episodes from 5/week to 2/week"
- **Behavior Goals:** "Exercise 3x per week"
- **Habit Goals:** "Meditate daily"
- **Relationship Goals:** "Have weekly lunch with friend"
- **Wellness Goals:** "Sleep 8 hours consistently"

**SMART Goal Framework:**
- **S**pecific: Clear, well-defined
- **M**easurable: Has quantifiable metrics
- **A**chievable: Realistic
- **R**elevant: Matters to the user
- **T**ime-bound: Has a deadline

**Components to Build:**

```typescript
// New Component: GoalCreation.jsx
// Wizard to guide SMART goal setting
// Includes emotion-based suggestions

// New Component: GoalCard.jsx
// Props: goal, onUpdate, onComplete, onDelete
// Displays: Goal with progress bar, checkins

// New Component: GoalProgress.jsx
// Props: goal
// Displays: Historical progress with notes

// New Component: GoalCheckin.jsx
// Props: goal, onSubmit
// Displays: Form to log progress

// New Component: GoalsDashboard.jsx
// Props: goals
// Displays: Active goals with progress
```

**Database Schema Addition:**

```prisma
model Goal {
  id              Int       @id @default(autoincrement())
  userId          Int
  timestamp       DateTime  @default(now())
  
  title           String
  description     String?
  category        String    // emotion, behavior, habit, etc
  emotion         String?   // related emotion if applicable
  
  // SMART framework
  specific        String    // The goal statement
  measureable     String    // How to measure success
  targetMetric    Float?    // Target number
  currentMetric   Float     @default(0)
  unit            String    // "times/week", "hours", "%", etc
  
  // Timeline
  startDate       DateTime
  targetDate      DateTime
  completedDate   DateTime?
  
  status          String    @default("active") // active, completed, paused, abandoned
  
  // Tracking
  checkIns        GoalCheckIn[]
  progress        Float     @default(0) // 0-1
  
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
  @@index([targetDate])
}

model GoalCheckIn {
  id              Int       @id @default(autoincrement())
  goalId          Int
  timestamp       DateTime  @default(now())
  
  metricValue     Float
  notes           String?
  emotion         String?   // How they felt during progress
  
  goal            Goal      @relation(fields: [goalId], references: [id], onDelete: Cascade)
  
  @@index([goalId])
  @@index([timestamp])
}
```

**Implementation Steps:**
1. Create Goal and GoalCheckIn models
2. Build goal creation wizard
3. Implement progress tracking
4. Add goal reminders
5. Create achievement celebrations

---

## 🔄 Integration Points

### With Phase 3 Services

```
User Action → Phase 3 Service → Phase 4 Feature

Message received
    ↓
EmotionAI Service
    ↓
Emotional Patterns Identified
    ↓
Dashboard Updates (triggers, trends)
    ↓
Journal Prompts Suggested
    ↓
Goal Relevant Exercises Recommended
```

### Data Flow Example

```
1. User has anxious message
   ↓
2. EmotionAI Service: "anxiety (0.8 intensity)"
   ↓
3. Memory Service: "Common triggers: work deadlines"
   ↓
4. Dashboard: Show anxiety spike, suggest related entries
   ↓
5. Journal: "You mentioned work before. What changed?"
   ↓
6. Exercises: "Try box breathing (helps anxiety)"
   ↓
7. Goals: "Track your 'Reduce anxiety' goal"
```

---

## 📚 API Endpoints Needed

### Analytics
- `GET /api/analytics/emotions?range=7d`
- `GET /api/analytics/triggers?limit=10`
- `GET /api/analytics/strategies-effectiveness`
- `GET /api/analytics/summary`

### Journal
- `POST /api/journal/entries` - Create entry
- `GET /api/journal/entries?emotion=anxiety&limit=10`
- `GET /api/journal/entries/:id` - Get single entry
- `PUT /api/journal/entries/:id` - Update entry
- `DELETE /api/journal/entries/:id`
- `GET /api/journal/search?query=work`

### Exercises
- `GET /api/exercises?category=breathing`
- `GET /api/exercises?bestFor=anxiety`
- `POST /api/exercises/:id/complete` - Log completion
- `GET /api/user/exercise-history`

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals?status=active`
- `PUT /api/goals/:id` - Update goal
- `POST /api/goals/:id/checkin` - Log progress
- `GET /api/goals/:id/progress` - Get goal history

---

## 🎨 UI/UX Considerations

### Dashboard Layout

```
┌─────────────────────────────────────────────┐
│          Mind Matrix Dashboard              │
├─────────────────────────────────────────────┤
│                                              │
│  Emotion Timeline  │  Top Triggers          │
│  [Chart]          │  [Word Cloud]           │
│                   │                         │
├─────────────────────────────────────────────┤
│                                              │
│  Coping Strategies │  This Week's Goals     │
│  [Ranking]        │  [Progress Bars]       │
│                   │                         │
├─────────────────────────────────────────────┤
│                                              │
│  Quick Actions:                             │
│  [New Journal] [Start Exercise] [Set Goal]  │
│                                              │
└─────────────────────────────────────────────┘
```

### Mobile Responsiveness
- Stack charts vertically
- Simplified views for small screens
- Bottom tab navigation
- Swipeable card interfaces

### Accessibility
- High contrast colors
- ARIA labels
- Keyboard navigation
- Text alternatives for charts

---

## 🧪 Testing Strategy

### Unit Tests
- Analytics calculation functions
- Goal progress logic
- Exercise timer functionality
- Journal search

### Integration Tests
- End-to-end goal creation and tracking
- Journal entry with emotion tagging
- Exercise completion tracking
- Dashboard data aggregation

### User Tests
- Navigation intuitiveness
- Prompt helpfulness
- Exercise clarity
- Goal motivation

---

## 📊 Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Dashboard Load Time | < 2s | Week 3 |
| Journal Entry Creation | < 10 clicks | Week 1 |
| Exercise Completion Rate | > 80% | Week 3 |
| Goal Adherence | > 60% | Ongoing |
| User Session Duration | + 50% | Week 3 |

---

## 🚀 Deployment Strategy

### Week 1: Dashboard & Analytics
1. Build analytics components
2. Integrate with Phase 3 data
3. Add filters and date range
4. Deploy to staging

### Week 2: Journaling & Exercises
1. Build journal components
2. Create exercise library
3. Integrate exercise tracking
4. Add progress visualization

### Week 3: Goals & Polish
1. Build goal tracking
2. Add reminder system
3. Integrate all features
4. Performance optimization
5. Deploy to production

---

## 💾 Database Migrations Needed

```bash
# Create migrations in order:
npx prisma migrate dev --name add_journal_entries
npx prisma migrate dev --name add_goal_tracking
npx prisma migrate dev --name add_exercise_tracking
npx prisma migrate dev --name add_indexes_for_analytics
```

---

## 📦 Dependencies to Add

```json
{
  "recharts": "^2.10.0",
  "react-calendar": "^4.2.0",
  "uuid": "^9.0.0",
  "date-fns": "^2.30.0"
}
```

---

## 🔐 Privacy & Security

- All data stays on device (optional cloud sync)
- Journal entries private by default
- No data sharing without consent
- GDPR compliance for data export
- Encryption for sensitive data

---

## 📈 Future Enhancements (Phase 5+)

- AI-generated insights ("You're 40% more anxious on Mondays")
- Predictive recommendations ("You might benefit from exercise now")
- Social features (optional goal sharing)
- Mobile app (native React Native)
- Community forums (moderated)
- Integration with wearables (health data)
- Therapist collaboration (if licensed version)

---

## 📞 Known Blockers / Risks

| Risk | Mitigation |
|------|-----------|
| Performance with large datasets | Implement pagination and caching |
| Complex charting logic | Use proven library (Recharts) |
| Mobile responsiveness | Mobile-first development |
| User adoption of features | Onboarding tutorial, tooltips |

---

## ✅ Phase 4 Completion Checklist

- [ ] All 4 features implemented (Dashboard, Journal, Exercises, Goals)
- [ ] Database migrations applied
- [ ] All API endpoints functional
- [ ] React components rendering correctly
- [ ] Phase 3 integration working smoothly
- [ ] Mobile responsive design complete
- [ ] Performance optimized (< 2s load times)
- [ ] Accessibility standards met
- [ ] User testing completed
- [ ] Documentation written
- [ ] Deployed to staging
- [ ] Final review and approval
- [ ] Deployed to production

---

**Next Steps:**
1. Start with Enhanced Analytics Dashboard (Week 1)
2. Build database schema for journals and goals
3. Create React components
4. Integrate with Phase 3 backend
5. User testing and refinement

**Estimated Completion:** March 9, 2026

---

*Created: Feb 16, 2026*  
*Phase 3 Status: ✅ Complete*  
*Ready for Phase 4 implementation*
