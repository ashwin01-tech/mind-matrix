import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SphereComponent from './components/Sphere';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ws, setWs] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8000/ws/chat');
    websocket.onmessage = (event) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: event.data }]);
    };
    setWs(websocket);
    return () => websocket.close();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Simple logic to simulate "speaking" when assistant messages arrive or during processing
    // For now, we can toggle it briefly when a message is sent/received
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      setIsSpeaking(true);
      const timer = setTimeout(() => setIsSpeaking(false), 3000); // Speak for 3s
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMsg]);
    if (ws) ws.send(input);
    setInput('');
  };

  return (
    <div className="app-container">
      <div className="canvas-background">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a777e3" />
          <SphereComponent isSpeaking={isSpeaking} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <main className="chat-overlay">
        <div className="chat-container glass-panel">
          <div className="messages-area">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`message-bubble ${msg.role}`}
                >
                  <div className="message-content">{msg.content}</div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything..."
              className="chat-input"
            />
            <button onClick={sendMessage} className="send-button">
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
