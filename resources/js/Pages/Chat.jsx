import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const PRESETS = [
    { label: '🌈 Rainbow', prompt: 'rainbow' },
    { label: '🔥 Fire',    prompt: 'fire' },
    { label: '🌊 Wave',    prompt: 'wave' },
    { label: '✨ Sparkle', prompt: 'sparkle' },
    { label: '💓 Pulse',  prompt: 'pulse' },
    { label: '🏃 Chase',  prompt: 'chase' },
];

export default function Chat({ auth }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm your AI animation assistant. Describe an LED animation and I'll generate it for you. Try: \"Create a fire effect\" or \"Make a rainbow wave\"" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [previewFrames, setPreviewFrames] = useState([]);
    const [playFrame, setPlayFrame] = useState(0);
    const chatRef = useRef(null);

    useEffect(() => {
        fetch('/api/devices', {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        }).then(r => r.json()).then(d => { setDevices(d); if (d.length) setSelectedDevice(d[0].id); });
    }, []);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    // Playback animation preview
    useEffect(() => {
        if (!previewFrames.length) return;
        const t = setInterval(() => setPlayFrame(f => (f + 1) % previewFrames.length), 120);
        return () => clearInterval(t);
    }, [previewFrames]);

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
    };

    const sendPrompt = async (text) => {
        if (!text.trim()) return;
        const userMsg = { role: 'user', text };
        setMessages(m => [...m, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const devId = selectedDevice || 1;
            const r = await fetch(`/api/devices/${devId}/prompt`, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify({ prompt: text }),
            });
            const data = await r.json();
            const animation = data.animation;

            setPreviewFrames(animation?.frames || []);
            setPlayFrame(0);

            setMessages(m => [...m, {
                role: 'assistant',
                text: `✅ Generated **${(animation?.frames || []).length} frames** at ${animation?.fps} FPS! Preview is live below.`,
                animation,
            }]);
        } catch (e) {
            setMessages(m => [...m, { role: 'assistant', text: '❌ Error connecting to backend. Check your server.' }]);
        }
        setLoading(false);
    };

    const applyToDevice = async (animation) => {
        if (!selectedDevice) return alert('Select a device first!');
        await fetch(`/api/devices/${selectedDevice}/control`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ command: animation }),
        });
        setMessages(m => [...m, { role: 'assistant', text: '📡 Animation sent to device! It will auto-sync if device was offline.' }]);
    };

    return (
        <AuthenticatedLayout user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-white">AI Prompt Studio</h2>}>
            <Head title="AI Chat – NeoPixel Studio" />
            <div className="py-8 max-w-6xl mx-auto px-4 flex gap-6 flex-col lg:flex-row">

                {/* Chat Column */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ minHeight: '70vh' }}>
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        <div>
                            <h3 className="font-bold text-lg">✨ AI Scene Generator</h3>
                            <p className="text-xs opacity-75">Powered by built-in pattern intelligence</p>
                        </div>
                        <select value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)}
                            className="bg-white/20 text-white text-sm rounded-lg px-3 py-1.5 border border-white/30 focus:outline-none">
                            <option value="">No device</option>
                            {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>

                    {/* Messages */}
                    <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                                    msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                                }`}>
                                    <p>{msg.text}</p>
                                    {msg.animation && (
                                        <button onClick={() => applyToDevice(msg.animation)}
                                            className="mt-2 inline-block bg-emerald-500 text-white text-xs px-3 py-1 rounded-full hover:bg-emerald-600 transition font-semibold">
                                            📡 Apply to Device
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
                                    <div className="flex gap-1 items-center">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendPrompt(input)}
                            placeholder="Describe your animation... (e.g. blue fire wave)"
                            className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                        />
                        <button onClick={() => sendPrompt(input)}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow">
                            Send
                        </button>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-72 flex flex-col gap-4">
                    {/* Preset Buttons */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 text-sm uppercase tracking-wider">Quick Presets</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {PRESETS.map(p => (
                                <button key={p.prompt} onClick={() => sendPrompt(p.prompt)}
                                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-xl text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 hover:text-indigo-700 transition">
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Live Preview */}
                    {previewFrames.length > 0 && (
                        <div className="bg-gray-900 rounded-2xl p-4 shadow border border-gray-700">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Live Animation Preview</h4>
                            <div className="grid gap-0.5 rounded-xl overflow-hidden"
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)' }}>
                                {(previewFrames[playFrame]?.data || Array(64).fill('#000')).map((color, i) => (
                                    <div key={i} className="aspect-square rounded-sm transition-colors duration-75"
                                        style={{ backgroundColor: color, boxShadow: color !== '#000000' ? `0 0 6px ${color}` : 'none' }} />
                                ))}
                            </div>
                            <div className="mt-3 text-center">
                                <span className="text-xs text-gray-500">Frame {playFrame + 1}/{previewFrames.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
