'use client';
import { useState, useEffect, useRef } from 'react';
import Layout from '@/app/components/Layout';
import { UserCircleIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

export default function CrmPage() {
    const [activePlatform, setActivePlatform] = useState('whatsapp');
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = async (isInitialLoad = false) => {
        try {
            const res = await fetch(`/api/crm/conversations?platform=${activePlatform}`);
            const newChats = await res.json();
            
            if (!Array.isArray(newChats)) return;

            setChats(newChats);

            if (isInitialLoad) {
                setSelectedChat(null);
                setMessages([]);
            }
        } catch (err) {
            console.error("Inbox Load Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchConversations(true);
        const interval = setInterval(() => fetchConversations(false), 10000); 
        return () => clearInterval(interval);
    }, [activePlatform]);

    useEffect(() => {
        if (!selectedChat) return;
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/crm/messages?conversationId=${selectedChat.id}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                    setTimeout(scrollToBottom, 100);
                }
            } catch (err) { console.error(err); }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [selectedChat]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        const tempMsg = { id: Date.now(), direction: 'outbound', content: newMessage, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');
        setTimeout(scrollToBottom, 100);
        
        try {
            await fetch('/api/crm/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId: selectedChat.id, text: tempMsg.content })
            });
        } catch (err) { alert("Error sending message"); }
    };

    return (
        <Layout>
            <div className="h-[calc(100vh-140px)] flex bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                    
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" /> Unified Inbox
                        </h2>
                        
                        <div className="flex bg-gray-200 p-1 rounded-lg">
                            <button
                                onClick={() => setActivePlatform('whatsapp')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
                                    activePlatform === 'whatsapp' 
                                    ? 'bg-white text-green-700 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5" alt="WA" />
                                WhatsApp
                            </button>
                            
                            <button
                                onClick={() => setActivePlatform('facebook')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
                                    activePlatform === 'facebook' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" className="w-5 h-5" alt="FB" />
                                Messenger
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {loading && <div className="p-4 text-sm text-gray-500 animate-pulse">Loading {activePlatform}...</div>}
                        
                        {!loading && chats.length === 0 && (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No {activePlatform === 'whatsapp' ? 'WhatsApp' : 'Facebook'} chats found.
                            </div>
                        )}

                        {chats.map(chat => (
                            <div 
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${selectedChat?.id === chat.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-semibold text-gray-900">{chat.contact_name || chat.external_id}</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(chat.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{chat.last_message}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-2/3 flex flex-col bg-gray-50">
                    {selectedChat ? (
                        <>
                            <div className="p-4 bg-white border-b border-gray-200 shadow-sm z-10 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <UserCircleIcon className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{selectedChat.contact_name || selectedChat.external_id}</h3>
                                        <span className="text-xs text-gray-400 capitalize">{activePlatform} Conversation</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                                {messages.map((msg, idx) => (
                                    <div key={msg.id || idx} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                                            msg.direction === 'outbound' 
                                                ? (activePlatform === 'whatsapp' ? 'bg-green-600' : 'bg-blue-600') + ' text-white rounded-br-none' 
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                        }`}>
                                            <p>{msg.content || msg.text}</p>
                                            <p className={`text-[10px] mt-1 text-right opacity-70`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-white border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input 
                                        type="text" 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={`Message ${activePlatform === 'whatsapp' ? '(WhatsApp)' : '(Messenger)'}...`}
                                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <button type="submit" className={`p-3 rounded-xl hover:opacity-90 text-white ${activePlatform === 'whatsapp' ? 'bg-green-600' : 'bg-blue-600'}`}>
                                        <PaperAirplaneIcon className="w-6 h-6" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
                            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300" />
                            <p>Select a {activePlatform} conversation to start.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}