import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ChatMessageLayer = ({ users = [], selectedUser, setSelectedUser }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!selectedUser) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${selectedUser.id},receiver_id.eq.${selectedUser.id}`)
                .order('created_at', { ascending: true })
                .limit(50);
            
            if (data) {
                setMessages(data);
            }
        };
        fetchMessages();
    }, [selectedUser]);

    return (
        <div className="chat-wrapper">
            <div className="chat-sidebar card">
                <div className="chat-sidebar-single active top-profile">
                    <div className="img">
                        <img src={selectedUser?.avatar_url || "assets/images/chat/1.png"} alt="image_icon" />
                    </div>
                    <div className="info">
                        <h6 className="text-md mb-0">{selectedUser?.name || "Select a user"}</h6>
                        <p className="mb-0">Available</p>
                    </div>
                    <div className="action">
                        <div className="btn-group">
                            <button
                                type="button"
                                className="text-secondary-light text-xl"
                                data-bs-toggle="dropdown"
                                data-bs-display="static"
                                aria-expanded="false"
                            >
                                <Icon icon="bi:three-dots" />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-lg-end border">
                                <li>
                                    <Link
                                        to={selectedUser ? `/users/${selectedUser.id}` : "#"}
                                        className="dropdown-item rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900 d-flex align-items-center gap-2"
                                    >
                                        <Icon icon="fluent:person-32-regular" />
                                        Profile
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* chat-sidebar-single end */}
                <div className="chat-search">
                    <span className="icon">
                        <Icon icon="iconoir:search" />
                    </span>
                    <input type="text" name="#0" autoComplete="off" placeholder="Search..." />
                </div>
                <div className="chat-all-list">
                    {users.map(user => (
                        <div 
                            key={user.id} 
                            className={`chat-sidebar-single ${selectedUser?.id === user.id ? 'active' : ''}`}
                            onClick={() => setSelectedUser && setSelectedUser(user)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="img">
                                <img src={user.avatar_url || "assets/images/chat/2.png"} alt="image_icon" />
                            </div>
                            <div className="info">
                                <h6 className="text-sm mb-1">{user.name}</h6>
                                <p className="mb-0 text-xs">Tap to view chat</p>
                            </div>
                            <div className="action text-end">
                                <p className="mb-0 text-neutral-400 text-xs lh-1"></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="chat-main card">
                <div className="chat-sidebar-single active">
                    <div className="img">
                        <img src="assets/images/chat/11.png" alt="image_icon" />
                    </div>
                    <div className="info">
                        <h6 className="text-md mb-0">{selectedUser?.name || "Kathryn Murphy"}</h6>
                        <p className="mb-0">Available</p>
                    </div>

                </div>
                {/* chat-sidebar-single end */}
                <div className="chat-message-list">
                    {messages.length === 0 ? (
                        <div className="text-center p-4 text-secondary-light">
                            {selectedUser ? "No messages found." : "Select a user to view messages."}
                        </div>
                    ) : (
                        messages.map(msg => {
                            const isLeft = msg.sender_id === selectedUser?.id;
                            return (
                                <div key={msg.id} className={`chat-single-message ${isLeft ? 'left' : 'right'}`}>
                                    {isLeft && (
                                        <img
                                            src={selectedUser?.avatar_url || "assets/images/chat/11.png"}
                                            alt="image_icon"
                                            className="avatar-lg object-fit-cover rounded-circle"
                                        />
                                    )}
                                    <div className="chat-message-content">
                                        <p className="mb-3">{msg.message_text || "..."}</p>
                                        <p className="chat-time mb-0">
                                            <span>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                <form className="chat-message-box">
                    <input type="text" name="chatMessage" placeholder="Write message" />
                    <div className="chat-message-box-action">
                        <button type="button" className="text-xl">
                            <Icon icon="ph:link" />
                        </button>
                        <button type="button" className="text-xl">
                            <Icon icon="solar:gallery-linear" />
                        </button>
                        <button
                            type="submit"
                            className="btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1"
                        >
                            Send
                            <Icon icon="f7:paperplane" />
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default ChatMessageLayer;