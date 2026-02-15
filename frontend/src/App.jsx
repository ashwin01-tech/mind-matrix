import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SphereComponent from './components/Sphere';
import { motion, AnimatePresence } from 'framer-motion';
import { WebSocketManager } from './utils/websocket';
import { AudioManager } from './utils/audio';
import './index.css';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(1);
  
  const chatEndRef = useRef(null);
  const wsManagerRef = useRef(null);
  const audioManagerRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize managers
  useEffect(() => {
    const wsUrl = 'ws://localhost:8000/ws/chat';
    
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

    // Cleanup on unmount
    return () => {
      wsManagerRef.current?.close();
      audioManagerRef.current?.cleanup();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle WebSocket messages
  const handleMessage = useCallback((data) => {
    console.log('Received message:', data.type);

    switch (data.type) {
      case 'text':
        setMessages((prev) => [...prev, { 
          role: 'assistant', 
          content: data.content,
          timestamp: data.timestamp || new Date().toISOString()
        }]);
        setIsTyping(false);
        break;

      case 'audio':
        if (audioManagerRef.current) {
          audioManagerRef.current.addChunk(data.content);
          setIsSpeaking(true);
        }
        break;

      case 'audio_end':
        // Audio stream completed - now play the concatenated audio
        if (audioManagerRef.current) {
          audioManagerRef.current.playAudio().then(() => {
            console.log('Audio playback started');
          }).catch(err => {
            console.error('Failed to play audio:', err);
            setIsSpeaking(false);
          });
        }
        break;

      case 'error':
        console.error('Server error:', data.error, data.details);
        setError(data.error + (data.details ? `: ${data.details}` : ''));
        setIsTyping(false);
        setIsSpeaking(false);
        break;

      case 'warning':
        console.warn('Server warning:', data.content);
        break;

      case 'system':
        // Optional: Show system messages
        console.log('System:', data.content);
        break;

      case 'ping':
        // Heartbeat, no action needed
        break;

      default:
        console.warn('Unknown message type:', data.type);
    }
  }, []);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    setIsTyping(false);
    setIsSpeaking(false);
  }, []);

  const handleStatusChange = useCallback((status) => {
    console.log('Connection status:', status);
    setConnectionStatus(status);
    
    if (status === 'connected') {
      setError(null);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Check connection
    if (connectionStatus !== 'connected') {
      setError('Not connected to server. Please wait...');
      return;
    }

    const userMessage = input.trim();
    
    // Add user message to UI
    setMessages((prev) => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);
    
    // Send to server
    const sent = wsManagerRef.current?.send(userMessage);
    
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

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioManagerRef.current?.setVolume(newVolume);
  };

  const stopAudio = () => {
    audioManagerRef.current?.stop();
    setIsSpeaking(false);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="app-container">
      {/* 3D Background */}
      <div className="canvas-background">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a777e3" />
          <SphereComponent isSpeaking={isSpeaking} />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>

      {/* Connection Status Indicator */}
      <div className={`status-indicator status-${connectionStatus}`}>
        <div className="status-dot"></div>
        <span>{connectionStatus}</span>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="error-banner"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <span>{error}</span>
            <button onClick={clearError} className="error-close">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <main className="chat-overlay">
        <div className="chat-container glass-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="header-content">
              <h1 className="chat-title">Mind Matrix</h1>
              <p className="chat-subtitle">Your AI Companion</p>
            </div>
            
            {/* Audio Controls */}
            <div className="audio-controls">
              {isSpeaking && (
                <button onClick={stopAudio} className="stop-audio-btn" title="Stop audio">
                  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                </button>
              )}
              <div className="volume-control">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {messages.length === 0 && (
              <div className="welcome-message">
                <h2>Welcome to Mind Matrix</h2>
                <p>Ask me anything, and I'll respond with both text and voice.</p>
              </div>
            )}
            
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`message-bubble ${msg.role}`}
                >
                  <div className="message-content">{msg.content}</div>
                  <div className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                className="typing-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span></span>
                <span></span>
                <span></span>
              </motion.div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Container */}
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask anything..."
              className="chat-input"
              rows="1"
              disabled={connectionStatus !== 'connected'}
            />
            <button 
              onClick={sendMessage} 
              className="send-button"
              disabled={!input.trim() || connectionStatus !== 'connected'}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
