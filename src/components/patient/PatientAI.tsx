'use client';
import React, { useState } from 'react';
import { Send } from 'lucide-react';

export function PatientAI() {
    const [messages, setMessages] = useState([{ role: 'ai', text: 'Hello James. I am your NeuroPath AI rehab assistant. How can I help you today?' }]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput('');
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: 'I understand. I advise you to continue your shoulder depression exercises to relieve pressure. Shall I queue a video demonstration?' }]);
        }, 1000);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-pat-bg text-pat-text relative pb-20 lg:pb-0">
            <div className="bg-gradient-to-br from-[#1c3557] to-[#1e4a7a] px-5 py-4 shrink-0 lg:sticky lg:top-0 lg:z-50 shadow-md">
                <div className="text-10 text-white/50 font-medium tracking-[0.5px] uppercase mb-0.5">AI-Powered</div>
                <div className="text-20 font-extrabold text-white tracking-tight leading-tight">Rehab Assistant 🧠</div>
                <div className="text-11 text-white/60 mt-1">Evidence-based SCI guidance</div>
            </div>

            <div className="flex-1 w-full max-w-800px mx-auto flex flex-col pt-4 px-2 lg:px-4 mb-15 lg:mb-20">
                <div className="flex-1 p-2 lg:p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-26px h-26px rounded-lg flex items-center justify-center text-12 shrink-0 ${m.role === 'user' ? 'bg-pat-navy text-white' : 'bg-pat-card border border-pat-border'}`}>
                                {m.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className={`text-12 leading-[1.55] px-3.5 py-2.5 rounded-2xl max-w-82pct font-medium ${m.role === 'user' ? 'bg-pat-navy text-white rounded-br-sm shadow-sm' : 'bg-pat-card border border-pat-border text-pat-text rounded-bl-sm shadow-sm'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed lg:sticky bottom-15 md:bottom-0 left-0 right-0 p-3 lg:p-4 bg-pat-bg/90 backdrop-blur-md border-t border-pat-border lg:border-none z-40">
                <div className="w-full max-w-800px mx-auto bg-pat-card border border-pat-border rounded-2xl p-1.5 flex gap-2 shadow-sm">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about your recovery..."
                        className="flex-1 bg-transparent px-3 py-2 text-13 outline-none font-sora placeholder:text-pat-muted"
                    />
                    <button onClick={handleSend} className="w-38px h-38px bg-pat-blue rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm hover:bg-blue-600 transition-colors">
                        <Send size={16} className="-ml-px mt-px" />
                    </button>
                </div>
            </div>
        </div>
    );
}
