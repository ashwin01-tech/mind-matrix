# Changelog

All notable changes to the Mind Matrix project.

## [3.0.0] - 2026-02-15

### 🚀 Major Upgrade: Emotional Intelligence & Memory Management

This release introduces advanced AI capabilities with emotional awareness, memory management, and expressive visualization.

### ✨ Added

#### Backend - Emotion & Expression
- **EmotionAnalyzer**: 8-emotion classification (happy, sad, angry, anxious, calm, curious, confident, neutral)
- **Sentiment Analysis**: Polarity scoring (-1 to 1 scale)
- **Speaking Style Detection**: Formality, verbosity, enthusiasm, politeness analysis
- **Emotion Triggers**: Automatic trigger identification (work, relationship, health, finance, technology)
- **Voice Expression Mapping**: Laughing, coughing, jiggling based on emotion/intensity
- **Emotion-Aware Voice Settings**: Dynamic stability and similarity adjustments for ElevenLabs

#### Backend - Memory Management
- **Enhanced Database Schema**:
  - `UserActivity` table: Comprehensive activity logging
  - `ConversationEmbedding` table: Vector storage for RAG
  - Enhanced `Conversation` table: Emotion metadata, sentiment scores
  - Enhanced `User` table: Personality traits, speaking style, preferences
  - Enhanced `EmotionLog` table: Triggers, trends, duration estimates
- **RAGContextBuilder**: Semantic search with cosine similarity
- **Emotional Context Aggregation**: Emotion trends and historical analysis
- **Activity-based Personality Tracking**: Exponential moving average updates

#### Backend - Integration
- **Personality-Aware System Prompts**: Inject emotion, style, preferences into AI prompts
- **Context-Aware Message Building**: RAG-based relevant context retrieval
- **Emotion Tracking Pipeline**: Analyze → Store → Adapt → Respond
- **Voice Expression Selection**: Dynamic expression generation based on detected emotion

#### Frontend - Visualization
- **Expressive Particle Sphere**: 2000-5000 particles (configurable by intensity)
  - 8 emotion-specific color palettes
  - Dynamic particle physics with gravity and damping
  - Expression-specific animations (laughing, coughing, jiggling)
  - Pulsating effects when speaking
  - Emotion-aware automatic rotation
- **Emotion Indicator**: Status bar showing current detected emotion
- **Message Emotional Metadata**: Display emotion context in chat

#### Configuration
- `ENABLE_EMOTION_TRACKING`: Enable/disable emotion detection
- `ENABLE_ACTIVITY_LOGGING`: Enable/disable activity logging
- `ENABLE_PERSONALITY_ADAPTATION`: Enable/disable personality tailoring
- `VOICE_EXPRESSIONS_ENABLED`: Enable/disable voice expressions
- `RAG_CONTEXT_SIZE`: Number of relevant contexts (default: 5)
- `RAG_SIMILARITY_THRESHOLD`: Relevance cutoff (default: 0.6)
- `RAG_LOOKBACK_DAYS`: Historical depth (default: 30)
- `MEMORY_TYPE`: sqlite_rag, embeddings, or hybrid (default: sqlite_rag)

#### Dependencies
- `scikit-learn==1.3.2`: Similarity calculations
- `numpy==1.24.3`: Numerical operations
- `sentence-transformers==2.2.2`: Optional advanced embeddings

### 📝 Changed

- **System Prompt**: Now dynamically includes emotional context and user preferences
- **Text-to-Speech**: Voice settings adapt to emotion and intensity
- **WebSocket Messages**: Added emotion, intensity, expression fields to responses
- **User Profiles**: Now track speaking style evolution with exponential averaging
- **AI Service**: Integrated emotion analyzer and RAG context builder

### 🔧 Configuration Changed
- New `.env.example` with 8+ memory management options
- Enhanced logging with feature status on startup
- New health endpoint includes memory feature status

### 📦 New Files
- `backend/emotion_analyzer.py` (350+ lines): Core emotion analysis and RAG
- `frontend/src/components/ParticleSphere.jsx` (200+ lines): Expressive particle system
- `UPGRADE_GUIDE_v3.md` (400+ lines): Complete upgrade documentation

### 🐛 Technical Details

**Emotion Detection Pipeline**:
```
User Input → Keyword Matching → Intensity Calculation → Trigger Identification → Store in DB
```

**RAG Context Pipeline**:
```
User Query → Embedding Similarity → Temporal Filtering → Relevance Ranking → Context Injection
```

**Personality Adaptation**:
```
Analyze Speaking Style → EMA Update User Profile → Inject into System Prompt → Generate Response
```

---

## [2.0.0] - 2026-02-15

### 🎉 Complete Refactoring

This release represents a complete rewrite and refactoring of the Mind Matrix project, transforming it from a non-functional prototype to a production-ready application.

### ✨ Added

#### Backend
- **Configuration System**: Centralized config with `config.py` and `.env` support
- **Robust Error Handling**: Custom exceptions and comprehensive error responses
- **Connection Manager**: WebSocket connection pooling and management
- **Health Endpoints**: `/health` endpoint for monitoring
- **Heartbeat System**: WebSocket ping/pong for connection health
- **Input Validation**: Message length and content validation
- **Logging System**: Structured logging with configurable levels
- **Startup Scripts**: `start.sh` and `start.fish` for easy launching

#### Frontend
- **WebSocket Manager**: Auto-reconnection with exponential backoff
- **Audio Manager**: Proper MP3 playback with chunk concatenation
- **Connection Status**: Visual indicator for connection state
- **Error Banner**: User-friendly error notifications
- **Audio Controls**: Volume slider and stop button
- **Typing Indicator**: Visual feedback when AI is responding
- **Message Timestamps**: Time display for each message

- **Welcome Screen**: Onboarding message for new users
- **Responsive Design**: Mobile-friendly layout
- **Startup Scripts**: `start.sh` and `start.fish` for easy launching

#### Documentation
- **Main README**: Comprehensive project documentation
- **Backend README**: Backend-specific documentation
- **Frontend README**: Frontend-specific documentation
- **Refactoring Summary**: Detailed changes documentation
- **Quick Start Script**: Interactive setup assistant

### 🔧 Fixed

#### Critical Bugs
- **Audio Playback**: Fixed MP3 chunk decoding (was completely broken)
  - Changed from Web Audio API to HTML5 Audio element
  - Implemented proper chunk concatenation
  - Added memory cleanup with URL revocation

- **WebSocket Connection**: Fixed connection reliability issues
  - Added automatic reconnection logic
  - Implemented connection state management
  - Added heartbeat monitoring

- **Error Handling**: Fixed silent failures
  - Added user-facing error messages
  - Implemented error recovery
  - Added detailed logging

#### UI/UX Bugs
- **Message Rendering**: Fixed message bubble styling
- **Scroll Behavior**: Fixed auto-scroll to bottom
- **State Management**: Fixed React state update issues
- **Animation Glitches**: Fixed sphere animation stuttering

### 🚀 Improved

#### Code Quality
- Complete rewrite of backend services layer
- Refactored frontend components with hooks
- Added proper TypeScript-style JSDoc comments
- Implemented separation of concerns
- Added input sanitization
- Improved async/await patterns

#### Performance
- Optimized WebSocket message handling
- Reduced re-renders in React components
- Improved 3D sphere rendering
- Added efficient state updates

#### User Experience
- Professional glassmorphic UI design
- Smooth animations and transitions
- Clear status indicators
- Better error messages
- Responsive layout
- Touch-friendly controls

### 📦 Dependencies

#### Backend
- Pinned all dependency versions
- Added `pydantic-settings` for better config
- Updated to latest FastAPI and OpenAI client versions

#### Frontend
- Updated to React 19
- Using latest Three.js and React Three Fiber
- Updated Framer Motion for animations

### 🔐 Security
- Environment-based configuration
- API key validation
- Input length limits
- Content sanitization
- CORS configuration

### 📝 Documentation
- Added comprehensive README files
- Created API documentation
- Added troubleshooting guide
- Documented configuration options
- Added code comments

---

## [1.0.0] - Initial Release

### Issues in Original Version
- ❌ Audio completely non-functional
- ❌ No error handling
- ❌ No reconnection logic
- ❌ Childish UI design
- ❌ No input validation
- ❌ Missing configuration
- ❌ Poor code organization
- ❌ No documentation

**Note**: Version 1.0.0 was a non-functional prototype and has been completely replaced by version 2.0.0.
