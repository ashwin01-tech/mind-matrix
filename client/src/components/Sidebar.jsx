import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart2, History, Plus, User } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, activeTab, setActiveTab, history = [] }) => {
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
                <button className="new-chat-btn" onClick={() => console.log('New Chat')}>
                    <Plus size={16} />
                    New Chat
                </button>
            </div>

            <div className="sidebar-content">
                <div className="nav-section">
                    <h3><History size={14} style={{ display: 'inline', marginRight: '8px' }} /> History</h3>
                    <div className="history-list">
                        {history.length > 0 ? (
                            history.slice(0, 5).map((msg, i) => (
                                <div key={i} className="history-item">
                                    <MessageSquare size={14} />
                                    <span>{msg.content.substring(0, 20)}...</span>
                                </div>
                            ))
                        ) : (
                            <p className="empty-state">No recent history</p>
                        )}
                    </div>
                </div>

                <div className="nav-section">
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
