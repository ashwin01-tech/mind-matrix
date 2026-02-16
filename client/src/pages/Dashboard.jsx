import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebSocketManager } from '../utils/websocket';
import { AudioManager } from '../utils/audio';
import Sidebar from '../components/Sidebar';
import MessageBubble from '../components/MessageBubble';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { Mic, MicOff, Send, Volume2, VolumeX, Menu } from 'lucide-react';
import '../index.css';
import '../App.css';

function Dashboard() {
    const [messages, setMessages] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [networkData, setNetworkData] = useState(null);
    const [advancedAnalytics, setAdvancedAnalytics] = useState(null);
    const [input, setInput] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [error, setError] = useState(null);
    const [volume, setVolume] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'analytics'

    // Emotion and expression tracking
    const [emotion, setEmotion] = useState('neutral');
    const [emotionIntensity, setEmotionIntensity] = useState(0.5);
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    const chatEndRef = useRef(null);
    const wsManagerRef = useRef(null);
    const audioManagerRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize managers
    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // In development, connect to backend on port 3000
        const isDevelopment = window.location.port === '5173';
        const host = isDevelopment ? 'localhost:3000' : window.location.host;
        const wsUrl = `${protocol}//${host}/ws/chat`;

        // Initialize audio manager
        try {
            audioManagerRef.current = new AudioManager();
            audioManagerRef.current.setPlaybackEndCallback(() => {
                setIsSpeaking(false);
            });
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            setError('Audio not supported in this browser');
        }

        // Initialize WebSocket manager
        wsManagerRef.current = new WebSocketManager(
            wsUrl,
            handleMessage,
            handleError,
            handleStatusChange
        );

        wsManagerRef.current.connect();

        // Check screen size for initial sidebar state
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }

        // Cleanup on unmount
        return () => {
            wsManagerRef.current?.close();
            audioManagerRef.current?.cleanup();
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        // Focus input on session switch
        if (currentSessionId) {
            inputRef.current?.focus();
        }
    }, [messages, activeTab, currentSessionId]);

    // Handle WebSocket messages
    const handleMessage = useCallback((data) => {
        // console.log('Received message:', data.type);

        switch (data.type) {
            case 'sessions':
                setSessions(data.content);
                break;

            case 'history':
                // Load chat history for a session
                setMessages(data.content);
                if (data.sessionId) {
                    setCurrentSessionId(data.sessionId);
                }
                break;

            case 'stream':
                // Handle streaming chunks in real-time
                setMessages((prev) => {
                    const lastMsg = prev[prev.length - 1];
                    // If last message is from assistant and recent, append to it
                    if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.complete) {
                        return [
                            ...prev.slice(0, -1),
                            {
                                ...lastMsg,
                                content: lastMsg.content + data.content
                            }
                        ];
                    }
                    // Otherwise create new streaming message
                    return [...prev, {
                        role: 'assistant',
                        content: data.content,
                        timestamp: data.timestamp || new Date().toISOString(),
                        emotion: emotion,
                        complete: false
                    }];
                });
                setIsTyping(false);
                break;

            case 'text':
                // Mark the streaming message as complete or add new message
                if (!data.sessionId || data.sessionId === currentSessionId) {
                    setMessages((prev) => {
                        const lastMsg = prev[prev.length - 1];
                        // If last message was streaming, mark it complete
                        if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.complete) {
                            return [
                                ...prev.slice(0, -1),
                                {
                                    ...lastMsg,
                                    content: data.content,
                                    complete: true,
                                    emotion: data.emotion || lastMsg.emotion,
                                }
                            ];
                        }
                        // Otherwise add new message
                        return [...prev, {
                            role: 'assistant',
                            content: data.content,
                            timestamp: data.timestamp || new Date().toISOString(),
                            emotion: data.emotion || emotion,
                            complete: true
                        }];
                    });
                    setIsTyping(false);

                    // Update UI emotion based on AI response
                    if (data.emotion) {
                        setEmotion(data.emotion);
                        setEmotionIntensity(data.emotion_intensity || 0.5);
                    }
                }
                break;

            case 'audio':
                // Check session match if possible (backend sends it?)
                if ((!data.sessionId || data.sessionId === currentSessionId) && voiceEnabled && audioManagerRef.current) {
                    audioManagerRef.current.addChunk(data.content);
                    setIsSpeaking(true);
                }
                break;

            case 'audio_end':
                if ((!data.sessionId || data.sessionId === currentSessionId) && voiceEnabled && audioManagerRef.current) {
                    audioManagerRef.current.playAudio().catch(err => {
                        console.error('Failed to play audio:', err);
                        setIsSpeaking(false);
                    });
                }
                break;

            case 'analytics_update':
                // We'll store this in a ref or state passed down to analytics
                // For simplicity, let's just log it or handle it in AnalyticsDashboard if we pass wsManager
                // Actually, AnalyticsDashboard asks for it via wsManager.send('get_analytics').
                // The response comes here.
                // We need state for analyticsData.
                setAnalyticsData({
                    stats: data.stats,
                    trends: data.trends,
                    insights: data.insights
                });
                break;

            case 'network_data':
                setNetworkData(data.data);
                break;

            case 'advanced_analytics':
                setAdvancedAnalytics(data.data);
                break;

            case 'error':
                setError(data.error);
                setIsTyping(false);
                setIsSpeaking(false);
                break;

            default:
                break;
        }
    }, [emotion, messages.length, currentSessionId, voiceEnabled]);

    const handleError = useCallback((errorMessage) => {
        setError(errorMessage);
        setIsTyping(false);
        setIsSpeaking(false);
    }, []);

    const handleStatusChange = useCallback((status) => {
        setConnectionStatus(status);
        if (status === 'connected') {
            setError(null);
        }
    }, []);

    // --- Chat Session Actions ---
    const handleCreateSession = () => {
        wsManagerRef.current?.send(JSON.stringify({ type: 'create_session' }));
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleSwitchSession = (sessionId) => {
        if (sessionId === currentSessionId) return;
        setMessages([]); // Clear current messages while loading
        wsManagerRef.current?.send(JSON.stringify({ type: 'switch_session', sessionId }));
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleDeleteSession = (sessionId) => {
        if (confirm('Are you sure you want to delete this chat?')) {
            wsManagerRef.current?.send(JSON.stringify({ type: 'delete_session', sessionId }));
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        if (connectionStatus !== 'connected') {
            setError('Not connected to server. Please wait...');
            return;
        }

        const userMessage = input.trim();

        // Add user message to UI immediately
        setMessages((prev) => [...prev, {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
            emotion: emotion
        }]);

        // Send to server
        const payload = JSON.stringify({
            type: 'text',
            content: userMessage,
            voiceEnabled: voiceEnabled
            // sessionId is implied by backend state, but strictly speaking we could send it.
            // backend uses closure 'currentSessionId'.
        });
        const sent = wsManagerRef.current?.send(payload);

        if (sent) {
            setInput('');
            setIsTyping(true);
            setError(null);
            // Resume audio context on user interaction
            audioManagerRef.current?.resumeContext();
        } else {
            setError('Failed to send message');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSwitchSession={handleSwitchSession}
                onCreateSession={handleCreateSession}
                onDeleteSession={handleDeleteSession}
            />

            {/* Main Content Area */}
            <main className="main-content">
                {/* Top Navigation Bar */}
                <header className="top-nav">
                    <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu size={24} />
                    </button>
                    <button
                        className="menu-btn"
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        title={voiceEnabled ? "Disable Voice" : "Enable Voice"}
                        style={{ marginLeft: '0.5rem' }}
                    >
                        {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                    <div className="context-title">
                        {activeTab === 'chat' ? 'New Conversation' : 'Emotional Analytics'}
                    </div>
                    <div className={`status-badge ${connectionStatus}`}>
                        {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="content-area">
                    {activeTab === 'analytics' ? (
                        <AnalyticsDashboard
                            emotion={emotion}
                            emotionIntensity={emotionIntensity}
                            messages={messages}
                            wsManager={wsManagerRef.current}
                            analyticsData={analyticsData}
                            networkData={networkData}
                            advancedAnalytics={advancedAnalytics}
                        />
                    ) : (
                        <>
                            {/* Chat Area */}
                            <div className="chat-viewport">
                                {messages.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="logo-placeholder">M</div>
                                        <h2>How are you feeling today?</h2>
                                    </div>
                                ) : (
                                    <div className="messages-list">
                                        {messages.map((msg, index) => (
                                            <MessageBubble key={index} message={msg} />
                                        ))}
                                        {isTyping && (
                                            <div className="typing-indicator-wrapper">
                                                <div className="typing-dot"></div>
                                                <div className="typing-dot"></div>
                                                <div className="typing-dot"></div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="input-area">
                                {error && (
                                    <div className="error-toast">
                                        <span>{error}</span>
                                        <button onClick={() => setError(null)}>×</button>
                                    </div>
                                )}

                                <div className="input-wrapper">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Message Mind Matrix..."
                                        rows="1"
                                        className="chat-textarea"
                                    />
                                    <button
                                        className={`send-btn ${input.trim() ? 'active' : ''}`}
                                        onClick={sendMessage}
                                        disabled={!input.trim()}
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                                <div className="input-footer">
                                    <p>AI can make mistakes. Please verify important information.</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
