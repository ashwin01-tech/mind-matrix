import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

    // Custom markdown components for better styling
    const markdownComponents = {
        h2: ({node, ...props}) => <h2 style={{ marginTop: '12px', marginBottom: '8px', fontSize: '1.2em', fontWeight: '600', color: '#333' }} {...props} />,
        h3: ({node, ...props}) => <h3 style={{ marginTop: '10px', marginBottom: '6px', fontSize: '1.1em', fontWeight: '600', color: '#444' }} {...props} />,
        ul: ({node, ...props}) => <ul style={{ marginLeft: '16px', marginBottom: '8px', listStyle: 'disc' }} {...props} />,
        ol: ({node, ...props}) => <ol style={{ marginLeft: '16px', marginBottom: '8px', listStyle: 'decimal' }} {...props} />,
        li: ({node, ...props}) => <li style={{ marginBottom: '4px', lineHeight: '1.4' }} {...props} />,
        p: ({node, ...props}) => <p style={{ marginBottom: '6px', lineHeight: '1.5' }} {...props} />,
        strong: ({node, ...props}) => <strong style={{ fontWeight: '600', color: '#222' }} {...props} />,
        em: ({node, ...props}) => <em style={{ fontStyle: 'italic', color: '#555' }} {...props} />,
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
                <div className="message-content">
                    {!isUser ? (
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                        >
                            {message.content}
                        </ReactMarkdown>
                    ) : (
                        message.content
                    )}
                </div>
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
