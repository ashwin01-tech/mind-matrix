import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsDashboard = ({ emotion, emotionIntensity, messages }) => {
    // Simple stats calculation
    const messageCount = messages.length;
    const userMessages = messages.filter(m => m.role === 'user').length;
    const aiMessages = messages.filter(m => m.role === 'assistant').length;

    return (
        <div className="analytics-dashboard">
            <motion.div
                className="card emotion-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h3>Current Emotional State</h3>
                <div className="emotion-display">
                    <div className="emotion-icon" style={{ fontSize: '4rem' }}>
                        {emotion === 'happy' ? '😊' :
                            emotion === 'sad' ? '😔' :
                                emotion === 'angry' ? '😠' :
                                    emotion === 'anxious' ? '😰' :
                                        emotion === 'calm' ? '😌' : '😐'}
                    </div>
                    <div className="emotion-details">
                        <h4>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</h4>
                        <div className="intensity-bar-container">
                            <span>Intensity</span>
                            <div className="intensity-bar">
                                <div
                                    className="intensity-fill"
                                    style={{ width: `${emotionIntensity * 100}%`, backgroundColor: 'var(--accent-color)' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="stats-grid">
                <motion.div
                    className="card stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h4>Total Messages</h4>
                    <span className="stat-value">{messageCount}</span>
                </motion.div>

                <motion.div
                    className="card stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h4>User Inputs</h4>
                    <span className="stat-value">{userMessages}</span>
                </motion.div>

                <motion.div
                    className="card stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h4>AI Responses</h4>
                    <span className="stat-value">{aiMessages}</span>
                </motion.div>
            </div>

            <motion.div
                className="card insights-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <h3>Insights</h3>
                <p>Your conversation patterns indicate a stable emotional baseline. Try discussing your hobbies to explore more positive emotional states.</p>
            </motion.div>
        </div>
    );
};

export default AnalyticsDashboard;
