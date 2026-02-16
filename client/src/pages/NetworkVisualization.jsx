import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { ArrowLeft, Filter, X, MessageSquare } from 'lucide-react';
import '../App.css';

const NetworkVisualization = () => {
    const navigate = useNavigate();
    const fgRef = useRef();
    
    const [networkData, setNetworkData] = useState(null);
    const [wsManager, setWsManager] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [selectedNode, setSelectedNode] = useState(null);
    const [filterEmotion, setFilterEmotion] = useState('all');
    const [filterDateRange, setFilterDateRange] = useState('all');
    const [filterSession, setFilterSession] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const retryTimeoutRef = useRef(null);
    
    // Get unique sessions from network data
    const uniqueSessions = React.useMemo(() => {
        if (!networkData || !networkData.nodes) return [];
        const sessions = new Set(networkData.nodes.map(n => n.sessionId).filter(Boolean));
        return Array.from(sessions).sort((a, b) => b - a);
    }, [networkData]);

    // Initialize WebSocket connection
    useEffect(() => {
        let ws = null;
        let retryCount = 0;
        const maxRetries = 5;

        const connect = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const isDevelopment = window.location.port === '5173';
            const host = isDevelopment ? 'localhost:3000' : window.location.host;
            const wsUrl = `${protocol}//${host}/ws/chat`;

            setConnectionStatus('connecting');
            ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                console.log('Connected to WebSocket');
                setConnectionStatus('connected');
                retryCount = 0;
                // Request network data
                ws.send(JSON.stringify({ type: 'get_network_data' }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'network_data') {
                        console.log('Received network data:', {
                            nodes: data.data?.nodes?.length || 0,
                            links: data.data?.links?.length || 0
                        });
                        setNetworkData(data.data);
                    }
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus('error');
            };

            ws.onclose = () => {
                console.log('WebSocket closed');
                setConnectionStatus('disconnected');
                
                if (retryCount < maxRetries) {
                    retryCount++;
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                    console.log(`Retrying connection in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
                    retryTimeoutRef.current = setTimeout(connect, delay);
                } else {
                    setConnectionStatus('failed');
                }
            };

            setWsManager(ws);
        };

        connect();

        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            if (ws) {
                ws.close();
            }
        };
    }, []);

    // Prepare graph data with filtering
    const graphData = React.useMemo(() => {
        if (!networkData || !networkData.nodes || !networkData.links) return { nodes: [], links: [] };
        
        // Show both user (group 1) and AI (group 2) messages
        let filteredNodes = networkData.nodes;
        
        // Filter by session
        if (filterSession !== 'all') {
            filteredNodes = filteredNodes.filter(node => node.sessionId === parseInt(filterSession));
        }
        
        // Filter by date range
        if (filterDateRange !== 'all' && filteredNodes.length > 0) {
            const now = new Date();
            const cutoffDate = new Date();
            
            switch (filterDateRange) {
                case 'today':
                    cutoffDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
            }
            
            if (filterDateRange !== 'all') {
                filteredNodes = filteredNodes.filter(node => {
                    const nodeDate = new Date(node.timestamp);
                    return nodeDate >= cutoffDate;
                });
            }
        }
        
        // Filter by emotion only if not 'all' and only for user messages
        if (filterEmotion !== 'all') {
            filteredNodes = filteredNodes.filter(node => 
                node.group === 2 || node.emotion === filterEmotion
            );
        }
        
        // Filter links to only include those between filtered nodes
        const nodeIds = new Set(filteredNodes.map(n => n.id));
        const filteredLinks = networkData.links.filter(link => 
            nodeIds.has(link.source.id || link.source) && nodeIds.has(link.target.id || link.target)
        );
        
        return {
            nodes: filteredNodes.map(node => ({ ...node })),
            links: filteredLinks.map(link => ({ ...link }))
        };
    }, [networkData, filterEmotion, filterDateRange, filterSession]);

    // Handle node click
    const handleNodeClick = (node) => {
        setSelectedNode(node);
        // Focus camera on node
        if (fgRef.current) {
            const distance = 200;
            fgRef.current.cameraPosition(
                { x: node.x, y: node.y, z: node.z + distance },
                node,
                1000
            );
        }
    };

    // Go to chat with this message
    const goToChat = () => {
        if (selectedNode && selectedNode.sessionId) {
            navigate(`/app?session=${selectedNode.sessionId}`);
        } else {
            navigate('/app');
        }
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <motion.header
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                style={{
                    padding: '1rem 2rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/app')}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: '"Orbitron", sans-serif', color: 'white' }}>
                        Neural Conversation Network
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: connectionStatus === 'connected' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: 'white'
                    }}>
                        {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            background: showFilters ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Filter size={16} />
                        Filters
                    </button>
                </div>
            </motion.header>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ x: 300 }}
                        animate={{ x: 0 }}
                        exit={{ x: 300 }}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: '80px',
                            width: '280px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                            padding: '1.5rem',
                            zIndex: 50,
                            maxHeight: 'calc(100vh - 80px)',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'white' }}>Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                                Date Range
                            </label>
                            <select
                                value={filterDateRange}
                                onChange={(e) => setFilterDateRange(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    marginBottom: '1rem'
                                }}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                                Chat Session
                            </label>
                            <select
                                value={filterSession}
                                onChange={(e) => setFilterSession(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    marginBottom: '1rem'
                                }}
                            >
                                <option value="all">All Sessions</option>
                                {uniqueSessions.map(sessionId => (
                                    <option key={sessionId} value={sessionId}>
                                        Session {sessionId}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                                User Emotion
                            </label>
                            <select
                                value={filterEmotion}
                                onChange={(e) => setFilterEmotion(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">All Emotions</option>
                                <option value="happy">😊 Happy</option>
                                <option value="sad">😔 Sad</option>
                                <option value="angry">😠 Angry</option>
                                <option value="anxious">😰 Anxious</option>
                                <option value="calm">😌 Calm</option>
                                <option value="neutral">😐 Neutral</option>
                            </select>
                        </div>

                        <div style={{ 
                            padding: '1rem',
                            background: 'rgba(102, 126, 234, 0.1)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            color: 'rgba(255,255,255,0.7)'
                        }}>
                            <strong style={{ color: 'white', display: 'block', marginBottom: '0.5rem' }}>Network Info:</strong>
                            <strong style={{ color: 'white' }}>Total Nodes:</strong> {graphData.nodes.length}<br/>
                            <strong style={{ color: 'white' }}>User Messages:</strong> {graphData.nodes.filter(n => n.group === 1).length}<br/>
                            <strong style={{ color: 'white' }}>AI Responses:</strong> {graphData.nodes.filter(n => n.group === 2).length}<br/>
                            <strong style={{ color: 'white' }}>Connections:</strong> {graphData.links.length}
                        </div>
                        
                        <div style={{ marginTop: '1rem' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>Legend:</strong>
                            <div style={{ fontSize: '0.8rem', lineHeight: '1.8' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#a78bfa' }}></div>
                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>🤖 AI Responses</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80' }}></div>
                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>😊 Happy</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#60a5fa' }}></div>
                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>😔 Sad</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f87171' }}></div>
                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>😠 Angry</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fbbf24' }}></div>
                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>😰 Anxious</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#34d399' }}></div>
                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>😌 Calm</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#9ca3af' }}></div>
                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>😐 Neutral</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Node Details Panel */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: '80px',
                            width: '350px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRight: '1px solid rgba(255,255,255,0.1)',
                            padding: '1.5rem',
                            zIndex: 50,
                            maxHeight: 'calc(100vh - 80px)',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: 'white' }}>Message Details</h3>
                            <button
                                onClick={() => setSelectedNode(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Emotion Display */}
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                                {selectedNode.emotion === 'happy' ? '😊' :
                                 selectedNode.emotion === 'sad' ? '😔' :
                                 selectedNode.emotion === 'angry' ? '😠' :
                                 selectedNode.emotion === 'anxious' ? '😰' :
                                 selectedNode.emotion === 'calm' ? '😌' : '😐'}
                            </div>
                            <div style={{ 
                                fontSize: '1.2rem', 
                                fontWeight: 'bold', 
                                color: selectedNode.emotion === 'happy' ? '#4ade80' :
                                       selectedNode.emotion === 'sad' ? '#60a5fa' :
                                       selectedNode.emotion === 'angry' ? '#f87171' :
                                       selectedNode.emotion === 'anxious' ? '#a78bfa' :
                                       selectedNode.emotion === 'calm' ? '#34d399' : '#9ca3af',
                                marginBottom: '0.25rem'
                            }}>
                                {selectedNode.emotion ? selectedNode.emotion.toUpperCase() : 'UNKNOWN'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                Intensity: {((selectedNode.intensity || 0.5) * 100).toFixed(0)}%
                            </div>
                        </div>

                        {/* Message Content */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                YOUR MESSAGE
                            </label>
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                color: 'white',
                                lineHeight: '1.6',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {selectedNode.content || 'No content available'}
                            </div>
                        </div>

                        {/* Metadata */}
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Message ID:</strong>{' '}
                                <span style={{ color: 'white' }}>{selectedNode.id}</span>
                            </div>
                            {selectedNode.timestamp && (
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Time:</strong>{' '}
                                    <span style={{ color: 'white' }}>
                                        {new Date(selectedNode.timestamp).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {selectedNode.sessionId && (
                                <div>
                                    <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Session:</strong>{' '}
                                    <span style={{ color: 'white' }}>{selectedNode.sessionId}</span>
                                </div>
                            )}
                        </div>

                        {/* Insights */}
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(102, 126, 234, 0.1)',
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
                                💡 Insights
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                                This message shows <strong>{selectedNode.emotion || 'neutral'}</strong> emotion
                                {selectedNode.intensity && selectedNode.intensity > 0.7 && ' with high intensity'}
                                {selectedNode.intensity && selectedNode.intensity < 0.3 && ' with low intensity'}.
                                {selectedNode.emotion === 'anxious' && ' Consider tracking anxiety patterns over time.'}
                                {selectedNode.emotion === 'angry' && ' Strong emotions detected - may benefit from reflection.'}
                                {selectedNode.emotion === 'sad' && ' Emotional patterns can help identify triggers.'}
                                {selectedNode.emotion === 'happy' && ' Positive emotional state - great moment!'}
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={goToChat}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <MessageSquare size={18} />
                            Go to Chat
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Graph Container */}
            <div style={{ flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!networkData || !networkData.nodes || networkData.nodes.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '1.2rem'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧠</div>
                        <p>No network data available yet.</p>
                        <p style={{ fontSize: '1rem' }}>Start chatting to build your conversation network!</p>
                    </div>
                ) : (
                    <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '12px', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: '#0f172a'
                    }}>
                        <ForceGraph3D
                            ref={fgRef}
                            graphData={graphData}
                            nodeLabel={node => `
                                <div style="background: rgba(0,0,0,0.9); padding: 12px; border-radius: 8px; max-width: 200px;">
                                    <div style="font-weight: bold; margin-bottom: 6px; color: ${
                                        node.group === 2 ? '#a78bfa' : // AI messages - purple
                                        node.emotion === 'happy' ? '#4ade80' :
                                        node.emotion === 'sad' ? '#60a5fa' :
                                        node.emotion === 'angry' ? '#f87171' :
                                        node.emotion === 'anxious' ? '#a78bfa' :
                                        node.emotion === 'calm' ? '#34d399' : '#9ca3af'
                                    };">
                                        ${node.group === 2 ? '🤖 AI RESPONSE' : (node.emotion ? node.emotion.toUpperCase() : 'NEUTRAL')}
                                    </div>
                                    <div style="font-size: 12px; color: rgba(255,255,255,0.9);">
                                        ${(node.content || '').substring(0, 100)}${node.content && node.content.length > 100 ? '...' : ''}
                                    </div>
                                </div>
                            `}
                            nodeColor={node => {
                                // AI messages - unique purple color
                                if (node.group === 2) return '#a78bfa';
                                
                                // User messages - emotion-based colors
                                switch (node.emotion) {
                                    case 'happy': return '#4ade80';
                                    case 'sad': return '#60a5fa';
                                    case 'angry': return '#f87171';
                                    case 'anxious': return '#fbbf24';
                                    case 'calm': return '#34d399';
                                    case 'neutral': return '#9ca3af';
                                    default: return '#9ca3af';
                                }
                            }}
                            nodeVal={node => (node.intensity || 0.5) * 8 + 2}
                            nodeRelSize={6}
                            nodeOpacity={0.9}
                            onNodeClick={handleNodeClick}
                            onNodeHover={node => {
                                document.body.style.cursor = node ? 'pointer' : 'default';
                            }}
                            linkColor={() => 'rgba(255,255,255,0.2)'}
                            linkWidth={1.5}
                            linkDirectionalParticles={2}
                            linkDirectionalParticleSpeed={0.005}
                            linkDirectionalParticleWidth={2}
                            backgroundColor="#0f172a"
                            enableNodeDrag={true}
                            enableNavigationControls={true}
                            showNavInfo={false}
                            d3AlphaDecay={0.01}
                            d3VelocityDecay={0.3}
                            d3Force={{
                                charge: { strength: -120 },
                                link: { distance: 80 },
                                center: { strength: 0.5 }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkVisualization;
