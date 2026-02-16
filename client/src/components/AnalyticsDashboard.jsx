import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { WebSocketManager } from '../utils/websocket';
import NeuralNetworkGraph from './NeuralNetworkGraph';
import ErrorBoundary from './ErrorBoundary';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsDashboard = ({ emotion, emotionIntensity, messages, wsManager, analyticsData, networkData, advancedAnalytics }) => {
    // const [stats, setStats] = useState(null);
    // const [trends, setTrends] = useState([]);
    // const [insights, setInsights] = useState(null);
    // const [loading, setLoading] = useState(true);

    const stats = analyticsData?.stats;
    const trends = analyticsData?.trends || [];
    const insights = analyticsData?.insights;

    useEffect(() => {
        if (wsManager) {
            // Request analytics data on mount
            wsManager.send(JSON.stringify({ type: 'get_analytics' }));
            // Request network data
            wsManager.send(JSON.stringify({ type: 'get_network_data' }));
            // Request advanced analytics
            wsManager.send(JSON.stringify({ type: 'get_advanced_analytics' }));
        }
    }, [wsManager]);

    // HACK: For now, if messages are passed, let's derive some basic stats client-side 
    // while waiting for backend integration in Dashboard.

    // BUT! I modified chat.handler to send 'analytics_update'.
    // `Dashboard.jsx` needs to handle 'analytics_update' and pass it here.
    // I will leave this component expecting headers like 'stats', 'trends', 'insights' 
    // and modify Dashboard to pass them.

    // Wait, let's look at props: { emotion, emotionIntensity, messages, wsManager }
    // I need to update Dashboard to pass 'analyticsData'.

    return (
        <div className="analytics-dashboard" style={{ padding: '2rem', color: 'white', overflowY: 'auto', height: '100%' }}>
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem', fontFamily: '"Orbitron", sans-serif' }}
            >
                AI Insights & Analytics
            </motion.h2>

            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* 1. Real-time Emotion Card */}
                <motion.div
                    className="card glass-panel"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}
                >
                    <h3>Current State</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '1rem' }}>
                        <div style={{ fontSize: '4rem' }}>
                            {emotion === 'happy' ? '😊' :
                                emotion === 'sad' ? '😔' :
                                    emotion === 'angry' ? '😠' :
                                        emotion === 'anxious' ? '😰' :
                                            emotion === 'calm' ? '😌' : '😐'}
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-color)' }}>{emotion.toUpperCase()}</h4>
                            <p>Intensity: {(emotionIntensity * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Message Statistics (Client calculated for immediate feedback) */}
                <motion.div
                    className="card glass-panel"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}
                >
                    <h3>Session Stats</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold' }}>{messages.length}</span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Total Msgs</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold' }}>
                                {messages.filter(m => m.role === 'user').length}
                            </span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>User Inputs</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '2rem', fontWeight: 'bold' }}>
                                {messages.filter(m => m.role === 'assistant').length}
                            </span>
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>AI Responses</span>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Emotional Trends Chart */}
                <motion.div
                    className="card glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ gridColumn: '1 / -1', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.05)', minHeight: '300px' }}
                >
                    <h3>Emotional Trends (Session)</h3>
                    <div style={{ height: '250px', marginTop: '1rem' }}>
                        {(() => {
                            const trendData = messages
                                .filter(m => m.role === 'user' && m.emotion_intensity !== undefined)
                                .map((m, i) => ({
                                    name: `Msg ${i + 1}`,
                                    intensity: m.emotion_intensity || 0.5,
                                    emotion: m.emotion || 'neutral'
                                }));
                            
                            if (trendData.length === 0) {
                                return (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                                            <p>Send messages to see emotional trends</p>
                                        </div>
                                    </div>
                                );
                            }
                            
                            return (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#888"
                                            style={{ fontSize: '0.75rem' }}
                                        />
                                        <YAxis 
                                            stroke="#888"
                                            domain={[0, 1]}
                                            ticks={[0, 0.25, 0.5, 0.75, 1]}
                                            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                                            style={{ fontSize: '0.75rem' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value, name, props) => [
                                                `${(value * 100).toFixed(0)}%`,
                                                `Intensity (${props.payload.emotion})`
                                            ]}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="intensity" 
                                            stroke="#00C49F" 
                                            strokeWidth={2} 
                                            activeDot={{ r: 8 }}
                                            dot={{ r: 4, fill: '#00C49F' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            );
                        })()}
                    </div>
                </motion.div>

                {/* 4. Neural Network Visualization */}
                <motion.div
                    className="card glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    style={{ gridColumn: '1 / -1', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.05)', minHeight: '500px' }}
                >
                    <h3>Neural Conversation Network</h3>
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <strong style={{ marginRight: '1rem' }}>Legend:</strong>
                        <span style={{ marginRight: '1rem' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#a78bfa', marginRight: '4px' }}></span>
                            🤖 AI
                        </span>
                        <span style={{ marginRight: '1rem' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80', marginRight: '4px' }}></span>
                            😊 Happy
                        </span>
                        <span style={{ marginRight: '1rem' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa', marginRight: '4px' }}></span>
                            😔 Sad
                        </span>
                        <span style={{ marginRight: '1rem' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#f87171', marginRight: '4px' }}></span>
                            😠 Angry
                        </span>
                        <span style={{ marginRight: '1rem' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24', marginRight: '4px' }}></span>
                            😰 Anxious
                        </span>
                        <span style={{ marginRight: '1rem' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', marginRight: '4px' }}></span>
                            😌 Calm
                        </span>
                        <span>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#9ca3af', marginRight: '4px' }}></span>
                            😐 Neutral
                        </span>
                    </div>
                    <ErrorBoundary>
                        {networkData ? (
                            <NeuralNetworkGraph data={networkData} />
                        ) : (
                            <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Loading Network Data...
                            </div>
                        )}
                    </ErrorBoundary>
                </motion.div>

                {/* 5. Advanced Analytics Grid (New) */}

                {/* 5a. Mood Forecast */}
                <motion.div
                    className="card glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ padding: '1.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255, 128, 66, 0.1), rgba(255, 255, 255, 0.05))' }}
                >
                    <h3>Mood Forecast</h3>
                    {advancedAnalytics?.moodPrediction ? (
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: advancedAnalytics.moodPrediction.trend === 'Intensifying' ? '#FF8042' : '#00C49F' }}>
                                {advancedAnalytics.moodPrediction.trend}
                            </div>
                            <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>{advancedAnalytics.moodPrediction.forecast}</p>
                        </div>
                    ) : (
                        <p>Gathering enough data...</p>
                    )}
                </motion.div>

                {/* 5b. Emotional Balance (Radar Chart) */}
                <motion.div
                    className="card glass-panel"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    style={{ gridRow: 'span 2', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.05)' }}
                >
                    <h3>Emotional Balance</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={advancedAnalytics?.emotionalBalance || []}>
                                <PolarGrid stroke="#4B5563" />
                                <PolarAngleAxis dataKey="emotion" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                <Radar name="Emotions" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#F3F4F6' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 5c. Word Cloud (Simple Implementation) */}
                <motion.div
                    className="card glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ gridColumn: '1 / -1', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.05)' }}
                >
                    <h3>Topic Analysis</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '1rem', justifyContent: 'center' }}>
                        {advancedAnalytics?.wordCloud && advancedAnalytics.wordCloud.length > 0 ? (
                            advancedAnalytics.wordCloud.map((word, index) => (
                                <span
                                    key={index}
                                    style={{
                                        fontSize: `${Math.max(0.8, Math.min(2.5, 0.8 + (word.value * 0.2)))}rem`,
                                        color: COLORS[index % COLORS.length],
                                        padding: '4px 8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '4px',
                                        cursor: 'default'
                                    }}
                                    title={`Count: ${word.value}`}
                                >
                                    {word.text}
                                </span>
                            ))
                        ) : (
                            <p>No enough data for topic analysis yet.</p>
                        )}
                    </div>
                </motion.div>

                {/* 6. AI Insights */}
                <motion.div
                    className="card glass-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    style={{ gridColumn: '1 / -1', padding: '1.5rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(3, 179, 195, 0.1), rgba(255, 255, 255, 0.05))' }}
                >
                    <h3 style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '10px' }}>🧠</span>
                        Psychological Profile & Insights
                    </h3>
                    <div className="insights-content" style={{ marginTop: '1rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
                        {insights ? (
                            <p>{insights}</p>
                        ) : (
                            <p style={{ fontStyle: 'italic', opacity: 0.7 }}>
                                Analyzing conversation patterns... (Data will appear here once backend is connected fully)
                            </p>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default AnalyticsDashboard;
