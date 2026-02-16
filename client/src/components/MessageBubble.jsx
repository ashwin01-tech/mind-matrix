import React from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';

    // Emotion-based styling for AI messages
    const getEmotionColor = (emotion, intensity) => {
        if (!emotion || isUser) return 'var(--primary-light)';

        const colors = {
            happy: `rgba(255, 215, 0, ${0.2 + intensity * 0.3})`,
            sad: `rgba(100, 149, 237, ${0.2 + intensity * 0.3})`,
            angry: `rgba(255, 99, 71, ${0.2 + intensity * 0.3})`,
            anxious: `rgba(221, 160, 221, ${0.2 + intensity * 0.3})`,
            calm: `rgba(144, 238, 144, ${0.2 + intensity * 0.3})`,
            curious: `rgba(255, 165, 0, ${0.2 + intensity * 0.3})`,
            neutral: 'var(--primary-light)'
        };

        return colors[emotion] || colors.neutral;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`message-wrapper ${isUser ? 'user' : 'ai'}`}
        >
            <div
                className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}
                style={{
                    backgroundColor: isUser ? 'var(--accent-color)' : getEmotionColor(message.emotion, 0.5),
                    boxShadow: !isUser && message.emotion ? `0 4px 15px ${getEmotionColor(message.emotion, 0.2)}` : 'none'
                }}
            >
                <div className="message-content">{message.content}</div>
                <div className="message-meta">
                    <span className="timestamp">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && message.emotion && message.emotion !== 'neutral' && (
                        <span className="emotion-tag">{message.emotion}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MessageBubble;
