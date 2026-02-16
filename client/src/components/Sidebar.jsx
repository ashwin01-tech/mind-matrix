import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart2, Plus, User, Trash2, Search, X, Network } from 'lucide-react';

const Sidebar = ({
    isOpen,
    toggleSidebar,
    activeTab,
    setActiveTab,
    sessions = [],
    currentSessionId,
    onSwitchSession,
    onCreateSession,
    onDeleteSession
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const filteredSessions = sessions.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.aside
            className={`sidebar ${isOpen ? 'open' : 'closed'}`}
            initial={false}
            animate={{ width: isOpen ? 260 : 0, opacity: isOpen ? 1 : 0 }}
        >
            <div className="sidebar-header">
                <div className="logo-area">
                    <h2>Mind Matrix</h2>
                </div>
                <button className="new-chat-btn" onClick={onCreateSession}>
                    <Plus size={16} />
                    New Chat
                </button>
            </div>

            <div className="sidebar-content">
                <div className="nav-section">
                    <div className="search-bar" style={{
                        marginBottom: '1rem',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        padding: '0.5rem'
                    }}>
                        <Search size={16} style={{ color: 'rgba(255,255,255,0.4)', marginRight: '0.5rem' }} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                width: '100%',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        {searchTerm && (
                            <X
                                size={14}
                                style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
                                onClick={() => setSearchTerm('')}
                            />
                        )}
                    </div>

                    <h3>Chats</h3>
                    <div className="history-list">
                        {filteredSessions.length > 0 ? (
                            filteredSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`history-item ${currentSessionId === session.id ? 'active' : ''}`}
                                    onClick={() => onSwitchSession(session.id)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        marginBottom: '0.25rem',
                                        background: currentSessionId === session.id ? 'rgba(3, 179, 195, 0.1)' : 'transparent',
                                        border: currentSessionId === session.id ? '1px solid rgba(3, 179, 195, 0.2)' : '1px solid transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                        <MessageSquare size={14} style={{ flexShrink: 0, marginRight: '8px', color: currentSessionId === session.id ? '#03b3c3' : 'inherit' }} />
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {session.title}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteSession(session.id);
                                        }}
                                        className="delete-chat-btn"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'rgba(255,255,255,0.3)',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.color = '#ff4d4d'}
                                        onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">No chats found</p>
                        )}
                    </div>
                </div>

                <div className="nav-section" style={{ marginTop: 'auto' }}>
                    <h3>Tools</h3>
                    <button
                        className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chat')}
                    >
                        <MessageSquare size={18} />
                        Chat
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        <BarChart2 size={18} />
                        Analytics
                    </button>
                    <button
                        className="nav-item"
                        onClick={() => navigate('/network')}
                        style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.3)'
                        }}
                    >
                        <Network size={18} />
                        Neural Network
                    </button>
                </div>
            </div>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">
                        <User size={20} />
                    </div>
                    <span>User</span>
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
