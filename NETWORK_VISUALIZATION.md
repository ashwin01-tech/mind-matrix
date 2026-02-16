# Neural Network Visualization

An advanced 3D interactive visualization of your conversation network powered by Three.js and ForceGraph3D.

## 🌟 Features

### Connection Modes

#### 1. Neural Network Mode (Default)
Creates intelligent multi-layered connections:
- **Temporal Links**: Sequential message flow (consecutive messages)
- **Conversational Links**: User ↔ AI response pairs (strongest connections)
- **Emotional Links**: Connects messages with similar emotions within context window
- **Session Links**: Clusters messages within same chat session

#### 2. Temporal Mode
Traditional linear timeline showing chronological message order.

#### 3. Emotional Groups Mode
Groups and connects messages by emotional similarity.

### Interactive Features

#### Node Interaction
- **Click**: View detailed information about any message
- **Drag**: Reposition nodes in 3D space
- **Hover**: See message preview tooltip

#### Node Details Panel
When you click a node, you get:
- Message ID for reference
- Role (User or AI Assistant)
- Emotion with intensity percentage
- Full message content
- Timestamp
- Session ID
- **Quick Actions**:
  - Go to Chat (navigate to that session)
  - Copy Message to clipboard

### Visual Encoding

#### Node Colors by Emotion
- 🟢 **Green** (#4ade80): Happy, positive emotions
- 🔵 **Blue** (#60a5fa): Sad, melancholic emotions
- 🔴 **Red** (#f87171): Angry, frustrated emotions
- 🟣 **Purple** (#a78bfa): Anxious, worried emotions
- 🟢 **Cyan** (#34d399): Calm, peaceful emotions
- ⚪ **Gray** (#9ca3af): Neutral emotions

#### Node Size
Node size scales with emotional intensity:
- Larger nodes = Higher emotional intensity
- Smaller nodes = Lower emotional intensity

#### Link Colors by Type
- **Blue** (rgba(102, 126, 234, 0.6)): Conversational pairs
- **Yellow** (rgba(251, 191, 36, 0.4)): Emotional connections
- **White** (rgba(255, 255, 255, 0.2)): Temporal/sequential

#### Link Properties
- Thickness indicates connection strength
- Animated particles flow through links
- Directional particles show conversation flow

### Filtering System

#### Filter by Emotion
- All Emotions (default)
- Happy
- Sad
- Angry
- Anxious
- Calm
- Neutral

#### Filter by Role
- All Messages (default)
- User Only
- AI Only

Filters apply in real-time, dynamically updating the graph.

### Control Panel

#### Graph Controls
- **Play/Pause**: Control physics simulation
- **Refresh**: Reload data from server
- **Export**: Download graph data as JSON
- **Info**: Toggle statistics panel

#### Statistics
- Total Nodes
- Total Links
- User Messages count
- AI Messages count
- Unique Emotions tracked

### Navigation

#### Camera Controls
- **Left Click + Drag**: Rotate view
- **Right Click + Drag**: Pan view
- **Scroll**: Zoom in/out
- **Auto-focus**: Click node to auto-center camera

#### Keyboard Shortcuts
- `Space`: Play/Pause simulation
- `R`: Refresh data
- `E`: Export data
- `I`: Toggle info panel

## 🎯 Use Cases

### 1. Conversation Analysis
Visualize how conversations flow and identify patterns in emotional responses.

### 2. Emotion Tracking
See clusters of similar emotions and understand emotional journeys.

### 3. Session Review
Identify distinct conversation sessions and their characteristics.

### 4. Pattern Recognition
Discover recurring topics or emotional patterns through visual clustering.

### 5. AI Response Analysis
See how AI responses connect to user inputs and emotional states.

## 🔧 Technical Details

### Data Structure

#### Node Properties
```javascript
{
  id: number,              // Message ID
  group: 1 | 2,           // 1 = User, 2 = AI
  emotion: string,        // Emotion label
  intensity: number,      // 0.0 - 1.0
  val: number,           // Visual size
  name: string,          // "User" or "AI"
  content: string,       // Message preview
  fullContent: string,   // Complete message
  timestamp: string,     // ISO timestamp
  sessionId: number      // Chat session ID
}
```

#### Link Properties
```javascript
{
  source: number,        // Source node ID
  target: number,        // Target node ID
  value: number,        // Connection strength (1-3)
  type: string          // "temporal", "conversational", "emotional", "session"
}
```

### Performance

- Optimized for up to 200 messages
- Dynamic LOD (Level of Detail) based on zoom
- GPU-accelerated rendering via WebGL
- Efficient data structures with memoization
- Real-time physics simulation with configurable damping

### Backend API

The visualization connects via WebSocket to:
```
ws://localhost:3000/ws/chat
```

#### Messages
**Request:**
```json
{ "type": "get_network_data" }
```

**Response:**
```json
{
  "type": "network_data",
  "data": {
    "nodes": [...],
    "links": [...]
  }
}
```

## 🚀 Getting Started

1. Navigate to the dashboard
2. Click "Neural Network" in the sidebar
3. Or directly visit `/network` route
4. Interact with the visualization using mouse/touch controls

## 📊 Best Practices

1. **Start with Neural Network mode** for comprehensive insights
2. **Use filters** to focus on specific emotions or roles
3. **Click nodes** to dive deep into individual messages
4. **Pause simulation** when analyzing specific patterns
5. **Export data** for external analysis or backup

## 🎨 Customization

The visualization uses a dark theme optimized for:
- Reduced eye strain during extended use
- High contrast for better node visibility
- Glass morphism for modern aesthetic
- Smooth animations for professional feel

## 🐛 Troubleshooting

### Graph not loading
- Ensure WebSocket connection is active (check browser console)
- Verify backend server is running on port 3000
- Check that you have chat history in the database

### Performance issues
- Reduce number of messages (backend limits to 200)
- Pause physics simulation when not needed
- Close other browser tabs
- Disable browser extensions that may interfere

### WebGL warnings
- Normal when graph initializes with empty data
- Warnings disappear once data loads
- Update graphics drivers if persistent

## 🔮 Future Enhancements

- [ ] VR/AR mode for immersive exploration
- [ ] Time-based playback showing conversation evolution
- [ ] Sentiment analysis overlays
- [ ] Multi-user collaboration views
- [ ] AI-generated insights from network patterns
- [ ] Custom color schemes
- [ ] Advanced graph algorithms (clustering, community detection)
- [ ] Export as image/video
- [ ] Network comparison tools
